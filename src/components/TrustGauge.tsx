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
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const offset = CIRCUMFERENCE * (1 - pct);
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
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
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
      <span className={`mt-3 font-mono text-[11px] uppercase tracking-[0.2em] ${tone.text}`}>
        {tone.label} Trust Signal
      </span>
    </div>
  );
}
