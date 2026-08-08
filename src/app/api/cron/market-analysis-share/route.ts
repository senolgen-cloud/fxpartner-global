import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, telegramSiteCta } from "@/lib/telegram";
import { sendPushToAll } from "@/lib/push";
import { marketAnalysisPosts } from "@/data/marketAnalysis";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Piyasa Analizi Departmanı — see src/lib/departments.ts and
// docs/ORGANIZATION.md. Announces the latest /piyasa-analizi entry to
// Telegram once it's live, so Telegram content isn't BTCUSD-only.
// Content is pre-written Turkish (no translation step) so dedup uses
// the Postgres-backed telegram-posted-store instead of Upstash, which
// isn't configured in this project (see news-update's blocker note).
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("market-analysis-share", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latest = marketAnalysisPosts[marketAnalysisPosts.length - 1];
  if (!latest) {
    return NextResponse.json({ ok: true, posted: false, reason: "no posts" });
  }

  const key = `market-analysis:${latest.slug}`;
  if (await isAlreadyPostedToTelegram(key)) {
    return NextResponse.json({ ok: true, posted: false, reason: "already posted", slug: latest.slug });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const text =
    `<b>${latest.title}</b>\n\n${latest.excerpt}\n\n` +
    `Devamini oku: ${siteUrl}/piyasa-analizi/${latest.slug}\n\n` +
    `Bu icerik genel bilgilendirme amaclidir, yatirim tavsiyesi degildir.\n\n` +
    telegramSiteCta();

  const result = await sendTelegramMessage(text);
  await markPostedToTelegram(key);

  let push: { sent: number; removed: number } | { error: string } = { sent: 0, removed: 0 };
  try {
    push = await sendPushToAll({ title: latest.title, body: latest.excerpt, url: `/piyasa-analizi/${latest.slug}` });
  } catch (err) {
    push = { error: (err as Error).message };
  }

  return NextResponse.json({ ok: true, posted: true, slug: latest.slug, result, push });
});
