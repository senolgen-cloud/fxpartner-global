import { scoreAxes, getBrokerScores, type Broker, type ScoreAxisKey } from "@/data/brokers";

function Ladder({
  score,
  tone,
}: {
  score: number;
  tone: "light" | "dark";
}) {
  const filledClass = tone === "dark" ? "bg-text-on-ink" : "bg-ink";
  const emptyClass = tone === "dark" ? "bg-hairline" : "bg-hairline-light";

  return (
    <div className="flex items-end gap-[3px]" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-[1px] ${i < score ? filledClass : emptyClass}`}
          style={{ height: 6 + i * 3 }}
        />
      ))}
    </div>
  );
}

export default function TrustIndex({
  broker,
  tone = "light",
  showDescriptions = false,
  wide = false,
}: {
  broker: Broker;
  tone?: "light" | "dark";
  showDescriptions?: boolean;
  wide?: boolean;
}) {
  const scores = getBrokerScores(broker);
  const mutedClass = tone === "dark" ? "text-text-on-ink-muted" : "text-text-muted";
  const labelClass = tone === "dark" ? "text-text-on-ink" : "text-text-dark";
  const borderClass = tone === "dark" ? "border-hairline" : "border-hairline-light";

  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono text-[10px] uppercase tracking-[0.15em] ${mutedClass}`}>
          FXPARTNER Index
        </span>
        <span
          className={`tabular-stat font-display text-xl font-semibold leading-none ${labelClass}`}
        >
          {scores.composite.toFixed(1)}
        </span>
        <span className={`font-mono text-[10px] ${mutedClass}`}>/10</span>
      </div>

      <div
        className={`mt-3 border-t ${borderClass} pt-3 ${
          wide ? "grid gap-x-8 gap-y-3 sm:grid-cols-2" : "space-y-2.5"
        }`}
      >
        {scoreAxes.map((axis) => (
          <div key={axis.key}>
            <div className="flex items-center justify-between gap-3">
              <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${mutedClass}`}>
                <span className="text-signal">{axis.n}</span> {axis.label}
              </span>
              <Ladder score={scores[axis.key as ScoreAxisKey]} tone={tone} />
            </div>
            {showDescriptions && (
              <p className={`mt-1 max-w-sm text-xs leading-relaxed ${mutedClass}`}>
                {axis.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
