"use client";

import { useEffect, useState } from "react";
import { getBrokerScores, type Broker } from "@/data/brokers";

const SIZE = 40;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function toneForAxisScore(score: number): string {
  if (score >= 3.75) return "var(--tick-up)";
  if (score >= 2.5) return "var(--gold)";
  return "var(--alert)";
}

function Ring({
  label,
  score,
  mounted,
  mutedClass,
  labelClass,
}: {
  label: string;
  score: number;
  mounted: boolean;
  mutedClass: string;
  labelClass: string;
}) {
  const pct = Math.max(0, Math.min(5, score)) / 5;
  const offset = CIRCUMFERENCE * (1 - (mounted ? pct : 0));
  const stroke = toneForAxisScore(score);

  return (
    <div className="flex flex-col items-center gap-1">
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
            stroke={stroke}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`tabular-stat font-mono text-[10px] font-semibold ${labelClass}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <span className={`font-mono text-[8px] uppercase tracking-[0.1em] ${mutedClass}`}>
        {label}
      </span>
    </div>
  );
}

export default function MiniScoreRings({
  broker,
  tone = "dark",
}: {
  broker: Broker;
  tone?: "light" | "dark";
}) {
  const [mounted, setMounted] = useState(false);
  const scores = getBrokerScores(broker);
  const mutedClass = tone === "dark" ? "text-text-on-ink-muted" : "text-text-muted";
  const labelClass = tone === "dark" ? "text-text-on-ink" : "text-text-dark";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex shrink-0 items-start gap-3">
      <Ring
        label="Reg."
        score={scores.regulation}
        mounted={mounted}
        mutedClass={mutedClass}
        labelClass={labelClass}
      />
      <Ring
        label="Mly."
        score={scores.cost}
        mounted={mounted}
        mutedClass={mutedClass}
        labelClass={labelClass}
      />
      <Ring
        label="Çek."
        score={scores.withdrawal}
        mounted={mounted}
        mutedClass={mutedClass}
        labelClass={labelClass}
      />
    </div>
  );
}
