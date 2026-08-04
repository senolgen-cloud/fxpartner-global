import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto } from "@/lib/telegram";
import { postTradeSignalToX } from "@/lib/x";

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

  if (!pair || !entry || !stop) {
    return NextResponse.json(
      { error: "Missing required params: pair, entry, stop" },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const cardParams = new URLSearchParams({ pair, entry, stop });
  if (target1) cardParams.set("target1", target1);
  if (target2) cardParams.set("target2", target2);
  if (confidence) cardParams.set("confidence", confidence);
  if (volume) cardParams.set("volume", volume);
  if (direction) cardParams.set("direction", direction);
  const imageUrl = `${siteUrl}/api/og/trade-signal?${cardParams.toString()}`;

  const caption =
    `<b>${pair.toUpperCase()}</b>${direction ? ` — ${direction.toUpperCase()}` : ""}\n\n` +
    `This is general information only, not investment advice. Trade at your own risk.`;

  const result = await sendTelegramPhoto(imageUrl, caption);

  // Best-effort: X posting failing (rate limit, expired token, etc.) should
  // never take down the Telegram send, which is the primary channel.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    // No URL in the tweet body on purpose — a post containing a link costs
    // $0.20/request on X's pay-per-use pricing vs $0.015 without one, and
    // the card image already carries a QR code + FXPARTNER branding.
    // Longer, educational copy is fine since the account is on X Premium
    // (25,000-character post limit instead of the free-tier 280).
    const dirWord = direction?.toUpperCase() === "SELL" ? "SELL" : direction?.toUpperCase() === "BUY" ? "BUY" : "";
    const levelLines = [
      target1 ? `🎯 Target: ${target1}` : null,
      `🛑 Stop Loss: ${stop}`,
    ]
      .filter(Boolean)
      .join("\n");

    const tweetText =
      `${pair.toUpperCase()}${dirWord ? ` ${dirWord}` : ""} — Entry ${entry}\n` +
      `${levelLines}\n\n` +
      `📊 FXPARTNER Trade Signal\n\n` +
      `This signal reflects a real trade taken on our tracked account and is shared for informational purposes only — it is not investment advice. Markets move fast; always size positions and set stops according to your own risk tolerance, never based on a single signal alone.\n\n` +
      `FXPARTNER compares regulated forex brokers on the things that actually matter before you deposit a dollar: licensing, real trading costs, platform reliability, and how fast withdrawals actually clear. The right broker won't make you profitable, but the wrong one can quietly cost you more than any single trade ever will.\n\n` +
      `Trade responsibly — never risk more than you can afford to lose.\n\n` +
      `#fxpartner #forex #fxsignals #forextrading #trading`;
    xResult = await postTradeSignalToX(imageUrl, tweetText);
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  return NextResponse.json({ ok: true, pair, result, x: xResult });
}
