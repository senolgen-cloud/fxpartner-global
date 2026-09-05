import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import { requiredTierForPair } from "@/lib/signalAccess";
import type { AccessTier } from "@/lib/vip";
import {
  MIN_TRADES_FOR_RATE,
  SIGNALS_EPOCH,
  SIGNALS_START_BALANCE,
  getSignalPeriods,
} from "@/lib/signalPeriods";

// The published record, as data.
//
// Split from lib/signalStats, which turns these numbers into sentences and
// so has to import the translation catalogue. That import is fine on a
// Telegram route and fatal in lib/cachedReads: the shared reads are reached
// from a client entry point, and check-client-tr fails the build the moment
// a server translation helper lands in the client bundle. The rule that
// falls out of it is a good one anyway — the queries do not know what
// language anybody is reading them in.
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
const MIN_TRADES = MIN_TRADES_FOR_RATE;


export async function getRecentSignalStats(
  scope: StatsScope = "all",
  windowDays = 30
): Promise<SignalStats | null> {
  // Clamped to the reset: "son 30 gün" may not reach back past the day the
  // record starts, or the posts would quote a rate the board no longer shows.
  // The rolling window narrows on its own as the new record ages past it.
  const requested = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const since = requested > SIGNALS_EPOCH ? requested : SIGNALS_EPOCH;

  const rows = await db
    .select({ pair: tradeSignals.pair, outcome: tradeSignals.outcome })
    .from(tradeSignals)
    .where(
      and(
        eq(tradeSignals.status, "closed"),
        gte(tradeSignals.closedAt, since),
        gte(tradeSignals.createdAt, SIGNALS_EPOCH)
      )
    );

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

// ─────────────────────────────────────────────────────────────────────────
// The account, in money.
//
// The same three boxes /signals puts above its board — balance, today, this
// week — computed on the server instead of in the browser.
//
// WHY NOT REUSE THE BOARD'S NUMBERS. /signals hands its client component
// 250 closed rows and adds them up there, because that component re-polls
// every thirty seconds and has to recompute without a round trip. Neither
// is true of the home page: it wants the figures once, it must not ship a
// few hundred trade rows to get them, and 250 is a cap the record will
// eventually pass — at which point a row-limited balance would quietly
// start understating real money. This reads every post-epoch close, three
// columns wide, and returns numbers.
//
// The two paths must agree to the cent, so the rules are copied exactly
// from SignalsBoard's BalanceBox and PeriodBox, differences included:
// the balance counts every close that has a profit and an outcome
// (breakeven ones move real money too), while the period boxes count only
// decisive trades. AccountSummary renders both callers, so a change to
// either rule has to be made here and there.
export type PeriodTotals = {
  trades: number;
  wins: number;
  losses: number;
  profit: number;
};

export type AccountRecord = {
  /** Everything realised since the reset, breakeven closes included. */
  realised: number;
  /** Every decisive close since the reset — what the home page counts. */
  allTime: PeriodTotals;
  today: PeriodTotals;
  week: PeriodTotals;
  month: PeriodTotals;
  /**
   * Midnight on the first of the current month in SIGNAL_TZ.
   *
   * Carried alongside the totals so the strip can name the month it is
   * reporting — "Eylül 2026" — without a second date being computed on the
   * client, where it would disagree with the server across a midnight or a
   * month boundary and produce a hydration mismatch on the one component
   * both pages share.
   */
  monthStart: number;
};

type ClosedRow = {
  outcome: string | null;
  profit: string | null;
  closedAt: Date | null;
};

function totals(rows: ClosedRow[], since: number): PeriodTotals {
  const decisive = rows.filter(
    (r) =>
      (r.outcome === "WIN" || r.outcome === "LOSS") &&
      r.profit !== null &&
      (r.closedAt?.getTime() ?? 0) >= since
  );
  const wins = decisive.filter((r) => r.outcome === "WIN").length;
  return {
    trades: decisive.length,
    wins,
    losses: decisive.length - wins,
    profit: decisive.reduce((sum, r) => sum + parseFloat(r.profit as string), 0),
  };
}

export async function getAccountRecord(): Promise<AccountRecord | null> {
  const rows = await db
    .select({
      outcome: tradeSignals.outcome,
      profit: tradeSignals.profit,
      closedAt: tradeSignals.closedAt,
    })
    .from(tradeSignals)
    .where(
      and(eq(tradeSignals.status, "closed"), gte(tradeSignals.createdAt, SIGNALS_EPOCH))
    );

  // Nothing closed is no record, not a balance of exactly the opening
  // deposit — the caller shows something else rather than a strip of zeroes.
  if (rows.length === 0) return null;

  const periods = getSignalPeriods();
  return {
    realised: rows
      .filter((r) => r.profit !== null && r.outcome !== null)
      .reduce((sum, r) => sum + parseFloat(r.profit as string), 0),
    // Zero rather than the epoch: every row read here is already
    // post-epoch, so there is nothing earlier for a floor to exclude.
    allTime: totals(rows, 0),
    today: totals(rows, periods.dayStart),
    week: totals(rows, periods.weekStart),
    month: totals(rows, periods.monthStart),
    monthStart: periods.monthStart,
  };
}

// Re-exported so a caller needing the strip does not also have to import
// the constant the strip is stated against.
export { SIGNALS_START_BALANCE };