import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, type NewsItem } from "@/lib/news";
import { filterRelevantNews } from "@/lib/relevance-filter";
import { translateToTurkish } from "@/lib/translate";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { sendTelegramMessage, telegramSiteCta } from "@/lib/telegram";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Haber & Editöryal Departmanı (Elif Sarman) — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Dedup uses the same
// Postgres-backed store as market-analysis-share (no Upstash dependency).
//
// Was previously one Telegram message per item, every 3h, up to 3/run —
// up to ~24 separate notifications/day in the worst case. That flooded
// the channel and risked subscribers muting/leaving, drowning out the
// signals/campaigns/analysis content that's the actual point of the
// channel. Switched on 2026-08-10 to a twice-daily digest: one message
// bundling every fresh item since the last run (still throws until
// DEEPL_API_KEY is set in production — see translate.ts).
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Per-digest cap, not a forced quota — we only ever include items that are
// both genuinely relevant and genuinely new. On a quiet news day this
// posts nothing, and that's the correct behavior.
const MAX_ITEMS_PER_DIGEST = 5;

export const GET = withCronErrorAlert("news-update", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await fetchAllNews();
  const relevant = filterRelevantNews(all);

  const fresh: NewsItem[] = [];
  for (const item of relevant) {
    if (fresh.length >= MAX_ITEMS_PER_DIGEST) break;
    if (!(await isAlreadyPostedToTelegram(`news:${item.guid}`))) fresh.push(item);
  }

  if (fresh.length === 0) {
    return NextResponse.json({ ok: true, posted: [], checkedRelevant: relevant.length });
  }

  // One translate call for the whole batch (title+description pairs,
  // flattened) instead of one call per item — fewer DeepL requests, and
  // the digest only sends once every item is ready rather than trickling
  // out partial translations.
  const translatedPairs = await translateToTurkish(
    fresh.flatMap((item) => [item.title, item.description])
  );

  const entries = fresh.map((item, i) => {
    const titleTr = translatedPairs[i * 2];
    const descTr = translatedPairs[i * 2 + 1];
    return (
      `<b>${titleTr}</b>\n${descTr}\n` +
      `Kaynak: ${item.source} — <a href="${item.link}">Habere git</a>`
    );
  });

  const text =
    `<b>Günün öne çıkan haberleri</b>\n\n` +
    entries.join("\n\n") +
    `\n\nBu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n\n` +
    telegramSiteCta();

  await sendTelegramMessage(text);
  for (const item of fresh) {
    await markPostedToTelegram(`news:${item.guid}`);
  }

  return NextResponse.json({
    ok: true,
    posted: fresh.map((item) => item.title),
    checkedRelevant: relevant.length,
  });
});
