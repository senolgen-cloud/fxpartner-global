import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto } from "@/lib/telegram";
import { postTradeSignalToX } from "@/lib/x";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { eq } from "drizzle-orm";

// Called by the MT5 EA whenever a trade it previously reported to
// /api/trade-signal closes. Looks up that original post by `ticket` so the
// result card can reply to (quote) it instead of appearing as an unrelated
// standalone post — same authorization + "never invent a number" rules as
// /api/trade-signal.
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

  const ticket = searchParams.get("ticket");
  const close = searchParams.get("close");
  const pips = searchParams.get("pips");
  const profit = searchParams.get("profit");
  const outcomeParam = searchParams.get("outcome");

  if (!ticket || !close) {
    return NextResponse.json({ error: "Missing required params: ticket, close" }, { status: 400 });
  }

  const original = await db.query.tradeSignals.findFirst({
    where: eq(tradeSignals.ticket, ticket),
  });

  // Fall back to whatever the EA sends directly if the ticket wasn't tracked
  // (older EA build, or the open call never included a ticket) — the result
  // card still goes out, it just can't be threaded under the original post.
  const pair = (original?.pair ?? searchParams.get("pair") ?? "").toUpperCase();
  const direction = original?.direction ?? searchParams.get("direction");
  const entry = original?.entry ?? searchParams.get("entry");

  if (!pair || !entry) {
    return NextResponse.json(
      { error: "No matching /api/trade-signal record for this ticket, and pair/entry were not provided as a fallback" },
      { status: 400 }
    );
  }

  const outcome =
    outcomeParam?.toUpperCase() === "WIN" || outcomeParam?.toUpperCase() === "LOSS" || outcomeParam?.toUpperCase() === "BE"
      ? outcomeParam.toUpperCase()
      : pips !== null
        ? parseFloat(pips) > 0
          ? "WIN"
          : parseFloat(pips) < 0
            ? "LOSS"
            : "BE"
        : profit !== null
          ? parseFloat(profit) > 0
            ? "WIN"
            : parseFloat(profit) < 0
              ? "LOSS"
              : "BE"
          : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
  const cardParams = new URLSearchParams({ pair, entry, close });
  if (direction) cardParams.set("direction", direction);
  if (pips) cardParams.set("pips", pips);
  if (profit) cardParams.set("profit", profit);
  if (outcome) cardParams.set("outcome", outcome);
  const imageUrl = `${siteUrl}/api/og/trade-result?${cardParams.toString()}`;

  const outcomeEmoji = outcome === "WIN" ? "✅" : outcome === "LOSS" ? "❌" : outcome === "BE" ? "➖" : "📌";
  const outcomeWord = outcome === "WIN" ? "WIN" : outcome === "LOSS" ? "LOSS" : outcome === "BE" ? "BREAKEVEN" : "CLOSED";
  const resultLine = pips ? `${parseFloat(pips) > 0 ? "+" : ""}${pips} pips` : profit ? `${parseFloat(profit) > 0 ? "+" : ""}${profit} USD` : null;

  const caption =
    `<b>${pair.toUpperCase()}</b> — ${outcomeEmoji} <b>${outcomeWord}</b>\n\n` +
    `📈 Entry: <b>${entry}</b>\n` +
    `🏁 Close: <b>${close}</b>` +
    (resultLine ? `\n📊 Result: <b>${resultLine}</b>` : "") +
    `\n\nResult of the real trade shared earlier on our tracked MT5 account — shared for informational purposes only, not investment advice.\n\n` +
    `👉 <a href="${siteUrl}">fxpartner.global</a>`;

  const result = await sendTelegramPhoto(imageUrl, caption, {
    replyToMessageId: original?.telegramMessageId ?? undefined,
  });

  // Best-effort, same as /api/trade-signal — an X failure never blocks the
  // Telegram result post, which is the primary channel.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    const tweetText =
      `${pair.toUpperCase()} ${outcomeEmoji} ${outcomeWord}${resultLine ? ` — ${resultLine}` : ""}\n` +
      `Entry ${entry} → Close ${close}\n\n` +
      `📊 FXPARTNER Trade Result\n\n` +
      `Result of a real trade taken on our tracked account, shared for informational purposes only — not investment advice. Past results don't guarantee future ones; always size positions and set stops according to your own risk tolerance.\n\n` +
      `FXPARTNER compares regulated forex brokers on licensing, real trading costs, platform reliability, and withdrawal speed — pick a broker you actually trust.\n\n` +
      `#fxpartner #forex #fxsignals #forextrading #trading`;
    xResult = await postTradeSignalToX(imageUrl, tweetText, {
      replyToTweetId: original?.xTweetId ?? undefined,
    });
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  return NextResponse.json({ ok: true, pair, outcome, result, x: xResult });
}
