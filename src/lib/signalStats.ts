import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { requiredTierForPair } from "@/lib/signalAccess";
import type { AccessTier } from "@/lib/vip";
import { trData } from "@/lib/localizeContent";

// Rolling track record for the tracked MT5 account, published in the public
// Telegram/X signal posts. This is the single most persuasive thing we can
// put in a post that gives away no actionable trade detail — so it lives in
// one place and is derived from the same `trade_signal` rows /signals
// renders, never hand-maintained.
//
// SCOPED PER TIER ON PURPOSE. The tiers do not perform alike — over the
// first 116 trades the free FX pairs ran ~44% while the Pro instruments ran
// ~65%. Publishing one blended number on every post would advertise a rate
// that free-tier followers do not actually receive, which is both a bad
// first impression and a performance claim we couldn't stand behind. Each
// post therefore quotes the record of the tier that post's instrument
// belongs to. Pass tier: "all" only where the whole account's record is
// genuinely what's being described.
//
// DELIBERATELY COUNT-BASED ONLY — no pips, no USD:
//   * `pips` is not comparable across instruments as the EA reports it
//     (a GOLD trade recorded -1212 "pips" for -$242 while a US100 trade
//     recorded +6400 for +$19), so any sum or average of it is a
//     meaningless number that would read as a performance claim.
//   * `profit` is real account P&L, but it's a function of lot size rather
//     than signal quality and is dominated by a couple of instruments —
//     publishing it invites "on what capital?" and turns an honest post
//     into a return claim. Left out on purpose; if it's ever added it
//     needs the account size and per-instrument breakdown alongside it.
// Win rate over a stated window and scope is a claim we can actually stand
// behind.

export type StatsScope = AccessTier | "all";

export type SignalStats = {
  trades: number;
  wins: number;
  winRate: number;
  windowDays: number;
  scope: StatsScope;
};

// Below this many closed trades in the window, a win rate is noise dressed
// up as evidence (three trades can read as "100% isabet") — callers get
// null and simply omit the line rather than publishing a flattering number
// off a thin sample. This bites most on the narrower tier scopes, which is
// the intended behaviour: no sample, no claim.
const MIN_TRADES = 15;

const SCOPE_LABEL_TR: Record<StatsScope, string> = {
  all: "Tüm sinyaller",
  free: "Forex sinyalleri",
  pro: "Pro sinyalleri",
  vip: "VIP sinyalleri",
};

const SCOPE_LABEL_EN: Record<StatsScope, string> = {
  all: "All signals",
  free: "Forex signals",
  pro: "Pro signals",
  vip: "VIP signals",
};

export async function getRecentSignalStats(
  scope: StatsScope = "all",
  windowDays = 30
): Promise<SignalStats | null> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({ pair: tradeSignals.pair, outcome: tradeSignals.outcome })
    .from(tradeSignals)
    .where(and(eq(tradeSignals.status, "closed"), gte(tradeSignals.closedAt, since)));

  // BE (breakeven) closes are excluded from both sides — they're neither a
  // win nor a loss, and counting them as losses would understate the rate
  // while counting them as wins would overstate it.
  const decisive = rows.filter(
    (r) =>
      (r.outcome === "WIN" || r.outcome === "LOSS") &&
      (scope === "all" || requiredTierForPair(r.pair) === scope)
  );
  if (decisive.length < MIN_TRADES) return null;

  const wins = decisive.filter((r) => r.outcome === "WIN").length;
  return {
    trades: decisive.length,
    wins,
    winRate: Math.round((wins / decisive.length) * 100),
    windowDays,
    scope,
  };
}

export function statsLineTr(stats: SignalStats | null): string {
  if (!stats) return "";
  return `📊 ${trData(SCOPE_LABEL_TR)[stats.scope]} · son ${stats.windowDays} gün: ${stats.trades} işlem · %${stats.winRate} isabet`;
}

export function statsLineEn(stats: SignalStats | null): string {
  if (!stats) return "";
  return `📊 ${SCOPE_LABEL_EN[stats.scope]} · last ${stats.windowDays} days: ${stats.trades} trades · ${stats.winRate}% win rate`;
}
