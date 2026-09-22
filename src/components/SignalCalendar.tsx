"use client";

import { useMemo, useState } from "react";
import { useIntlLocale, useTr, useTrf } from "@/components/useTr";
import { SIGNAL_TZ } from "@/lib/signalPeriods";

// Month-at-a-glance trading calendar for /signals, in the shape traders
// already read their own journals in: one cell per day, coloured by that
// day's realised P/L, with a weekly total at the end of each row.
//
// It replaces the old "Aylık Fiyat Farkı" bar strip. The bars answered "how
// did each month end"; the calendar answers that (the month total sits in
// the header) and also the question the bars hid — whether a month was
// steady or one good day carrying three bad weeks.
//
// Days are cut in SIGNAL_TZ, the same Europe/Istanbul day the period summary
// at the top of the page uses, so a trade closed at 01:30 Istanbul time lands
// on the same "today" in both places. "Now" is never read here: today and the
// current month come in as the server-computed period boundaries, so the
// server and client renders agree at midnight (see lib/signalPeriods.ts).
//
// The board loads the last 250 closed trades (signals/page.tsx), so the
// earliest month can be partial. Navigation stops at the first month that
// has a trade rather than offering empty months before the record starts.

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";

export type CalendarTrade = {
  closedAt: Date;
  profit: number;
  pair: string;
};

type DayCell = { key: string; total: number; count: number; trades: CalendarTrade[] };

// "YYYY-MM-DD" of an instant as seen on an Istanbul wall clock.
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: SIGNAL_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
function dayKey(d: Date): string {
  return dayKeyFormat.format(d);
}

// Month arithmetic runs on plain {year, month} pairs in UTC so no local
// timezone or DST can move a date across a boundary. Only the *labels* of
// real instants (dayKey) involve SIGNAL_TZ.
type YearMonth = { y: number; m: number }; // m: 0-11
function ymOf(key: string): YearMonth {
  return { y: Number(key.slice(0, 4)), m: Number(key.slice(5, 7)) - 1 };
}
function ymIndex(ym: YearMonth): number {
  return ym.y * 12 + ym.m;
}
function ymFromIndex(i: number): YearMonth {
  return { y: Math.floor(i / 12), m: i % 12 };
}
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// ISO-8601 week number for a calendar date, the numbering a trader's broker
// statement and most journals use.
function isoWeek(y: number, m: number, d: number): number {
  const t = new Date(Date.UTC(y, m, d));
  const dow = (t.getUTCDay() + 6) % 7; // Monday = 0
  t.setUTCDate(t.getUTCDate() - dow + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const firstDow = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDow + 3);
  return 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

function formatUsd(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  // Whole dollars from $100 up: a cell is ~90px wide and "+$10,836.00" does
  // not fit it, while the cents on a four-figure day tell nobody anything.
  const digits = abs >= 100 ? 0 : 2;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

// Phone cells are ~40px of text: "+1.2K" and "−353" fit, "+$19.00" does not.
// No "$" and no cents here — the week strip under the row carries the full
// dollar figure, the cell only has to say which way and roughly how much.
function formatUsdCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  if (abs < 1000) return `${sign}${Math.round(abs)}`;
  return `${sign}${(abs / 1000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
}

function tone(value: number) {
  const color = value >= 0 ? TICK_UP : TICK_DOWN;
  return { color, background: `${color}1f`, borderColor: `${color}59` };
}

export default function SignalCalendar({
  trades,
  dayStart,
}: {
  trades: CalendarTrade[];
  dayStart: number;
}) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();

  const todayKey = dayKey(new Date(dayStart));
  const currentIdx = ymIndex(ymOf(todayKey));

  const { byDay, firstIdx, lastTradeIdx } = useMemo(() => {
    const map = new Map<string, DayCell>();
    let first = Infinity;
    let last = -Infinity;
    for (const t of trades) {
      const key = dayKey(t.closedAt);
      const cell = map.get(key) ?? { key, total: 0, count: 0, trades: [] };
      cell.total += t.profit;
      cell.count += 1;
      cell.trades.push(t);
      map.set(key, cell);
      const idx = ymIndex(ymOf(key));
      first = Math.min(first, idx);
      last = Math.max(last, idx);
    }
    return { byDay: map, firstIdx: first, lastTradeIdx: last };
  }, [trades]);

  const hasData = Number.isFinite(firstIdx);
  const minIdx = hasData ? firstIdx : currentIdx;
  const maxIdx = Math.max(currentIdx, hasData ? lastTradeIdx : currentIdx);

  // Opens on the current month — unless it has no closed trade yet (the
  // first days of a month), in which case the latest month with a record,
  // so the first thing a visitor sees is never an empty grid.
  const currentHasTrades = hasData && [...byDay.keys()].some((k) => ymIndex(ymOf(k)) === currentIdx);
  const [viewIdx, setViewIdx] = useState(currentHasTrades || !hasData ? currentIdx : lastTradeIdx);
  const view = ymFromIndex(viewIdx);

  const monthLabel = new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString(intl, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  // 2024-01-01 was a Monday; seven days from it give localized weekday names.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(intl, { weekday: "short", timeZone: "UTC" })
  );

  // Weeks run Monday–Sunday, padded with the neighbouring months' days.
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const leading = (new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() + 6) % 7;
  const weeks: { y: number; m: number; d: number; inMonth: boolean }[][] = [];
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(Date.UTC(view.y, view.m, 1 - leading + i));
    const cell = {
      y: date.getUTCFullYear(),
      m: date.getUTCMonth(),
      d: date.getUTCDate(),
      inMonth: date.getUTCMonth() === view.m,
    };
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(cell);
  }

  let monthTotal = 0;
  let monthCount = 0;
  let greenDays = 0;
  let tradingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = byDay.get(`${view.y}-${pad(view.m + 1)}-${pad(d)}`);
    if (!cell) continue;
    monthTotal += cell.total;
    monthCount += cell.count;
    tradingDays += 1;
    if (cell.total > 0) greenDays += 1;
  }

  const navButton =
    "flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-text-on-ink transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={navButton}
            onClick={() => setViewIdx((i) => Math.max(minIdx, i - 1))}
            disabled={viewIdx <= minIdx}
            aria-label={tr("Önceki ay")}
          >
            <span aria-hidden="true" className="rtl:rotate-180">‹</span>
          </button>
          <h3 className="min-w-[9.5rem] text-center font-display text-lg font-semibold capitalize text-text-on-ink">
            {monthLabel}
          </h3>
          <button
            type="button"
            className={navButton}
            onClick={() => setViewIdx((i) => Math.min(maxIdx, i + 1))}
            disabled={viewIdx >= maxIdx}
            aria-label={tr("Sonraki ay")}
          >
            <span aria-hidden="true" className="rtl:rotate-180">›</span>
          </button>
          {viewIdx !== currentIdx && (
            <button
              type="button"
              onClick={() => setViewIdx(currentIdx)}
              className="ms-1 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-text-on-ink transition-colors hover:bg-ink"
            >
              {tr("Bu ay")}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-text-on-ink-muted">{tr("Ay toplamı")}:</span>
          <span
            dir="ltr"
            className="rounded-full border px-2.5 py-1 font-semibold tabular-stat"
            style={monthCount ? tone(monthTotal) : undefined}
          >
            {monthCount ? formatUsd(monthTotal) : "—"}
          </span>
          <span className="rounded-full border border-hairline px-2.5 py-1 text-text-on-ink">
            {trf("{count} işlem", { count: monthCount })}
          </span>
          {tradingDays > 0 && (
            <span className="rounded-full border border-hairline px-2.5 py-1 text-text-on-ink">
              {trf("{green}/{days} kârlı gün", { green: greenDays, days: tradingDays })}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 md:grid-cols-8 md:gap-1.5">
        {weekdays.map((w) => (
          <div
            key={w}
            className="rounded-md border border-hairline py-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-text-on-ink-muted"
          >
            {w}
          </div>
        ))}
        <div className="hidden md:block" />

        {weeks.map((week) => {
          const weekCells = week
            .filter((c) => c.inMonth)
            .map((c) => byDay.get(`${c.y}-${pad(c.m + 1)}-${pad(c.d)}`))
            .filter((c): c is DayCell => !!c);
          const weekTotal = weekCells.reduce((s, c) => s + c.total, 0);
          const weekCount = weekCells.reduce((s, c) => s + c.count, 0);
          const monday = week[0];
          const weekNo = isoWeek(monday.y, monday.m, monday.d);

          return [
            ...week.map((c) => {
              const key = `${c.y}-${pad(c.m + 1)}-${pad(c.d)}`;
              const cell = c.inMonth ? byDay.get(key) : undefined;
              const isToday = key === todayKey;
              const detail = cell?.trades.map((t) => `${t.pair} ${formatUsd(t.profit)}`).join(" · ");
              return (
                <div
                  key={key}
                  title={detail}
                  className={`relative flex min-h-14 flex-col rounded-md border p-1 md:min-h-24 md:rounded-lg md:p-2 ${
                    c.inMonth ? "border-hairline bg-ink/40" : "border-transparent bg-ink/15"
                  }`}
                  style={cell ? tone(cell.total) : undefined}
                >
                  <span
                    className={`self-end font-mono text-[10px] md:text-xs ${
                      isToday
                        ? "flex h-5 w-5 items-center justify-center rounded-full bg-signal font-semibold text-on-signal"
                        : c.inMonth
                          ? "text-text-on-ink-muted"
                          : "text-text-on-ink-muted/40"
                    }`}
                  >
                    {c.d}
                  </span>
                  {cell && (
                    <div className="mt-auto text-end">
                      {/* dir="ltr" on every figure: in the Arabic tree the
                          bidi algorithm otherwise moves the sign to the end
                          ("$956+"). */}
                      <div
                        dir="ltr"
                        className="whitespace-nowrap font-display text-[10px] font-semibold leading-tight tabular-stat md:text-base"
                        style={{ color: tone(cell.total).color }}
                      >
                        <span className="md:hidden">{formatUsdCompact(cell.total)}</span>
                        <span className="hidden md:inline">{formatUsd(cell.total)}</span>
                      </div>
                      <div className="hidden font-mono text-[10px] text-text-on-ink-muted md:block">
                        {trf("{count} işlem", { count: cell.count })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }),
            // Phones: the week total drops under its row as a slim strip.
            // md+: it is the eighth column, as in a trading journal.
            <div
              key={`w${weekNo}-${monday.y}`}
              className="col-span-7 mb-1.5 flex items-center justify-between rounded-md border border-hairline bg-ink/60 px-3 py-1.5 md:col-span-1 md:mb-0 md:flex-col md:items-start md:justify-center md:gap-1.5 md:rounded-lg md:p-3"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {trf("Hafta {n}", { n: weekNo })}
              </span>
              <span className="flex items-baseline gap-2 md:flex-col md:gap-1">
                <span
                  dir="ltr"
                  className="font-display text-sm font-semibold tabular-stat md:text-base"
                  style={{ color: weekCount ? tone(weekTotal).color : undefined }}
                >
                  {weekCount ? formatUsd(weekTotal) : "—"}
                </span>
                {weekCount > 0 && (
                  <span className="font-mono text-[10px] text-text-on-ink-muted">
                    {trf("{count} işlem", { count: weekCount })}
                  </span>
                )}
              </span>
            </div>,
          ];
        })}
      </div>
    </div>
  );
}
