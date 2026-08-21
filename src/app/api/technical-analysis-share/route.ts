import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramMediaGroup, mainServicesKeyboard, telegramContactCta } from "@/lib/telegram";
import { postImagesToX, postTextToX } from "@/lib/x";
import { technicalAnalysisPosts, getBulletinTitle } from "@/data/technicalAnalysis";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";

// Manual-trigger only (not wired into telegram-cron.yml) — posts the whole
// same-day batch of /teknik-analiz entries as ONE bulletin (Telegram photo
// album + detail message, one X post) instead of one message per
// instrument, which would flood both channels. Follows the paused-by-
// default automation pattern (see docs/ORGANIZATION.md): stays a manual,
// one-at-a-time action until the user asks for this on a schedule too.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const biasEmoji = (bias: "BULLISH" | "BEARISH") => (bias === "BEARISH" ? "🔻" : "🔺");

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const date = dateParam ?? technicalAnalysisPosts[technicalAnalysisPosts.length - 1]?.publishedAt;
  const posts = technicalAnalysisPosts.filter((p) => p.publishedAt === date);

  if (!date || posts.length === 0) {
    return NextResponse.json({ ok: true, posted: false, reason: "no posts found for date", date });
  }

  const key = `technical-analysis-bulletin:${date}`;
  if (await isAlreadyPostedToTelegram(key)) {
    return NextResponse.json({ ok: true, posted: false, reason: "already posted", date });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const title = getBulletinTitle(date);
  const chartPosts = posts.filter((p) => p.chartImage);

  // Telegram: one photo album (real charts only) + one detail message with
  // every instrument's scenario text (album captions are too short for that).
  let telegramResult: unknown = null;
  if (chartPosts.length > 0) {
    // A media group takes no inline keyboard, so the album's only route to
    // a person is this line in its caption.
    const albumCaption =
      `<b>${title}</b>\n\n` +
      posts.map((p) => `${biasEmoji(p.bias)} <b>${p.instrument}</b> — Pivot ${p.pivot}`).join("\n") +
      `\n\n${telegramContactCta()}`;
    telegramResult = await sendTelegramMediaGroup(
      chartPosts.map((p) => `${siteUrl}${p.chartImage}`),
      albumCaption
    );
  }

  const detailText =
    `<b>${title} — Detaylı Görünüm</b>\n\n` +
    posts
      .map(
        (p) =>
          `<b>${p.instrument}</b> (${p.timeframe}) — ${p.headline}\n` +
          `📌 ${p.preference}\n` +
          `🔄 Alternatif: ${p.alternative}\n` +
          `📊 ${p.comment}`
      )
      .join("\n\n") +
    `\n\nBu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaynak: ${posts[0].source}.\n\n` +
    `👉 <a href="${siteUrl}/teknik-analiz">fxpartner.global/teknik-analiz</a>\n\n` +
    telegramContactCta();
  const detailResult = await sendTelegramMessage(detailText, { inlineKeyboard: mainServicesKeyboard() });

  // X: up to 4 real chart images (Premium's long-form text limit fits the
  // full instrument list either way).
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    const tweetText =
      `${title}\n\n` +
      posts
        .map(
          (p) =>
            `${biasEmoji(p.bias)} ${p.instrument} (${p.timeframe}) — Pivot ${p.pivot}\n${p.preference}`
        )
        .join("\n\n") +
      `\n\nBu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaynak: ${posts[0].source}.\n\n` +
      `#fxpartner #forex #teknikanaliz`;
    const xImageUrls = chartPosts.slice(0, 4).map((p) => `${siteUrl}${p.chartImage}`);
    xResult = xImageUrls.length > 0 ? await postImagesToX(xImageUrls, tweetText) : await postTextToX(tweetText);
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  await markPostedToTelegram(key);

  return NextResponse.json({
    ok: true,
    posted: true,
    date,
    instrumentCount: posts.length,
    telegram: { album: telegramResult, detail: detailResult },
    x: xResult,
  });
}
