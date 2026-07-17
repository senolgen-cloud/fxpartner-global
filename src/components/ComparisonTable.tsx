import Link from "next/link";
import { brokers, getBrokerScores } from "@/data/brokers";

export default function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-hairline">
      <table className="w-full min-w-[840px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline bg-ink-soft">
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
              Broker
            </th>
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-gold">
              Endeks
            </th>
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
              Puan
            </th>
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
              Min. Yatırım
            </th>
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
              Maks. Kaldıraç
            </th>
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
              Düzenleme
            </th>
            <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
              Platform
            </th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {brokers.map((b, i) => (
            <tr
              key={b.slug}
              className={`border-b border-hairline last:border-b-0 ${
                i % 2 === 0 ? "bg-ink" : "bg-ink-soft"
              }`}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-signal">
                    {String(b.rank).padStart(2, "0")}
                  </span>
                  <span className="font-display text-base font-medium text-text-on-ink">
                    {b.name}
                  </span>
                </div>
              </td>
              <td className="tabular-stat px-5 py-4 font-mono text-sm font-semibold text-gold">
                {getBrokerScores(b).composite.toFixed(1)}
              </td>
              <td className="tabular-stat px-5 py-4 font-mono text-sm text-text-on-ink">
                {b.rating.toFixed(1)}
              </td>
              <td className="tabular-stat px-5 py-4 font-mono text-sm text-text-on-ink">
                {b.minDeposit}
              </td>
              <td className="tabular-stat px-5 py-4 font-mono text-sm text-text-on-ink">
                {b.maxLeverage}
              </td>
              <td className="px-5 py-4 font-mono text-xs text-text-on-ink-muted">
                {b.regulators[0]}
                {b.regulators.length > 1 ? ` +${b.regulators.length - 1}` : ""}
              </td>
              <td className="px-5 py-4 font-mono text-xs text-text-on-ink-muted">
                {b.platforms.join(" / ")}
              </td>
              <td className="px-5 py-4 text-right">
                <Link
                  href={`/brokerlar/${b.slug}`}
                  className="font-mono text-xs text-signal transition-colors hover:text-text-on-ink"
                >
                  İncele →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
