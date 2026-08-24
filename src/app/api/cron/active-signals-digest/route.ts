import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import {
  sendTelegramMessage,
  telegramSiteCta,
  telegramContactCta,
  mainServicesKeyboard,
} from "@/lib/telegram";
import { postTextToX } from "@/lib/x";
import { db } from "@/db";
import { tradeSignals, liveQuotes } from "@/db/schema";
import { requiredTierForPair } from "@/lib/signalAccess";
import { ACCESS_TIER_LABEL } from "@/data/packageTiers";
import { getRecentSignalStats, statsLineTr } from "@/lib/signalStats";
import { isAlreadyPostedToTelegram, markPostedToTelegram } from "@/lib/telegram-posted-store";
import { withCronErrorAlert } from "@/lib/cron-wrapper";
import { QUOTE_MAX_AGE_MS } from "@/app/api/live-prices/route";

// Owned by Sosyal Medya & Topluluk Departmanı — see src/lib/departments.ts
// and docs/ORGANIZATION.md. Active since 2026-08-24 on a 3-hourly schedule,
// per explicit owner request; see .github/workflows/active-signals-digest.yml.
//
// A "here is the board right now" digest for Telegram and X.
//
// Two things it will not do, both deliberate:
//
// 1. It never publishes a level a paying member paid for. Entry, stop and
//    target for Pro and VIP instruments are replaced by the same lock line
//    /api/trade-signal already uses. A public channel that leaks gated
//    levels every hour would dismantle the tiers it is advertising and, more
//    to the point, would be a straightforward betrayal of the people who
//    bought them. Free (FX) signals show their levels in full, exactly as
//    the site does for a signed-out reader.
//
// 2. It does not send the same board twice in a day. Eight slots a day is
//    still a lot of posts, and this channel has been here before:
//    broker-review-share ran hourly until 2026-08-14, flooded the channel,
//    and was cut to 4x/day. So the digest is skipped when the board is
//    unchanged from a version already sent today. A run where nothing moved
//    is a run with nothing to say — which is also what keeps the two
//    overnight slots from becoming 3am repeats.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const DIRECTION_MARK: Record<string, string> = { BUY: "🟢", SELL: "🔴" };

function fingerprint(parts: string[]): string {
  // Deliberately content-based, not time-based: two runs an hour apart that
  // would say exactly the same thing collapse to one post.
  let h = 0;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export const GET = withCronErrorAlert("active-signals-digest", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

  const active = await db.query.tradeSignals.findMany({
    where: eq(tradeSignals.status, "active"),
    orderBy: desc(tradeSignals.createdAt),
    limit: 20,
  });

  if (active.length === 0) {
    // Nothing open is not a post. "No signals right now" every hour teaches
    // the channel to be ignored.
    return NextResponse.json({ ok: true, posted: false, reason: "no active signals" });
  }

  // Live prices, when the MT5 EA is pushing them. A market price is public
  // information — unlike our entry and targets — so it is shown for gated
  // instruments too, and it is what makes an hourly post carry something the
  // last one did not.
  const quoteRows = await db.select().from(liveQuotes);
  const now = Date.now();
  const quotes = new Map<string, string>();
  for (const row of quoteRows) {
    const age = now - new Date(row.updatedAt).getTime();
    if (age >= 0 && age <= QUOTE_MAX_AGE_MS) quotes.set(row.symbol, row.bid);
  }

  const lines: string[] = [];
  const fingerprintParts: string[] = [];
  let lockedCount = 0;

  for (const s of active) {
    const tier = requiredTierForPair(s.pair);
    const mark = DIRECTION_MARK[s.direction ?? ""] ?? "⚪";
    const live = quotes.get(s.pair);

    lines.push(`${mark} <b>${s.pair}</b> ${s.direction ?? ""}`.trim());

    if (tier === "free") {
      lines.push(
        `   Giriş ${s.entry}${s.stop ? ` · SL ${s.stop}` : ""}${s.target1 ? ` · TP ${s.target1}` : ""}`
      );
      fingerprintParts.push(`${s.id}:${s.entry}:${s.stop}:${s.target1}`);
    } else {
      lockedCount++;
      lines.push(
        `   🔒 Giriş, SL ve TP seviyeleri ${ACCESS_TIER_LABEL[tier]} üyelere özel`
      );
      fingerprintParts.push(`${s.id}:locked:${tier}`);
    }

    if (live) {
      lines.push(`   Şu an: ${live}`);
      fingerprintParts.push(`q:${s.pair}:${live}`);
    }
    lines.push("");
  }

  const stats = await getRecentSignalStats("all", 30);
  const statsLine = statsLineTr(stats);

  const key = `active-signals-digest:${new Date().toISOString().slice(0, 10)}:${fingerprint(fingerprintParts)}`;
  if (await isAlreadyPostedToTelegram(key)) {
    return NextResponse.json({
      ok: true,
      posted: false,
      reason: "board unchanged since an earlier post today",
      key,
    });
  }

  const header = `📊 <b>AKTİF SİNYALLER</b> — ${active.length} açık pozisyon`;
  const cta = lockedCount
    ? `Kilitli seviyeler ve tüm işlem geçmişi sitede: ${siteUrl}/tr/signals\nÜcretsiz hesap açın, FX sinyallerini anında görün: ${siteUrl}/tr/account/register`
    : `Tüm işlem geçmişi ve doğrulanmış sonuçlar: ${siteUrl}/tr/signals\nÜcretsiz hesap açın, yeni sinyalleri kaçırmayın: ${siteUrl}/tr/account/register`;

  const disclaimer =
    "⚠️ Bunlar FXPARTNER'ın takip edilen gerçek MT5 hesabındaki açık pozisyonlardır; yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez.";

  const telegramText = [
    header,
    statsLine ? `\n${statsLine}` : "",
    "",
    ...lines,
    cta,
    "",
    disclaimer,
    "",
    telegramSiteCta(),
    telegramContactCta(),
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const telegram = await sendTelegramMessage(telegramText, {
    inlineKeyboard: mainServicesKeyboard(),
  });

  // X counts characters hard, so it gets the count and the proof rather than
  // the full board — the link carries the rest.
  const xText = [
    `📊 AKTİF SİNYALLER — ${active.length} açık pozisyon`,
    statsLine ? statsLine : "",
    "",
    `Canlı takip: ${siteUrl}/tr/signals`,
    "",
    "Yatırım tavsiyesi değildir.",
  ]
    .filter(Boolean)
    .join("\n");

  let xResult: { tweetId: string } | { error: string };
  try {
    xResult = await postTextToX(xText);
  } catch (err) {
    // A failed tweet must not lose the Telegram post or retry it next hour.
    xResult = { error: err instanceof Error ? err.message : String(err) };
  }

  await markPostedToTelegram(key);

  return NextResponse.json({
    ok: true,
    posted: true,
    key,
    activeCount: active.length,
    lockedCount,
    quotesUsed: quotes.size,
    telegram,
    x: xResult,
  });
});
