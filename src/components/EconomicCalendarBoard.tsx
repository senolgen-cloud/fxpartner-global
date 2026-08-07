"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarImpact, EconomicEvent } from "@/lib/economicCalendar";

type EventJson = Omit<EconomicEvent, "date"> & { date: string };

const POLL_MS = 60000;

// Currency/country codes the feed uses -> flag emoji, for a quick visual
// scan without pulling in a flag icon library.
const FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  TRY: "🇹🇷",
  All: "🌐",
};

const IMPACT_COLOR: Record<CalendarImpact, string> = {
  High: "#e5484d",
  Medium: "#c9a227",
  Low: "var(--text-on-ink-muted)",
  Holiday: "var(--text-on-ink-muted)",
};

function toEvent(e: EventJson): EconomicEvent {
  return { ...e, date: new Date(e.date) };
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

function groupByDay(events: EconomicEvent[]) {
  const groups = new Map<string, EconomicEvent[]>();
  for (const e of events) {
    const key = e.date.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function EventRow({ event }: { event: EconomicEvent }) {
  const isReleased = event.actual !== "";
  const isFuture = event.date.getTime() > Date.now();

  return (
    <div className="grid grid-cols-[64px_1fr_auto] items-center gap-3 border-b border-hairline px-4 py-3 last:border-0 sm:grid-cols-[64px_28px_1fr_100px_80px_80px_80px]">
      <span className="font-mono text-xs text-text-on-ink-muted">
        {event.date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
      </span>
      <span className="hidden text-base sm:inline" aria-hidden="true">
        {FLAGS[event.country] ?? "🏳️"}
      </span>
      <span className="text-sm text-text-on-ink">
        <span className="mr-2 inline sm:hidden">{FLAGS[event.country] ?? "🏳️"}</span>
        {event.title}
        <span className="ml-2 font-mono text-[10px] uppercase text-text-on-ink-muted">{event.country}</span>
      </span>
      <span
        className="hidden font-mono text-[10px] font-semibold uppercase tracking-wide sm:block"
        style={{ color: IMPACT_COLOR[event.impact] }}
      >
        {event.impact !== "Holiday" && event.impact}
      </span>
      <span className="hidden font-mono text-xs text-text-on-ink-muted sm:block">{event.previous || "—"}</span>
      <span className="hidden font-mono text-xs text-text-on-ink-muted sm:block">{event.forecast || "—"}</span>
      <span
        className="hidden font-mono text-xs font-semibold sm:block"
        style={{ color: isReleased ? "var(--signal)" : "var(--text-on-ink-muted)" }}
      >
        {isReleased ? event.actual : isFuture ? "—" : "…"}
      </span>
    </div>
  );
}

export default function EconomicCalendarBoard({ initialEvents }: { initialEvents: EconomicEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/economic-calendar", { cache: "no-store" });
        if (!res.ok || !mounted.current) return;
        const data: { events: EventJson[] } = await res.json();
        if (!mounted.current) return;
        setEvents(data.events.map(toEvent));
      } catch {
        // Transient fetch failure — next poll tick retries.
      }
    }, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const mediumHighOnly = events.filter((e) => e.impact === "Medium" || e.impact === "High" || e.impact === "Holiday");
  const groups = groupByDay(mediumHighOnly);

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-ink-soft">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <div className="grid grid-cols-[64px_28px_1fr_100px_80px_80px_80px] gap-3 text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted max-sm:hidden">
          <span>Saat</span>
          <span />
          <span>Veri</span>
          <span>Önem</span>
          <span>Önceki</span>
          <span>Beklenti</span>
          <span>Gerçekleşen</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal">
          <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          Canlı
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="px-6 py-8 text-sm text-text-on-ink-muted">Bu hafta için veri bulunamadı.</p>
      ) : (
        groups.map(([day, dayEvents]) => (
          <div key={day}>
            <div className="border-b border-hairline bg-paper px-6 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-signal">
              {dayLabel(dayEvents[0].date)}
            </div>
            {dayEvents.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
