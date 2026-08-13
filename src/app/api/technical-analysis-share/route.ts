import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto, mainServicesKeyboard } from "@/lib/telegram";
import { postTradeSignalToX } from "@/lib/x";
import { technicalAnalysisPosts } from "@/data/technicalAnalysis";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";

// Manual-trigger only (not wired into telegram-cron.yml) — posts the latest
// /teknik-analiz entry to Telegram + X. Follows the paused-by-default
// automation pattern (see docs/ORGANIZATION.md): every future call remains
// an explicit, one-at-a-time action until the user asks for this on a
// schedule too.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slugParam = searchParams.get("slug");
  const post = slugParam
    ? technicalAnalysisPosts.find((p) => p.slug === slugParam)
    : technicalAnalysisPosts[technicalAnalysisPosts.length - 1];

  if (!post) {
    return NextResponse.json({ ok: true, posted: false, reason: "no post found" });
  }

  const key = `technical-analysis:${post.slug}`;
  if (await isAlreadyPostedToTelegram(key)) {
    return NextResponse.json({ ok: true, posted: false, reason: "already posted", slug: post.slug });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const cardParams = new URLSearchParams({
    instrument: post.instrument,
    timeframe: post.timeframe,
    pivot: post.pivot,
    last: post.lastPrice,
    bias: post.bias,
    headline: post.headline,
    resistances: post.resistances.map((r) => `${r.price}:${r.strength}`).join(","),
    supports: post.supports.map((s) => `${s.price}:${s.strength}`).join(","),
  });
  const imageUrl = `${siteUrl}/api/og/technical-analysis?${cardParams.toString()}`;

  const resistanceLines = post.resistances.map((r) => `🔺 ${r.price}`).join("\n");
  const supportLines = post.supports.map((s) => `🔻 ${s.price}`).join("\n");

  const caption =
    `<b>${post.instrument} (${post.timeframe})</b> — ${post.headline}\n\n` +
    `${resistanceLines}\n<b>Pivot: ${post.pivot}</b>\n${supportLines}\n\n` +
    `📌 ${post.preference}\n\n` +
    `🔄 Alternatif: ${post.alternative}\n\n` +
    `📊 ${post.comment}\n\n` +
    `Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaynak: ${post.source}.\n\n` +
    `👉 <a href="${siteUrl}/teknik-analiz">fxpartner.global/teknik-analiz</a>`;

  const result = await sendTelegramPhoto(imageUrl, caption, { inlineKeyboard: mainServicesKeyboard() });

  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    const tweetText =
      `${post.instrument} (${post.timeframe}) — ${post.headline}\n\n` +
      `${resistanceLines}\nPivot: ${post.pivot}\n${supportLines}\n\n` +
      `📌 ${post.preference}\n\n` +
      `🔄 Alternatif senaryo: ${post.alternative}\n\n` +
      `📊 ${post.comment}\n\n` +
      `Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaynak: ${post.source}.\n\n` +
      `#fxpartner #altin #gold #forex #teknikanaliz`;
    xResult = await postTradeSignalToX(imageUrl, tweetText);
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  await markPostedToTelegram(key);

  return NextResponse.json({ ok: true, posted: true, slug: post.slug, result, x: xResult });
}
