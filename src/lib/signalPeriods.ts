// Day and week boundaries for the /signals summary.
//
// Computed on the server and passed down as plain numbers rather than
// derived inside the client component. SignalsBoard renders on the server
// too, and a boundary taken from Date.now() in both places disagrees at
// midnight — a hydration mismatch on the one night it matters. Serialised
// props make the two renders agree by construction.
//
// Anchored to Europe/Istanbul, matching EconomicCalendarBoard's DISPLAY_TZ:
// the desk and the readership are both there, so "bugün" means the day the
// reader is having, not a UTC day that ends at 03:00 their time.
export const SIGNAL_TZ = "Europe/Istanbul";

export type SignalPeriods = {
  dayStart: number;
  weekStart: number;
  monthStart: number;
};

// Midnight in SIGNAL_TZ, expressed as a UTC epoch. Intl gives the wall
// clock in that zone; subtracting it from the instant lands on the start
// of that zone's day without hardcoding an offset that DST would break.
function startOfDayInTz(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  // "24" is how some ICU versions spell midnight with hour12:false.
  const hour = get("hour") % 24;
  const elapsed = ((hour * 60 + get("minute")) * 60 + get("second")) * 1000;
  return instant.getTime() - elapsed;
}

// Day of the month in SIGNAL_TZ. The calendar month is the window a reader
// already thinks in — it is how a broker statement is cut and how anyone
// asks "how did September go" — so it gets its own boundary rather than a
// rolling thirty days, which would answer a question nobody asked.
function dayOfMonthInTz(instant: Date, timeZone: string): number {
  const day = new Intl.DateTimeFormat("en-US", { timeZone, day: "numeric" }).format(instant);
  return Number(day);
}

// Weekday index in SIGNAL_TZ, Monday = 0. The trading week starts Monday,
// so a Sunday close belongs to the week that is ending, not the one about
// to start.
function weekdayInTz(instant: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(instant);
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const i = order.indexOf(name);
  return i === -1 ? 0 : i;
}

export function getSignalPeriods(now: Date = new Date()): SignalPeriods {
  const dayStart = startOfDayInTz(now, SIGNAL_TZ);
  const daysSinceMonday = weekdayInTz(now, SIGNAL_TZ);
  return {
    dayStart,
    // Built by stepping back whole days from midnight rather than
    // subtracting 7*24h from now, so a DST change inside the week cannot
    // shift the boundary off midnight.
    weekStart: startOfDayInTz(new Date(dayStart - daysSinceMonday * 86_400_000), SIGNAL_TZ),
    // Same construction as the week, for the same DST reason: step back
    // whole days from this morning's midnight and re-anchor, rather than
    // subtracting N*24h from now.
    monthStart: startOfDayInTz(
      new Date(dayStart - (dayOfMonthInTz(now, SIGNAL_TZ) - 1) * 86_400_000),
      SIGNAL_TZ
    ),
  };
}

// The minimum sample a win rate may be published from. Defined here rather
// than in signalStats.ts because that module imports db and so can never
// reach a client bundle, while this one can — and the page and the Telegram
// posts have to apply the same rule. Below this many decisive trades a rate
// is noise dressed up as evidence, whatever surface is showing it.
export const MIN_TRADES_FOR_RATE = 15;

// ─────────────────────────────────────────────────────────────────────────
// The reset.
//
// The published record starts here and nothing before it is on the board.
// Owner's call; this is the second time it has moved, and both moves are
// worth remembering because they were for opposite reasons.
//
// 31 Aug 2026, 16:08:41 — the board carried the whole history of the tracked
// MT5 account, which mixed the period when the account was being wired up
// and the EA still being tuned with the period when it is actually being
// traded. The epoch moved to the instant the account was funded with $100:
// the moment this page's claim about a starting balance becomes true. (It
// was briefly midnight that day, which was correct only by luck — the
// sixteen hours before the deposit happened to contain no reported trade,
// and a position still running on the account this one was funded from
// would have been counted into a balance claiming to start at $100.)
//
// 1 Sep 2026, 11:25 — that record ended the way leveraged accounts end. It
// stood at +404.04 at 10:44, then five positions closed together between
// 11:23 and 11:24 for −232.26, −102.57, −91.80, −59.70 and −50.00: −536.33
// in ninety seconds, taking the record to −132.29 and the published balance
// below zero. September starts fresh from a fresh account.
//
// The instant is placed just after that last close (11:24:19) rather than
// at "now" when this was written, so no trade could fall into the gap
// between the two — and no position was open at the time, so nothing was
// cut off mid-flight either.
//
// IT IS A CUTOFF, NOT A DELETE. The old rows stay in `trade_signal` for two
// reasons that both matter: a position opened before the cutoff can still
// report its close through /api/trade-result, and that close has to find
// its original row so the result replies to the original post instead of
// appearing as an orphan card; and a published track record that can be
// quietly rewritten is not a track record. Every READ that feeds a public
// number filters to this instant instead — see scripts/check-signals-epoch.mjs,
// which fails the build if a new read forgets.
//
// Written in SIGNAL_TZ, which is also the terminal's server time (UTC+3),
// so this string is a timestamp from the account history read literally.
export const SIGNALS_EPOCH = new Date("2026-09-01T11:25:00+03:00");

// What the account starts the new record with, in USD. The board reports its
// balance against this, so a $24 day reads as what it is on a $1,000 account
// rather than as a number on an unstated one.
//
// Owner-set to 1000 on 2026-09-01, replacing the 100 the September record
// opened on.
//
// CHANGE THIS THE DAY THE ACCOUNT IS REFUNDED WITH A DIFFERENT AMOUNT. It
// is a published claim about real money, not a display default: every
// percentage on /signals is computed against it, so a balance that does not
// match the terminal makes every one of them wrong.
export const SIGNALS_START_BALANCE = 1000;
