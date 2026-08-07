import { createHash } from "crypto";

// ForexFactory's public weekly calendar feed — free, no API key, widely
// used by third-party calendar widgets/EAs. Returns real scheduled macro
// events (CPI, NFP, rate decisions, etc.) with forecast/previous values,
// and fills in `actual` once the real figure is released.
const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

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

export async function getWeekCalendar(): Promise<EconomicEvent[]> {
  const res = await fetch(FEED_URL, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Economic calendar fetch failed: ${res.status}`);
  const rows: FeedRow[] = await res.json();

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
