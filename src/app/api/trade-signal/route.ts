import { NextRequest, NextResponse } from "next/server";
import {
  sendSignalPhoto,
  mainServicesKeyboard,
  telegramContactCta,
} from "@/lib/telegram";
import { formatMessage } from "@/lib/chrome";
import { localePath, type Locale } from "@/lib/i18n";
import { sendPushToMembers } from "@/lib/push";
import { getRecentSignalStats, statsLineTr } from "@/lib/signalStats";
import { shouldAlertForSignal } from "@/lib/signalAlertPace";
import { requiredTierForPair } from "@/lib/signalAccess";
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

  // Which tier this instrument belongs to decides the stat we quote. It no
  // longer decides what the post contains — see openLevels below.
  const requiredTier = requiredTierForPair(pair);

  // Every level, every time. The only audience left is the paid group, and
  // withholding from the people who paid for it is the one thing that would
  // make no sense at all. The tier still decides what /signals shows a
  // visitor; it no longer decides anything about this post.
  const openLevels = true;

  // The rolling track record, scoped to this signal's own tier — see the
  // header comment in lib/signalStats.ts for why it isn't one blended
  // number. Best-effort: a stats query failing must never block the post.
  let stats = null;
  try {
    stats = await getRecentSignalStats(requiredTier);
  } catch (err) {
    console.error("Signal stats lookup failed:", err);
  }

  // One card, always the full layout — see openLevels above.
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
  const buildCaption = (locale: Locale) => {
    const levels = openLevels;
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
      `💎 ${t("Bu sinyal VIP üyelere özel olarak paylaşıldı — her enstrüman, tüm seviyeler.")}\n\n` +
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

  // One destination: the paid group's SIGNALS topic. The public channel, the
  // Arabic mirror and the tweet all used to fire here too; they are gone,
  // and sendSignalPhoto is what makes that a fact of the code rather than a
  // convention — there is no chat id in this file to fall back to.
  //
  // Null means no destination was configured. It is logged inside the
  // sender, and it deliberately does not fail the request: the row below
  // still has to be written, or /signals loses a trade that really happened.
  const result = await sendSignalPhoto(cardUrl(true), caption, {
    inlineKeyboard: mainServicesKeyboard(),
    silent: !alert,
  });

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

  // Best-effort — a push failure never blocks the signal itself, which has
  // already gone out to the group by this point.
  //
  // ONE AUDIENCE HERE TOO, AND NO LEVELS IN IT. The teaser to subscriptions
  // with no account behind them is gone: it advertised "levels go to members
  // instantly", which stopped being true the moment signals moved to the
  // paid group, and an acquisition push for a thing the reader will not get
  // is worse than no push. Members still get told a trade opened, but the
  // body no longer carries entry/TP/SL — those are the group's now. The tap
  // lands on /signals, where the site's own tier gate decides what that
  // particular reader may see.
  try {
    await sendPushToMembers((loc) => {
      const p = (text: string, vars: Record<string, string | number> = {}) =>
        formatMessage(loc, text, vars);
      return {
        title: publicDirection
          ? `${dirEmoji} ${pair.toUpperCase()} ${publicDirection} ` + p("açıldı")
          : p("Yeni işlem: {pair}", { pair: pair.toUpperCase() }),
        body: confidence
          ? p("Sinyal güveni %{confidence} · Giriş, TP ve SL için dokunun.", { confidence })
          : p("Giriş, TP ve SL seviyeleri için dokunun."),
        url: localePath(loc, "/signals"),
      };
    });
  } catch (err) {
    console.error("Push notification failed (members):", err);
  }

  return NextResponse.json({ ok: true, pair, posted: result !== null, result });
}
