import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto, mainServicesKeyboard } from "@/lib/telegram";
import { postTradeSignalToX } from "@/lib/x";
import { sendPushToAll } from "@/lib/push";
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
    `\n\n${outcome === "WIN" ? "🔥 Another real result from our tracked account — called live, closed live, no cherry-picking." : "📌 The real result of the trade we called live on our tracked account — wins and losses alike, we post them all."}\n\n` +
    `⚠️ Past results don't guarantee future ones. Shared for informational purposes only, not investment advice.\n\n` +
    `👉 <a href="${siteUrl}">fxpartner.global</a>`;

  // Best-effort: record the real close data against the original row so
  // /signals can show it — never blocks the actual result post.
  if (original) {
    try {
      await db
        .update(tradeSignals)
        .set({
          status: "closed",
          outcome: outcome === "WIN" || outcome === "LOSS" || outcome === "BE" ? outcome : null,
          closePrice: close,
          pips: pips ?? null,
          profit: profit ?? null,
          closedAt: new Date(),
        })
        .where(eq(tradeSignals.ticket, ticket));
    } catch (err) {
      console.error("Failed to record trade-signal close:", err);
    }
  }

  const result = await sendTelegramPhoto(imageUrl, caption, {
    replyToMessageId: original?.telegramMessageId ?? undefined,
    inlineKeyboard: mainServicesKeyboard(),
  });

  // Best-effort, same as /api/trade-signal — an X failure never blocks the
  // Telegram result post, which is the primary channel.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    const tweetText =
      `${pair.toUpperCase()} ${outcomeEmoji} ${outcomeWord}${resultLine ? ` — ${resultLine}` : ""}\n` +
      `Entry ${entry} → Close ${close}\n\n` +
      `${outcome === "WIN" ? "🔥 Another real result from our tracked account — called live, closed live, no cherry-picking." : "📌 We post every result from our tracked account — wins and losses alike, exactly as they happened."}\n\n` +
      `Every signal we share links back to real brokers you can actually vet: real licensing, real trading costs, real withdrawal speed — no paid placements dressed up as advice.\n\n` +
      `⚠️ Past results don't guarantee future ones. Not investment advice — always size positions and set stops to your own risk tolerance.\n\n` +
      `#fxpartner #forex #fxsignals #forextrading #trading`;
    xResult = await postTradeSignalToX(imageUrl, tweetText, {
      replyToTweetId: original?.xTweetId ?? undefined,
    });
  } catch (err) {
    console.error("X post failed:", err);
    xResult = { error: err instanceof Error ? err.message : "unknown error" };
  }

  // Best-effort, same reasoning as /api/trade-signal — never blocks the
  // result post itself.
  try {
    await sendPushToAll({
      title: `${pair.toUpperCase()} ${outcomeEmoji} ${outcomeWord}`,
      body: resultLine ? `Entry ${entry} → Close ${close} · ${resultLine}` : `Entry ${entry} → Close ${close}`,
      url: "/signals",
    });
  } catch (err) {
    console.error("Push notification failed:", err);
  }

  return NextResponse.json({ ok: true, pair, outcome, result, x: xResult });
}
