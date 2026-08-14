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
  const cardParams = new URLSearchParams({ pair, entry, stop });
  if (target1) cardParams.set("target1", target1);
  if (target2) cardParams.set("target2", target2);
  if (confidence) cardParams.set("confidence", confidence);
  if (volume) cardParams.set("volume", volume);
  if (direction) cardParams.set("direction", direction);
  const imageUrl = `${siteUrl}/api/og/trade-signal?${cardParams.toString()}`;

  // Telegram photo captions are capped at 1024 characters, so this stays
  // shorter than the X copy — real trade levels, a short honest pitch for
  // the site, and a link (unlike X, Telegram doesn't charge per link).
  const dirWord = direction?.toUpperCase() === "SELL" ? "SELL" : direction?.toUpperCase() === "BUY" ? "BUY" : "";
  const captionLevelLines = [
    `📈 Entry: <b>${entry}</b>`,
    hasTarget1 ? `🎯 Take Profit: <b>${target1}</b>` : null,
    hasStop ? `🛑 Stop Loss: <b>${stop}</b>` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const caption =
    `<b>${pair.toUpperCase()}</b>${dirWord ? ` — ${dirWord} ${dirWord === "SELL" ? "🔴" : "🟢"}` : ""}\n\n` +
    `${captionLevelLines}\n\n` +
    `⚡ Real trade, real account — sent live the moment it opened on our tracked MT5, never backtested or simulated.\n\n` +
    `🌍 <b>FXPARTNER</b> is your all-in-one trading ecosystem: free live signals, AI-powered market insights, and broker comparisons built on real regulation data — so you always know who you're trusting with your money.\n\n` +
    `⚠️ For informational purposes only, not investment advice. Always manage risk according to your own trading plan.\n\n` +
    `👉 <a href="${siteUrl}">fxpartner.global</a>`;

  const result = await sendTelegramPhoto(imageUrl, caption, { inlineKeyboard: mainServicesKeyboard() });

  // Best-effort: X posting failing (rate limit, expired token, etc.) should
  // never take down the Telegram send, which is the primary channel.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    // No URL in the tweet body on purpose — a post containing a link costs
    // $0.20/request on X's pay-per-use pricing vs $0.015 without one, and
    // the card image already carries a QR code + FXPARTNER branding.
    // Longer, educational copy is fine since the account is on X Premium
    // (25,000-character post limit instead of the free-tier 280).
    const levelLines = [
      hasTarget1 ? `🎯 Target: ${target1}` : null,
      hasStop ? `🛑 Stop Loss: ${stop}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const tweetText =
      `${pair.toUpperCase()}${dirWord ? ` ${dirWord} ${dirWord === "SELL" ? "🔴" : "🟢"}` : ""} — Entry ${entry}\n` +
      `${levelLines}\n\n` +
      `⚡ Real trade signal, straight from our live tracked account — sent the moment it opened, not after the fact.\n\n` +
      `Why traders follow FXPARTNER:\n` +
      `📊 Free real-time signals — no paywall, ever\n` +
      `🤖 AI-powered market insights\n` +
      `🛡️ Broker comparisons built on real regulation, cost, and withdrawal data — not paid placements\n\n` +
      `The right broker won't make you profitable — but the wrong one can quietly cost you more than any single trade ever will. Compare the ones you can actually trust — link in bio.\n\n` +
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
      title: `${dirWord || "New"} ${pair.toUpperCase()}`,
      body: `Entry ${entry}${hasTarget1 ? ` · TP ${target1}` : ""}${hasStop ? ` · SL ${stop}` : ""}`,
      url: "/signals",
    });
  } catch (err) {
    console.error("Push notification failed:", err);
  }

  return NextResponse.json({ ok: true, pair, result, x: xResult });
}
