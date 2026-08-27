import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, type NewsItem } from "@/lib/news";
import { filterRelevantNews } from "@/lib/relevance-filter";
import { synthesizeBulletin, buildFallbackBulletin } from "@/lib/bulletin";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { sendTelegramMessage, telegramSiteCta, telegramContactCta, mainServicesKeyboard } from "@/lib/telegram";
import { sendPushToAll, type PushResult } from "@/lib/push";
import { postTextToX } from "@/lib/x";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import { translateBulletin, pickTranslation } from "@/lib/translateContent";
import { localePath } from "@/lib/i18n";

// Owned by Haber & Editöryal Departmanı (Elif Sarman) — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Dedup uses the same
// Postgres-backed store as market-analysis-share (no Upstash dependency).
//
// Changed on 2026-08-15: previously sent one Telegram digest linking out
// to each publisher's own article (external links). Per explicit request,
// that's a copyright/traffic-leak problem — now the run compiles the raw
// items into one original-prose bulletin (see lib/bulletin.ts, grounded
// synthesis only, no invented facts), publishes it on our own site first,
// and Telegram only gets a short teaser linking back to /haber-bulteni/
// [slug]. Source publishers are credited by name at the bottom of the
// bulletin page instead of being linked out to directly.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Per-bulletin cap, not a forced quota — we only ever include items that
// are both genuinely relevant and genuinely new. On a quiet news day this
// posts nothing, and that's the correct behavior.
const MAX_ITEMS_PER_BULLETIN = 8;

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9ığüşöç\s-]/gi, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  // Includes time-of-day (not just date) so multiple runs on the same
  // day — e.g. two quiet-news fallback bulletins with the same generic
  // title — don't collide on the slug's unique constraint.
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10);
  const timePart = now.toISOString().slice(11, 16).replace(":", "");
  return `${datePart}-${timePart}-${base || "piyasa-bulteni"}`;
}

export const GET = withCronErrorAlert("news-update", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await fetchAllNews();
  const relevant = filterRelevantNews(all);

  const fresh: NewsItem[] = [];
  for (const item of relevant) {
    if (fresh.length >= MAX_ITEMS_PER_BULLETIN) break;
    if (!(await isAlreadyPostedToTelegram(`news:${item.guid}`))) fresh.push(item);
  }

  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, posted: false, checkedRelevant: relevant.length });
  }

  const bulletin = (await synthesizeBulletin(fresh)) ?? buildFallbackBulletin(fresh);
  const sources = Array.from(new Set(fresh.map((item) => item.source)));
  const slug = slugify(bulletin.title);

  // Translated before the insert, not after: one row, written once, so a
  // reader on /ua never sees the Turkish version briefly and then the
  // Ukrainian one. A locale that fails is simply absent and falls back —
  // the news going out is not allowed to depend on a translation.
  const translations = await translateBulletin({
    title: bulletin.title,
    excerpt: bulletin.excerpt,
    body: bulletin.body,
  });

  await db.insert(newsBulletins).values({
    slug,
    title: bulletin.title,
    excerpt: bulletin.excerpt,
    body: bulletin.body,
    sources: JSON.stringify(sources),
    translations: Object.keys(translations).length ? JSON.stringify(translations) : null,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const text =
    `<b>${bulletin.title}</b>\n\n${bulletin.excerpt}\n\n` +
    `Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.\n\n` +
    `📰 Bültenin tamamı: ${siteUrl}/haber-bulteni/${slug}\n\n` +
    telegramSiteCta() +
    `\n\n${telegramContactCta()}`;

  await sendTelegramMessage(text, { inlineKeyboard: mainServicesKeyboard() });
  for (const item of fresh) {
    await markPostedToTelegram(`news:${item.guid}`);
  }

  // Same reach logic as blog-share: the bulletin is our own page, the push
  // links back to it. Twice-daily at most (the schedule in
  // news-update-cron.yml), and nothing at all on a quiet news day, since
  // the run returns early when there's nothing fresh. Best-effort — the
  // site page and the Telegram post have already gone out.
  let push: PushResult | { error: string };
  try {
    // Every locale's copy already exists — it was translated for the row
    // ten lines up. The URL is prefixed too: unprefixed it 308s to /tr, so
    // an Arabic reader tapping an Arabic notification landed on Turkish.
    push = await sendPushToAll((locale) => {
      const copy = pickTranslation(JSON.stringify(translations), locale, bulletin);
      return {
        title: copy.title,
        body: copy.excerpt,
        url: localePath(locale, `/haber-bulteni/${slug}`),
      };
    });
  } catch (err) {
    console.error("News bulletin push failed:", err);
    push = { error: err instanceof Error ? err.message : "unknown error" };
  }

  // No raw URL in the tweet body on purpose — X's algorithm suppresses
  // reach on link-containing posts, so every other X post in this codebase
  // (trade-signal, trade-result, technical-analysis-share) points readers
  // to the profile link instead. Best-effort: an X failure shouldn't fail
  // the whole cron run, since the site + Telegram post already succeeded.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    const cta = "📰 Daha fazlası için Web Sitemizi ziyaret edin. Link Bio'da!";
    const disclaimer = "Yatırım tavsiyesi değildir.";
    const budget = 280 - cta.length - disclaimer.length - 4; // 4 = two \n\n separators
    const title = bulletin.title.length > budget ? bulletin.title.slice(0, budget - 1) + "…" : bulletin.title;
    const tweetText = `${title}\n\n${disclaimer}\n\n${cta}`;
    xResult = await postTextToX(tweetText);
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  return NextResponse.json({
    ok: true,
    posted: true,
    slug,
    itemCount: fresh.length,
    checkedRelevant: relevant.length,
    push,
    xResult,
  });
});
