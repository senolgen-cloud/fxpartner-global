import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramPhoto,
  mainServicesKeyboard,
  telegramContactCta,
  arabicChatId,
  vipSignalTarget,
} from "@/lib/telegram";
import { formatMessage } from "@/lib/chrome";
import { localePath, type Locale } from "@/lib/i18n";
import { postTradeSignalToX } from "@/lib/x";
import { sendPushToMembers, sendPushToNonMembers } from "@/lib/push";
import { getRecentSignalStats, statsLineTr, statsLineEn } from "@/lib/signalStats";
import { shouldAlertForSignal } from "@/lib/signalAlertPace";
import { requiredTierForPair } from "@/lib/signalAccess";
import { ACCESS_TIER_LABEL } from "@/data/packageTiers";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cachedReads";
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

  // Two cards can be needed for one signal now: the public channel gets the
  // locked layout for a gated instrument, the paid VIP group always gets the
  // full one. Same builder, one argument apart.
  const cardUrl = (withLevels: boolean) => {
    const cardParams = new URLSearchParams({ pair });
    if (publicDirection) cardParams.set("direction", publicDirection);
    if (confidence) cardParams.set("confidence", confidence);
    // Passing entry+stop is what switches the OG card out of its locked
    // layout into the full one with the sparkline and real TP/SL boxes.
    if (withLevels) {
      cardParams.set("entry", entry);
      if (hasStop) cardParams.set("stop", stop);
      if (hasTarget1) cardParams.set("target1", target1);
    }
    if (stats) {
      cardParams.set("statTrades", String(stats.trades));
      cardParams.set("statWinRate", String(stats.winRate));
      cardParams.set("statDays", String(stats.windowDays));
    }
    return `${siteUrl}/api/og/trade-signal?${cardParams.toString()}`;
  };
  const imageUrl = cardUrl(openLevels);

  const dirEmoji = publicDirection === "SELL" ? "🔴" : "🟢";
  const trStats = statsLineTr(stats);

  // Built per locale rather than once in Turkish, so the same post can go to
  // the Arabic channel in Arabic. Every sentence is a template keyed by its
  // Turkish self — the same convention the site's chrome uses — which means
  // the Arabic comes from the dictionary that is already translated and
  // reviewed, not from a second copy of the copy kept in sync by hand.
  // "vip" is the paid group's copy of the same post: every level shown
  // whatever the instrument's tier, and no upsell tail — the reader has
  // already bought the thing the public tail is selling, and being sold to
  // inside the product you paid for is the fastest way to make a paid group
  // feel like a mailing list.
  const buildCaption = (locale: Locale, variant: "public" | "vip" = "public") => {
    const levels = variant === "vip" || openLevels;
    const t = (text: string, vars: Record<string, string | number> = {}) =>
      formatMessage(locale, text, vars);
    const at = (path: string) => `${siteUrl}${localePath(locale, path)}`;
    return (
      (publicDirection
        ? `${dirEmoji} <b>${pair.toUpperCase()}</b> · <b>${publicDirection}</b> — ${t("pozisyon az önce açıldı")}\n\n`
        : `<b>${pair.toUpperCase()}</b> ${t("üzerinde yeni bir işlem açıldı")}\n\n`) +
      (confidence ? `🎯 ${t("Sinyal güveni")}: <b>%${confidence}</b>\n` : "") +
      (trStats ? `${trStats}\n` : "") +
      (levels
        ? `📈 ${t("Giriş")}: <b>${entry}</b>\n` +
          (hasTarget1 ? `🎯 TP: <b>${target1}</b>\n` : "") +
          (hasStop ? `🛑 SL: <b>${stop}</b>\n` : "")
        : "") +
      `\n⚡ ${t("Gerçek hesap, gerçek işlem — takip edilen MT5 hesabımızda açıldığı an paylaşılıyor. Kapandığında sonucu da aynı yerde yayınlanacak, kazanç da kayıp da.")}\n\n` +
      (variant === "vip"
        ? `💎 ${t("Bu sinyal VIP üyelere özel olarak paylaşıldı — her enstrüman, tüm seviyeler.")}\n\n`
        : levels
          ? `🎁 ${t("Forex sinyalleri herkese açık yayınlanıyor. GOLD, endeks, kripto ve enerji sinyalleri Pro/VIP üyelere özel.")}\n\n`
          : `🔒 ${t("Giriş, TP ve SL seviyeleri {tier} üyelere özel — bu seviyeler olmadan pozisyon yönetilemez.", { tier: ACCESS_TIER_LABEL[requiredTier] })}\n\n`) +
      `⚠️ ${t("Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Pozisyon büyüklüğünü ve riskini kendi toleransına göre belirle. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez.")}\n\n` +
      (levels
        ? `👉 <a href="${at("/signals")}">${t("Tüm işlem geçmişi ve anlık bildirimler")}: fxpartner.global${localePath(locale, "/signals")}</a>\n\n`
        : `👉 <a href="${at("/paketler")}">${t("Seviyeleri anlık görmek için paketlere göz atın")}</a>\n\n`) +
      telegramContactCta()
    );
  };

  const caption = buildCaption("tr");

  // Posts either way; only the buzz is rationed. See signalAlertPace for the
  // measurement behind the hour.
  const alert = await shouldAlertForSignal();

  const result = await sendTelegramPhoto(imageUrl, caption, {
    inlineKeyboard: mainServicesKeyboard(),
    silent: !alert,
  });

  // The Arabic channel, when it exists. Deliberately after the Turkish send
  // and deliberately swallowed: the Turkish post is the one with 16k readers
  // waiting on it, and a failure to mirror must never fail the request that
  // published it or block the DB write below.
  const arChat = arabicChatId();
  if (arChat) {
    try {
      // The mirror follows the Turkish channel's decision rather than
      // asking again — a second call would consume the window and leave
      // one of the two channels silent for no reason.
      await sendTelegramPhoto(imageUrl, buildCaption("ar"), {
        chatId: arChat,
        inlineKeyboard: mainServicesKeyboard("ar"),
        silent: !alert,
      });
    } catch (err) {
      console.error("Arabic channel mirror failed:", err);
    }
  }

  // The paid VIP group's SIGNALS topic, when it is configured.
  //
  // Until now the group's members could only see the levels on the site,
  // while the public channel got the post — the wrong way round for the
  // people paying. This sends them the full card and the full caption at
  // the same moment, in the topic they are looking at.
  //
  // Best-effort and last, for the same reason as the Arabic mirror: a
  // failure here must not fail the request or block the DB write below, and
  // it must not cost the public channel its post. Silent-when-paced follows
  // the public channel's decision rather than asking again — a paid group
  // that buzzes eight times an hour gets muted like any other.
  const vipTarget = vipSignalTarget();
  if (vipTarget) {
    try {
      await sendTelegramPhoto(cardUrl(true), buildCaption("tr", "vip"), {
        chatId: vipTarget.chatId,
        threadId: vipTarget.threadId,
        inlineKeyboard: mainServicesKeyboard(),
        silent: !alert,
      });
    } catch (err) {
      console.error("VIP group signal post failed:", err);
    }
  }

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
      // The board is read once and shared (lib/cachedReads.ts), so the row
      // that was just written has to clear it — otherwise the /signals poll
      // keeps answering from the copy taken before this trade existed.
      revalidateTag(CACHE_TAGS.signals, "max");
    } catch (err) {
      console.error("Failed to store trade signal for later result linking:", err);
    }
  }

  // Best-effort, same as the X post above — a push failure never blocks the
  // signal itself, which has already gone out on Telegram/X by this point.
  //
  // Two audiences, two payloads. Members get the levels. Subscriptions with
  // no account behind them (the majority of the list) used to get nothing
  // at all here, which wasted both a granted notification permission and
  // the one moment they're most likely to register — so they get a teaser
  // pointing at sign-up instead. The teaser carries only what already went
  // out publicly on Telegram and X (pair + direction), never the levels:
  // instant levels-on-your-phone is exactly what the free account buys
  // (see the header comment in lib/signalAccess.ts).
  const [memberPush, teaserPush] = await Promise.allSettled([
    // The Telegram half of this route has been translated all along; the
    // push half was writing Turkish template literals straight into every
    // phone. Same catalogue, same helper, per subscriber's own language.
    sendPushToMembers((loc) => {
      const p = (text: string, vars: Record<string, string | number> = {}) =>
        formatMessage(loc, text, vars);
      return {
        title: publicDirection
          ? `${dirEmoji} ${pair.toUpperCase()} ${publicDirection} ` + p("açıldı")
          : p("Yeni işlem: {pair}", { pair: pair.toUpperCase() }),
        body: openLevels
          ? `${p("Giriş")} ${entry}${hasTarget1 ? ` · TP ${target1}` : ""}${hasStop ? ` · SL ${stop}` : ""}`
          : confidence
            ? p("Sinyal güveni %{confidence} · Giriş, TP ve SL için dokunun.", { confidence })
            : p("Giriş, TP ve SL seviyeleri için dokunun."),
        url: localePath(loc, "/signals"),
      };
    }),
    sendPushToNonMembers((loc) => {
      const p = (text: string, vars: Record<string, string | number> = {}) =>
        formatMessage(loc, text, vars);
      return {
        title: publicDirection
          ? `${dirEmoji} ${pair.toUpperCase()} ${publicDirection} ` + p("açıldı")
          : p("Yeni işlem: {pair}", { pair: pair.toUpperCase() }),
        body: p(
          "Giriş, TP ve SL seviyeleri anında üyelere gidiyor. Ücretsiz hesap aç, sonraki sinyali kaçırma."
        ),
        url: localePath(loc, "/account/login"),
      };
    }),
  ]);

  if (memberPush.status === "rejected") console.error("Push notification failed (members):", memberPush.reason);
  if (teaserPush.status === "rejected") console.error("Push notification failed (non-members):", teaserPush.reason);

  return NextResponse.json({ ok: true, pair, result, x: xResult });
}
