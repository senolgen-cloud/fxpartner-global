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
    const tweetText =
      `${pair.toUpperCase()}${direction ? ` ${direction.toUpperCase()}` : ""} — Entry ${entry}\n\n` +
      `FXPARTNER trade signal. General information only, not investment advice.\n` +
      `https://fxpartner.global\n\n` +
      `#fxpartner #forex #fxsignals`;
    xResult = await postTradeSignalToX(imageUrl, tweetText);
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  return NextResponse.json({ ok: true, pair, result, x: xResult });
}
