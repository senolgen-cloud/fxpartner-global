import Link from "next/link";
import { getBrokerScores, type Broker } from "@/data/brokers";

export default function DashboardPreview({
  brokers,
  categoryCount,
  regulatorCount,
}: {
  brokers: Broker[];
  categoryCount: number;
  regulatorCount: number;
}) {
  const ranked = [...brokers].sort(
    (a, b) => getBrokerScores(b).composite - getBrokerScores(a).composite
  );
  const top10 = ranked.slice(0, 10);
  const topScore = getBrokerScores(top10[0]).composite;
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

        <div className="mt-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-on-ink-muted">
            Top 10 Brokers
          </p>
          <div className="relative mt-2 h-[220px] overflow-hidden rounded-xl border border-hairline bg-ink/60">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-ink-soft to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-ink-soft to-transparent"
            />
            <div className="ticker-track-vertical">
              {[...top10, ...top10].map((broker, i) => (
                <Link
                  key={`${broker.slug}-${i}`}
                  href={`/brokers/${broker.slug}`}
                  className="flex items-center justify-between gap-3 border-b border-hairline/60 px-3 py-2.5 transition-colors hover:bg-ink"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-text-on-ink-muted">
                      {String(broker.rank).padStart(2, "0")}
                    </span>
                    <span className="font-poppins text-[13px] font-medium text-text-on-ink">
                      {broker.name}
                    </span>
                  </div>
                  <span className="tabular-stat font-mono text-[12px] font-semibold text-gold">
                    {getBrokerScores(broker).composite.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
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
