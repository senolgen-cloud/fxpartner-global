"use client";

import { useEffect, useState } from "react";

const SIZE = 176;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function toneForScore(score: number): { stroke: string; text: string; label: string } {
  if (score >= 7.5) return { stroke: "var(--tick-up)", text: "text-tick-up", label: "Strong" };
  if (score >= 5) return { stroke: "var(--gold)", text: "text-gold", label: "Fair" };
  return { stroke: "var(--alert)", text: "text-alert", label: "Weak" };
}

export default function TrustGauge({ score }: { score: number }) {
  // Starts unfilled on both server and client render (mounted=false) so the
  // ring visibly sweeps in on mount instead of just appearing pre-filled —
  // same "animate from 0 after mount" trick as MiniScoreRings.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const pct = Math.max(0, Math.min(10, score)) / 10;
  const offset = CIRCUMFERENCE * (1 - (mounted ? pct : 0));
  const tone = toneForScore(score);

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--hairline)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular-stat font-display text-4xl font-semibold text-text-on-ink">
            {score.toFixed(1)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            / 10 Index
          </span>
        </div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`mt-3 ${tone.text}`}>
        <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span className={`mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] ${tone.text}`}>
        {tone.label} Trust Signal
      </span>
    </div>
  );
}
