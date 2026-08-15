import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, type NewsItem } from "@/lib/news";
import { filterRelevantNews } from "@/lib/relevance-filter";
import { synthesizeBulletin, buildFallbackBulletin } from "@/lib/bulletin";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { sendTelegramMessage, telegramSiteCta, mainServicesKeyboard } from "@/lib/telegram";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

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
  const datePart = new Date().toISOString().slice(0, 10);
  return `${datePart}-${base || "piyasa-bulteni"}`;
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

  await db.insert(newsBulletins).values({
    slug,
    title: bulletin.title,
    excerpt: bulletin.excerpt,
    body: bulletin.body,
    sources: JSON.stringify(sources),
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const text =
    `<b>${bulletin.title}</b>\n\n${bulletin.excerpt}\n\n` +
    `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n\n` +
    `📰 Bültenin tamamı: ${siteUrl}/haber-bulteni/${slug}\n\n` +
    telegramSiteCta();

  await sendTelegramMessage(text, { inlineKeyboard: mainServicesKeyboard() });
  for (const item of fresh) {
    await markPostedToTelegram(`news:${item.guid}`);
  }

  return NextResponse.json({
    ok: true,
    posted: true,
    slug,
    itemCount: fresh.length,
    checkedRelevant: relevant.length,
  });
});
