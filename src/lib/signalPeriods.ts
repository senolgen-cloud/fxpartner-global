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
  };
}

// The minimum sample a win rate may be published from. Defined here rather
// than in signalStats.ts because that module imports db and so can never
// reach a client bundle, while this one can — and the page and the Telegram
// posts have to apply the same rule. Below this many decisive trades a rate
// is noise dressed up as evidence, whatever surface is showing it.
export const MIN_TRADES_FOR_RATE = 15;
