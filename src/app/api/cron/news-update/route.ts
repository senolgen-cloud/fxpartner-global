import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, type NewsItem } from "@/lib/news";
import { filterRelevantNews } from "@/lib/relevance-filter";
import { translateToTurkish } from "@/lib/translate";
import { isAlreadyPosted, markAsPosted } from "@/lib/posted-store";
import { sendTelegramMessage } from "@/lib/telegram";

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
    if (!(await isAlreadyPosted(item.guid))) fresh.push(item);
  }

  const posted: string[] = [];
  for (const item of fresh) {
    const [titleTr, descTr] = await translateToTurkish([item.title, item.description]);

    const text =
      `<b>${titleTr}</b>\n\n${descTr}\n\n` +
      `Kaynak: ${item.source}\n` +
      `<a href="${item.link}">Orijinal haberi oku</a>\n\n` +
      `fxpartner.tr | Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.`;

    await sendTelegramMessage(text);
    await markAsPosted(item.guid);
    posted.push(item.title);
  }

  return NextResponse.json({ ok: true, posted, checkedRelevant: relevant.length });
}
