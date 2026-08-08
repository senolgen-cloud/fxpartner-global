import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, type NewsItem } from "@/lib/news";
import { filterRelevantNews } from "@/lib/relevance-filter";
import { translateToTurkish } from "@/lib/translate";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { sendTelegramMessage, telegramSiteCta } from "@/lib/telegram";

// Owned by Haber & Editöryal Departmanı (Elif Sarman) — see
// src/lib/departments.ts and docs/ORGANIZATION.md. Dedup uses the same
// Postgres-backed store as market-analysis-share (no Upstash dependency).
// Scheduled every 3h as of 2026-08-08 (targets ~5-6+ posts/day); still
// throws until DEEPL_API_KEY is set in production — see translate.ts.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Deliberately capped, not a forced quota — we only ever post items that
// are both genuinely relevant and genuinely new. On a quiet news day this
// posts nothing, and that's the correct behavior.
const MAX_POSTS_PER_RUN = 3;

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await fetchAllNews();
  const relevant = filterRelevantNews(all);

  const fresh: NewsItem[] = [];
  for (const item of relevant) {
    if (fresh.length >= MAX_POSTS_PER_RUN) break;
    if (!(await isAlreadyPostedToTelegram(`news:${item.guid}`))) fresh.push(item);
  }

  const posted: string[] = [];
  for (const item of fresh) {
    const [titleTr, descTr] = await translateToTurkish([item.title, item.description]);

    const text =
      `<b>${titleTr}</b>\n\n${descTr}\n\n` +
      `Kaynak: ${item.source}\n` +
      `<a href="${item.link}">Orijinal haberi oku</a>\n\n` +
      `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n\n` +
      telegramSiteCta();

    await sendTelegramMessage(text);
    await markPostedToTelegram(`news:${item.guid}`);
    posted.push(item.title);
  }

  return NextResponse.json({ ok: true, posted, checkedRelevant: relevant.length });
}
