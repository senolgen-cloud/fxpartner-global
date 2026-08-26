"use client";

import { useCountUp } from "@/components/useCountUp";

/**
 * One figure in the statement strip, counted up on arrival.
 *
 * The same hook the live signals board uses, so the panel and the board move
 * the same way — one easing, one duration, one feel. Reduced motion gets the
 * number without the count; the hook handles that.
 *
 * Labels arrive already translated. This is a client component and the server
 * tr() would silently hand every reader Turkish here — the trap LotLadder
 * fell into, which scripts/check-client-tr.mjs now watches for.
 */
export default function StatementFigure({
  label,
  value,
  hint,
  live = false,
  tone = "default",
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "en-US",
}: {
  label: string;
  value: number;
  hint?: string;
  live?: boolean;
  tone?: "default" | "up";
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}) {
  const { ref, display } = useCountUp(value, 1100, decimals, locale);

  return (
    <div ref={ref} className="flex-1 px-5 py-4 text-center sm:text-start">
      <div className="flex items-center justify-center gap-1.5 sm:justify-start">
        {live && (
          <span
            aria-hidden="true"
            className="signal-dot h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
          />
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-on-ink-muted">
          {label}
        </span>
      </div>
      <div
        className={`mt-1.5 font-display text-2xl font-semibold tabular-stat ${
          tone === "up" ? "text-tick-up" : "text-text-on-ink"
        }`}
      >
        {prefix}
        {display}
        {suffix}
      </div>
      {hint && <div className="mt-0.5 text-[11px] leading-snug text-text-on-ink-muted">{hint}</div>}
    </div>
  );
}
