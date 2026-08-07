import { createHash } from "crypto";
import { db } from "@/db";
import { economicCalendarCache } from "@/db/schema";
import { eq } from "drizzle-orm";

// ForexFactory's public weekly calendar feed — free, no API key, widely
// used by third-party calendar widgets/EAs. Returns real scheduled macro
// events (CPI, NFP, rate decisions, etc.) with forecast/previous values,
// and fills in `actual` once the real figure is released.
const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const CACHE_ID = "current";
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
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual: string;
};

// Stable across calls within the same week — the feed has no numeric id,
// so title+country+date is the closest thing to one.
export function eventId(title: string, country: string, date: string): string {
  return createHash("sha1").update(`${title}|${country}|${date}`).digest("hex");
}

function normalizeImpact(raw: string): CalendarImpact {
  if (raw === "High" || raw === "Medium" || raw === "Low" || raw === "Holiday") return raw;
  return "Low";
}

function parseRows(rows: FeedRow[]): EconomicEvent[] {
  return rows.map((r) => ({
    id: eventId(r.title, r.country, r.date),
    title: r.title,
    country: r.country,
    impact: normalizeImpact(r.impact),
    date: new Date(r.date),
    forecast: r.forecast ?? "",
    previous: r.previous ?? "",
    actual: r.actual ?? "",
  }));
}

async function fetchFeed(): Promise<FeedRow[]> {
  const res = await fetch(FEED_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Economic calendar fetch failed: ${res.status}`);
  return res.json();
}

// The free ForexFactory feed rate-limits fairly aggressively (429s with a
// multi-minute Retry-After) once several serverless instances plus every
// visitor's client-side poll all hit it independently. Sharing one
// DB-backed cache across all of that — page loads, /api polling, and the
// cron — keeps us to roughly one upstream request per TTL window instead
// of one per request. On a fetch failure, serve whatever's cached (even
// stale) rather than showing an empty calendar or dropping a release.
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
