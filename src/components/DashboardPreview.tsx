import { scoreAxes, getBrokerScores, type Broker } from "@/data/brokers";

function averageAxis(brokers: Broker[], key: (typeof scoreAxes)[number]["key"]) {
  const sum = brokers.reduce((acc, b) => acc + getBrokerScores(b)[key], 0);
  return Math.round((sum / brokers.length) * 10) / 10;
}

export default function DashboardPreview({
  brokers,
  categoryCount,
  regulatorCount,
}: {
  brokers: Broker[];
  categoryCount: number;
  regulatorCount: number;
}) {
  const topBroker = [...brokers].sort(
    (a, b) => getBrokerScores(b).composite - getBrokerScores(a).composite
  )[0];
  const topScore = getBrokerScores(topBroker).composite;
  const avgRating =
    Math.round((brokers.reduce((sum, b) => sum + b.rating, 0) / brokers.length) * 10) / 10;

  return (
    <div className="featured-card-perspective">
      <div className="relative rounded-3xl border border-gold/25 bg-gradient-to-b from-ink-soft to-ink p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-poppins text-lg font-bold tracking-tight text-text-on-ink">
              FXPARTNER
            </span>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              Broker Comparison Panel
            </p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-gold">
              Top Index
            </p>
            <p className="font-poppins text-xl font-bold text-gold">{topScore.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {scoreAxes.map((axis) => (
            <div key={axis.key} className="rounded-xl border border-hairline bg-ink/60 p-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {axis.label}
              </p>
              <div className="mt-2 flex items-end gap-[3px]" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 rounded-[1px] ${
                      i < Math.round(averageAxis(brokers, axis.key))
                        ? "bg-signal"
                        : "bg-hairline"
                    }`}
                    style={{ height: 8 + i * 4 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-hairline pt-5">
          <div>
            <p className="font-poppins text-2xl font-bold text-text-on-ink">{brokers.length}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              Brokers
            </p>
          </div>
          <div>
            <p className="font-poppins text-2xl font-bold text-text-on-ink">{avgRating}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              Avg. Rating
            </p>
          </div>
          <div>
            <p className="font-poppins text-2xl font-bold text-text-on-ink">{regulatorCount}+</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              Regulators
            </p>
          </div>
        </div>

        <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
          {categoryCount} categories · Updated live from editorial reviews
        </p>
      </div>
    </div>
  );
}
