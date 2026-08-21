import { createHash } from "crypto";
import { db } from "@/db";
import { economicCalendarCache } from "@/db/schema";
import { eq } from "drizzle-orm";

// TradingView's public economic-calendar endpoint — the same one their
// embeddable calendar widget reads. Free, no API key, and (unlike the
// ForexFactory/faireconomy feed this used to read) it actually reports
// `actual` once a figure is released. That feed only ever carried the
// schedule plus forecast/previous — no `actual` field at all, in the JSON
// or the XML — which silently broke both the "Gerçekleşen" column on
// /ekonomik-takvim and every economic-calendar-alert push: the cron's
// `actual === ""` filter matched every event, so it reported
// `notified: 0` on every run and never sent a single notification.
const FEED_URL = "https://economic-calendar.tradingview.com/events";

// Only the currencies the calendar board has flags for. National euro-area
// releases (DE/FR/IT/ES) are requested too and reported as EUR, which is
// how a forex calendar conventionally labels them.
const FEED_COUNTRIES = "US,EU,DE,FR,IT,ES,GB,JP,AU,NZ,CA,CH,CN,TR";

// Distinct from the old "current" row on purpose: that row holds a
// ForexFactory-shaped payload this file can no longer parse, so a fresh
// key keeps the first post-deploy read from feeding stale rows of the old
// shape into the new parser.
const CACHE_ID = "tv-thisweek";
const CACHE_TTL_MS = 5 * 60 * 1000;

export type CalendarImpact = "Low" | "Medium" | "High" | "Holiday";

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  impact: CalendarImpact;
  date: Date;
  forecast: string;
  previous: string;
  actual: string;
}

type FeedRow = {
  id?: string;
  title?: string;
  country?: string;
  indicator?: string;
  date?: string;
  importance?: number;
  unit?: string;
  scale?: string;
  actual?: number | null;
  forecast?: number | null;
  previous?: number | null;
};

// Stable across calls and across weeks — TradingView's own `id` is keyed
// to the indicator, not to the individual release, so reusing it as our
// dedup key would make next month's CPI look like one we already pushed.
// title+country+release-time is release-specific.
export function eventId(title: string, country: string, date: string): string {
  return createHash("sha1").update(`${title}|${country}|${date}`).digest("hex");
}

// The board's flag lookup is keyed by currency, and traders read a
// calendar in currencies rather than countries.
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  US: "USD",
  EU: "EUR",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  GB: "GBP",
  JP: "JPY",
  AU: "AUD",
  NZ: "NZD",
  CA: "CAD",
  CH: "CHF",
  CN: "CNY",
  TR: "TRY",
};

// Units that belong in front of the number rather than after it.
const PREFIX_UNITS = new Set(["$", "£", "€", "¥", "NZ$", "A$", "C$", "CA$", "AU$", "HK$"]);

function normalizeImpact(importance: number | undefined, indicator: string | undefined): CalendarImpact {
  if (indicator && /holiday/i.test(indicator)) return "Holiday";
  if (importance === 1) return "High";
  if (importance === 0) return "Medium";
  return "Low";
}

// The feed gives numbers plus a separate unit ("%", "$") and magnitude
// scale ("K"/"B"/"T"); the UI and the push body both want the single
// display string a calendar normally shows, e.g. "4.5%", "-15.8K", "$1.2B".
// An absent value must stay "" — that empty string is what marks an event
// as not-yet-released for both the board and the alert cron.
function formatValue(value: number | null | undefined, unit?: string, scale?: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";

  const magnitude = `${Math.abs(value)}${scale ?? ""}`;
  const sign = value < 0 ? "-" : "";

  if (unit && PREFIX_UNITS.has(unit)) return `${sign}${unit}${magnitude}`;
  if (unit) return `${sign}${magnitude}${unit === "%" ? "%" : ` ${unit}`}`;
  return `${sign}${magnitude}`;
}

function parseRows(rows: FeedRow[]): EconomicEvent[] {
  return rows
    .filter((r): r is FeedRow & { title: string; date: string } => Boolean(r.title && r.date))
    .map((r) => {
      const country = CURRENCY_BY_COUNTRY[r.country ?? ""] ?? r.country ?? "All";
      return {
        id: eventId(r.title, country, r.date),
        title: r.title,
        country,
        impact: normalizeImpact(r.importance, r.indicator),
        date: new Date(r.date),
        forecast: formatValue(r.forecast, r.unit, r.scale),
        previous: formatValue(r.previous, r.unit, r.scale),
        actual: formatValue(r.actual, r.unit, r.scale),
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Monday 00:00 through Sunday 24:00 Türkiye time (UTC+3, no DST) — the
// same week boundary the board groups its day headers by, so the page
// never shows a stray row belonging to a neighbouring week.
function weekWindow(now = new Date()): { from: string; to: string } {
  const istanbul = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const dayOfWeek = (istanbul.getUTCDay() + 6) % 7; // Monday = 0
  const mondayMidnightUtc = Date.UTC(
    istanbul.getUTCFullYear(),
    istanbul.getUTCMonth(),
    istanbul.getUTCDate() - dayOfWeek
  ) - 3 * 60 * 60 * 1000;

  return {
    from: new Date(mondayMidnightUtc).toISOString(),
    to: new Date(mondayMidnightUtc + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

async function fetchFeed(): Promise<FeedRow[]> {
  const { from, to } = weekWindow();
  const url = `${FEED_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&countries=${FEED_COUNTRIES}`;

  // The endpoint serves the TradingView widget and expects to be called
  // like it: without an Origin it can answer 403.
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Origin: "https://www.tradingview.com",
      Referer: "https://www.tradingview.com/",
      "User-Agent": "Mozilla/5.0 (compatible; FXPARTNER/1.0; +https://fxpartner.global)",
    },
  });
  if (!res.ok) throw new Error(`Economic calendar fetch failed: ${res.status}`);

  const body = (await res.json()) as { status?: string; result?: FeedRow[] };
  if (body.status !== "ok" || !Array.isArray(body.result)) {
    throw new Error(`Economic calendar feed returned status ${body.status ?? "unknown"}`);
  }
  return body.result;
}

// One DB-backed cache shared by every caller — page loads, the board's
// /api polling, and the 5-minute cron — so the upstream sees roughly one
// request per TTL window instead of one per visitor. On a fetch failure,
// serve whatever's cached (even stale) rather than showing an empty
// calendar or dropping a release.
export async function getWeekCalendar(): Promise<EconomicEvent[]> {
  const cached = await db.query.economicCalendarCache.findFirst({
    where: eq(economicCalendarCache.id, CACHE_ID),
  });

  const isFresh = cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;
  if (isFresh) {
    return parseRows(JSON.parse(cached.payload));
  }

  try {
    const rows = await fetchFeed();
    await db
      .insert(economicCalendarCache)
      .values({ id: CACHE_ID, payload: JSON.stringify(rows), fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: economicCalendarCache.id,
        set: { payload: JSON.stringify(rows), fetchedAt: new Date() },
      });
    return parseRows(rows);
  } catch (err) {
    if (cached) {
      console.error("Economic calendar feed fetch failed, serving stale cache:", err);
      return parseRows(JSON.parse(cached.payload));
    }
    throw err;
  }
}
