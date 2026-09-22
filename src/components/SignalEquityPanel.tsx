"use client";

import { useState } from "react";
import { useIntlLocale, useTr, useTrf } from "@/components/useTr";
import { SIGNAL_TZ } from "@/lib/signalPeriods";
import type { CalendarTrade } from "@/components/SignalCalendar";

// The right-hand column beside the trading calendar on /signals: the equity
// curve and the latest closed trades, the two things a trading journal puts
// next to its calendar.
//
// The curve is the running sum of REALISED dollar P/L in close order — the
// same figures the headline total adds up, so its last point is that total.
// It replaced the small sparkline that used to sit under the headline; two
// drawings of one series in one card read as two different series.
//
// Both take the trades already filtered and sorted oldest-first by
// PipsStats, so this file never re-decides what counts as a trade.

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";

function formatUsd(value: number, digits = 0): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

// A 1-2-5 step that yields four to six gridlines over the range.
function niceStep(range: number): number {
  const raw = range / 4;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  const norm = raw / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function shortUsd(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}K`;
  return `${sign}$${abs}`;
}

export function EquityCurve({ trades }: { trades: CalendarTrade[] }) {
  const tr = useTr();
  const trf = useTrf();
  const intl = useIntlLocale();
  const [hover, setHover] = useState<number | null>(null);

  // Starts from a zero point so the first trade is a step, not the origin.
  const points = trades.reduce<number[]>(
    (acc, t) => {
      acc.push(acc[acc.length - 1] + t.profit);
      return acc;
    },
    [0]
  );

  const W = 400;
  const H = 200;
  const PAD_L = 46;
  const PAD_R = 8;
  const PAD_T = 10;
  const PAD_B = 24;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const rawMin = Math.min(0, ...points);
  const rawMax = Math.max(0, ...points);
  const step = niceStep(rawMax - rawMin || 1);
  const minY = Math.floor(rawMin / step) * step;
  const maxY = Math.ceil(rawMax / step) * step || step;
  const ticks: number[] = [];
  for (let v = minY; v <= maxY + step / 2; v += step) ticks.push(Math.round(v));

  const x = (i: number) => PAD_L + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => PAD_T + (1 - (v - minY) / (maxY - minY)) * plotH;
  const zeroY = y(0);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;

  const dateLabel = (i: number) => {
    // Point 0 is the synthetic start; it borrows the first trade's date.
    const t = trades[Math.max(0, i - 1)];
    return t
      ? t.closedAt.toLocaleDateString(intl, { day: "2-digit", month: "2-digit", timeZone: SIGNAL_TZ })
      : "";
  };
  const xTicks =
    points.length > 1
      ? Array.from(new Set([0, 1, 2, 3].map((k) => Math.round((k / 3) * (points.length - 1)))))
      : [];

  const last = points[points.length - 1];
  const shown = hover ?? points.length - 1;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    // The SVG scales uniformly, so a fraction of the rect is a fraction of plotW.
    const frac = (e.clientX - box.left) / box.width;
    // RTL pages mirror nothing inside an SVG, so no flip is needed here.
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(frac * (points.length - 1)))));
  }

  return (
    <div className="rounded-xl border border-hairline bg-ink/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3
          className="font-display text-sm font-semibold text-text-on-ink"
          title={tr("Kapanan işlemlerin gerçekleşen kâr/zararının, kapanış sırasıyla kümülatif toplamı")}
        >
          {tr("Sermaye Eğrisi")}
        </h3>
        <div className="text-end font-mono text-[11px]">
          <span dir="ltr" className="font-semibold" style={{ color: points[shown] >= 0 ? TICK_UP : TICK_DOWN }}>
            {formatUsd(points[shown])}
          </span>
          {shown > 0 && <span className="ms-2 text-text-on-ink-muted">{dateLabel(shown)}</span>}
        </div>
      </div>

      {/* direction: ltr — on the Arabic tree an inherited rtl direction
          flips every text-anchor, putting the axis labels inside the plot. */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={tr("Sermaye Eğrisi")}
        style={{ direction: "ltr" }}
      >
        <defs>
          <clipPath id="eq-above">
            <rect x="0" y="0" width={W} height={zeroY} />
          </clipPath>
          <clipPath id="eq-below">
            <rect x="0" y={zeroY} width={W} height={H - zeroY} />
          </clipPath>
          <linearGradient id="eq-fill-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TICK_UP} stopOpacity="0.35" />
            <stop offset="100%" stopColor={TICK_UP} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="eq-fill-down" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={TICK_DOWN} stopOpacity="0.35" />
            <stop offset="100%" stopColor={TICK_DOWN} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--text-on-ink-muted)"
              strokeOpacity={v === 0 ? 0.45 : 0.15}
              strokeDasharray={v === 0 ? undefined : "3 4"}
            />
            <text
              x={PAD_L - 6}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-text-on-ink-muted font-mono"
              fontSize="10"
            >
              {shortUsd(v)}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#eq-fill-up)" clipPath="url(#eq-above)" />
        <path d={area} fill="url(#eq-fill-down)" clipPath="url(#eq-below)" />
        <path d={line} fill="none" stroke={TICK_UP} strokeWidth="2" strokeLinejoin="round" clipPath="url(#eq-above)" />
        <path d={line} fill="none" stroke={TICK_DOWN} strokeWidth="2" strokeLinejoin="round" clipPath="url(#eq-below)" />

        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={PAD_T}
            y2={PAD_T + plotH}
            stroke="var(--text-on-ink-muted)"
            strokeOpacity="0.4"
          />
        )}
        <circle
          cx={x(shown)}
          cy={y(points[shown])}
          r="4"
          fill={points[shown] >= 0 ? TICK_UP : TICK_DOWN}
          stroke="var(--color-ink, #0b0f14)"
          strokeWidth="1.5"
        />

        {xTicks.map((i, k) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor={k === 0 ? "start" : k === xTicks.length - 1 ? "end" : "middle"}
            className="fill-text-on-ink-muted font-mono"
            fontSize="10"
          >
            {dateLabel(i)}
          </text>
        ))}

        <rect
          x={PAD_L}
          y={PAD_T}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          style={{ touchAction: "pan-y" }}
        />
      </svg>

      <p className="mt-1 font-mono text-[10px] text-text-on-ink-muted">
        <span dir="ltr">{formatUsd(last)}</span> · {trf("{count} işlem", { count: trades.length })}
      </p>
    </div>
  );
}

export function RecentTrades({ trades, limit = 8 }: { trades: CalendarTrade[]; limit?: number }) {
  const tr = useTr();
  const intl = useIntlLocale();
  const rows = trades.slice(-limit).reverse();

  return (
    <div className="rounded-xl border border-hairline bg-ink/40 p-4">
      <h3 className="font-display text-sm font-semibold text-text-on-ink">{tr("Son İşlemler")}</h3>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
            <th className="pb-2 text-start font-normal">{tr("Kapanış")}</th>
            <th className="pb-2 text-start font-normal">{tr("Sembol")}</th>
            <th className="pb-2 text-end font-normal">{tr("Sonuç")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {rows.map((t, i) => (
            <tr key={`${t.closedAt.getTime()}-${t.pair}-${i}`}>
              <td className="py-2 font-mono text-[12px] text-text-on-ink-muted">
                {t.closedAt.toLocaleDateString(intl, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  timeZone: SIGNAL_TZ,
                })}
              </td>
              <td className="py-2 font-display font-semibold text-text-on-ink">{t.pair}</td>
              <td
                dir="ltr"
                className="py-2 text-end font-mono font-semibold tabular-stat rtl:text-start"
                style={{ color: t.profit >= 0 ? TICK_UP : TICK_DOWN }}
              >
                {formatUsd(t.profit, Math.abs(t.profit) < 100 ? 2 : 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
