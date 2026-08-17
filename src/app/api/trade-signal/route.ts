import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto, mainServicesKeyboard } from "@/lib/telegram";
import { postTradeSignalToX } from "@/lib/x";
import { sendPushToAll } from "@/lib/push";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";

// Called by the MT5 EA directly (not a scheduled cron) whenever it opens a
// new trade. The EA already computes entry/TP/SL/confidence — this route
// only turns that real data into a styled image and forwards it to the
// Telegram channel; it never invents or adjusts a number itself.
function isAuthorized(req: NextRequest, params: URLSearchParams): boolean {
  const secret = process.env.TRADE_SIGNAL_SECRET;
  if (!secret) return false;
  const headerKey = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const queryKey = params.get("key");
  return headerKey === secret || queryKey === secret;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  if (!isAuthorized(req, searchParams)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pair = searchParams.get("pair");
  const entry = searchParams.get("entry");
  const stop = searchParams.get("stop");
  const target1 = searchParams.get("target1");
  const target2 = searchParams.get("target2");
  const confidence = searchParams.get("confidence");
  const volume = searchParams.get("volume");
  const direction = searchParams.get("direction"); // BUY | SELL, optional
  // The MT5 position ticket, if the EA sends one. Optional — old EA builds
  // that don't pass it still work exactly as before, they just won't be
  // linkable to a later /api/trade-result reply.
  const ticket = searchParams.get("ticket");

  if (!pair || !entry || !stop) {
    return NextResponse.json(
      { error: "Missing required params: pair, entry, stop" },
      { status: 400 }
    );
  }

  // A price of 0 means the EA hadn't detected a real SL/TP yet when it read
  // the position (it only retries for ~3s after open) — never present that
  // as if it were an actual level in the post text either.
  const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;
  const hasStop = isRealLevel(stop);
  const hasTarget1 = isRealLevel(target1);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const dirWord = direction?.toUpperCase() === "SELL" ? "SELL" : direction?.toUpperCase() === "BUY" ? "BUY" : "";

  // Public Telegram/X announcements name only the instrument now — no
  // direction, no entry/TP/SL. Those require an active /paketler package
  // on-site (see signalAccess.ts); the OG card renders a matching "🔒
  // Üyelere Özel" teaser when entry/stop are omitted like this.
  const cardParams = new URLSearchParams({ pair });
  const imageUrl = `${siteUrl}/api/og/trade-signal?${cardParams.toString()}`;

  const caption =
    `<b>${pair.toUpperCase()}</b> üzerinde yeni bir işlem açıldı\n\n` +
    `🔒 Yön, giriş ve TP/SL seviyeleri Pro/VIP üyelere özel.\n\n` +
    `⚡ Gerçek hesap, gerçek işlem — takip edilen MT5 hesabımızda açıldığı an bildiriliyor.\n\n` +
    `⚠️ Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.\n\n` +
    `👉 Detayları görmek için <a href="${siteUrl}/paketler">paketlerimize göz atın</a>`;

  const result = await sendTelegramPhoto(imageUrl, caption, { inlineKeyboard: mainServicesKeyboard() });

  // Best-effort: X posting failing (rate limit, expired token, etc.) should
  // never take down the Telegram send, which is the primary channel.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    // No URL in the tweet body on purpose — a post containing a link costs
    // $0.20/request on X's pay-per-use pricing vs $0.015 without one, and
    // the card image already carries a QR code + FXPARTNER branding.
    // Direction/entry/TP/SL are gated the same as Telegram — instrument
    // name only, full details require a package.
    const tweetText =
      `${pair.toUpperCase()} — new trade just opened on our live tracked account\n\n` +
      `🔒 Direction, entry, and TP/SL are Pro/VIP-only.\n\n` +
      `Why traders follow FXPARTNER:\n` +
      `📊 Real trades from a real tracked account — no backtests\n` +
      `🤖 AI-powered market insights\n` +
      `🛡️ Broker comparisons built on real regulation, cost, and withdrawal data — not paid placements\n\n` +
      `Compare the brokers you can actually trust and unlock full signal details — link in bio.\n\n` +
      `⚠️ Not investment advice. Trade responsibly and never risk more than you can afford to lose.\n\n` +
      `#fxpartner #forex #fxsignals #forextrading #trading`;
    xResult = await postTradeSignalToX(imageUrl, tweetText);
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  // Best-effort: only lets a later /api/trade-result reply to this post
  // instead of standing alone. Never block/fail the signal itself over it.
  if (ticket) {
    try {
      await db
        .insert(tradeSignals)
        .values({
          ticket,
          pair: pair.toUpperCase(),
          direction: dirWord || null,
          entry,
          target1: hasTarget1 ? target1 : null,
          target2: target2 && isRealLevel(target2) ? target2 : null,
          stop: hasStop ? stop : null,
          volume: volume || null,
          status: "active",
          telegramMessageId: result?.message_id != null ? String(result.message_id) : null,
          xTweetId: "tweetId" in (xResult ?? {}) ? (xResult as { tweetId: string }).tweetId : null,
        })
        .onConflictDoNothing();
    } catch (err) {
      console.error("Failed to store trade signal for later result linking:", err);
    }
  }

  // Best-effort, same as the X post above — a push failure never blocks the
  // signal itself, which has already gone out on Telegram/X by this point.
  try {
    await sendPushToAll({
      title: `Yeni işlem: ${pair.toUpperCase()}`,
      body: "Yön, giriş ve TP/SL için siteye giriş yapın.",
      url: "/signals",
    });
  } catch (err) {
    console.error("Push notification failed:", err);
  }

  return NextResponse.json({ ok: true, pair, result, x: xResult });
}
