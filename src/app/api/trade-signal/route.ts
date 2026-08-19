import { NextRequest, NextResponse } from "next/server";
import { sendTelegramPhoto, mainServicesKeyboard } from "@/lib/telegram";
import { postTradeSignalToX } from "@/lib/x";
import { sendPushToMembers } from "@/lib/push";
import { getRecentSignalStats, statsLineTr, statsLineEn } from "@/lib/signalStats";
import { requiredTierForPair } from "@/lib/signalAccess";
import { ACCESS_TIER_LABEL } from "@/data/packageTiers";
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

  // What a public announcement gives away, and why:
  //   * DIRECTION is public. On its own it isn't tradeable — without entry,
  //     stop, target and size there's nothing to copy — but it's what makes
  //     the later /api/trade-result post *verifiable*: a follower who saw
  //     "GOLD SELL" at 09:14 can check the chart themselves. A result post
  //     nobody could have checked in advance proves nothing.
  //   * CONFIDENCE is public (the EA already computes it and it was being
  //     thrown away here) — interesting, not actionable.
  //   * ENTRY / TP / SL are published in full for FREE-TIER pairs (plain FX
  //     majors/crosses) — see PUBLISH_FREE_TIER_LEVELS below. For Pro and
  //     VIP instruments they never appear; those need a package on-site
  //     (see signalAccess.ts).
  //   * VOLUME is never published for any tier — it's account-size specific
  //     and copying it blindly is the fastest way for a follower to get
  //     hurt. It stays a members-only field on /signals.
  // Flip PUBLISH_DIRECTION to false to go back to instrument-name-only.
  const PUBLISH_DIRECTION = true;
  const publicDirection = PUBLISH_DIRECTION ? dirWord : "";

  // Which tier this instrument belongs to decides the stat we quote, the
  // call to action, and whether the levels themselves go out.
  const requiredTier = requiredTierForPair(pair);
  const isFreeTier = requiredTier === "free";

  // Free-tier (FX) levels go out openly on Telegram/X. Deliberate trade:
  // it's the strongest possible shop window — a follower can verify the
  // call against the chart in real time and watch the result post land on
  // the same numbers — but it also means FX levels no longer require the
  // free account, so registration has to be earned by the on-site history,
  // push alerts and the Pro upsell instead. Set to false to go back to
  // levels-locked-for-everyone.
  const PUBLISH_FREE_TIER_LEVELS = true;
  const openLevels = PUBLISH_FREE_TIER_LEVELS && isFreeTier;

  // The rolling track record, scoped to this signal's own tier — see the
  // header comment in lib/signalStats.ts for why it isn't one blended
  // number. Best-effort: a stats query failing must never block the post.
  let stats = null;
  try {
    stats = await getRecentSignalStats(requiredTier);
  } catch (err) {
    console.error("Signal stats lookup failed:", err);
  }

  const cardParams = new URLSearchParams({ pair });
  if (publicDirection) cardParams.set("direction", publicDirection);
  if (confidence) cardParams.set("confidence", confidence);
  // Passing entry+stop is what switches the OG card out of its locked
  // layout into the full one with the sparkline and real TP/SL boxes.
  if (openLevels) {
    cardParams.set("entry", entry);
    if (hasStop) cardParams.set("stop", stop);
    if (hasTarget1) cardParams.set("target1", target1);
  }
  if (stats) {
    cardParams.set("statTrades", String(stats.trades));
    cardParams.set("statWinRate", String(stats.winRate));
    cardParams.set("statDays", String(stats.windowDays));
  }
  const imageUrl = `${siteUrl}/api/og/trade-signal?${cardParams.toString()}`;

  const dirEmoji = publicDirection === "SELL" ? "🔴" : "🟢";
  const trStats = statsLineTr(stats);

  const caption =
    (publicDirection
      ? `${dirEmoji} <b>${pair.toUpperCase()}</b> · <b>${publicDirection}</b> — pozisyon az önce açıldı\n\n`
      : `<b>${pair.toUpperCase()}</b> üzerinde yeni bir işlem açıldı\n\n`) +
    (confidence ? `🎯 Sinyal güveni: <b>%${confidence}</b>\n` : "") +
    (trStats ? `${trStats}\n` : "") +
    (openLevels
      ? `📈 Giriş: <b>${entry}</b>\n` +
        (hasTarget1 ? `🎯 TP: <b>${target1}</b>\n` : "") +
        (hasStop ? `🛑 SL: <b>${stop}</b>\n` : "")
      : "") +
    `\n⚡ Gerçek hesap, gerçek işlem — takip edilen MT5 hesabımızda açıldığı an paylaşılıyor. Kapandığında sonucu da aynı yerde yayınlanacak, kazanç da kayıp da.\n\n` +
    (openLevels
      ? `🎁 Forex sinyalleri herkese açık yayınlanıyor. GOLD, endeks, kripto ve enerji sinyalleri Pro/VIP üyelere özel.\n\n`
      : `🔒 Giriş, TP ve SL seviyeleri ${ACCESS_TIER_LABEL[requiredTier]} üyelere özel — bu seviyeler olmadan pozisyon yönetilemez.\n\n`) +
    `⚠️ Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Pozisyon büyüklüğünü ve riskini kendi toleransına göre belirle. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez.\n\n` +
    (openLevels
      ? `👉 <a href="${siteUrl}/signals">Tüm işlem geçmişi ve anlık bildirimler: fxpartner.global/signals</a>`
      : `👉 <a href="${siteUrl}/paketler">Seviyeleri anlık görmek için paketlere göz atın</a>`);

  const result = await sendTelegramPhoto(imageUrl, caption, { inlineKeyboard: mainServicesKeyboard() });

  // Best-effort: X posting failing (rate limit, expired token, etc.) should
  // never take down the Telegram send, which is the primary channel.
  let xResult: { tweetId: string } | { error: string } | null = null;
  try {
    // No URL in the tweet body on purpose — a post containing a link costs
    // $0.20/request on X's pay-per-use pricing vs $0.015 without one, and
    // the card image already carries a QR code + FXPARTNER branding.
    // Same disclosure line as Telegram above: direction + confidence public,
    // entry/TP/SL locked. Front-loaded because X truncates, and the old
    // version buried the actual news under a features list.
    const tweetText =
      (publicDirection
        ? `${dirEmoji} ${pair.toUpperCase()} ${publicDirection} — just opened on our live tracked account\n\n`
        : `${pair.toUpperCase()} — new trade just opened on our live tracked account\n\n`) +
      (confidence ? `🎯 Signal confidence: ${confidence}%\n` : "") +
      (statsLineEn(stats) ? `${statsLineEn(stats)}\n` : "") +
      (openLevels
        ? `\n📈 Entry: ${entry}\n` +
          (hasTarget1 ? `🎯 TP: ${target1}\n` : "") +
          (hasStop ? `🛑 SL: ${stop}\n` : "")
        : "") +
      `\nWe post the close too — wins and losses alike, on the same account, no cherry-picking.\n\n` +
      (openLevels
        ? `🎁 Forex signals are published in full, free. GOLD, indices, crypto and energy are Pro/VIP-only.\n\n`
        : `🔒 Entry, TP and SL are ${ACCESS_TIER_LABEL[requiredTier]}-only — you can't manage the position without them.\n\n`) +
      `⚠️ Not investment advice. Size positions to your own risk. Past results don't guarantee future ones.\n\n` +
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
    await sendPushToMembers({
      title: publicDirection
        ? `${dirEmoji} ${pair.toUpperCase()} ${publicDirection} açıldı`
        : `Yeni işlem: ${pair.toUpperCase()}`,
      body: openLevels
        ? `Giriş ${entry}${hasTarget1 ? ` · TP ${target1}` : ""}${hasStop ? ` · SL ${stop}` : ""}`
        : confidence
          ? `Sinyal güveni %${confidence} · Giriş, TP ve SL için dokunun.`
          : "Giriş, TP ve SL seviyeleri için dokunun.",
      url: "/signals",
    });
  } catch (err) {
    console.error("Push notification failed:", err);
  }

  return NextResponse.json({ ok: true, pair, result, x: xResult });
}
