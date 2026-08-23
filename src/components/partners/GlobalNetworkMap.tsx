import { networkRegions, networkArcs } from "@/data/partnerProgram";
import { trData } from "@/lib/localizeContent";

function getRegion(key: string) {
  return trData(networkRegions).find((r) => r.key === key)!;
}

export default function GlobalNetworkMap() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-hairline bg-ink p-4">
      <svg
        viewBox="0 0 100 60"
        className="h-auto w-full"
        role="img"
        aria-label="FXPARTNER'ın Avrupa, MENA, Asya-Pasifik, Afrika ve Amerika kıtalarına yayılan partner ağının stilize diyagramı"
      >
        {networkArcs.map(([fromKey, toKey], i) => {
          const from = getRegion(fromKey);
          const to = getRegion(toKey);
          const cx = (from.x + to.x) / 2;
          const cy = Math.max(6, Math.min(from.y, to.y) - 14);
          const d = `M ${from.x} ${from.y * 0.6} Q ${cx} ${cy * 0.6} ${to.x} ${to.y * 0.6}`;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={0.35}
              strokeDasharray="1.6 1.4"
              className="network-arc"
              opacity={0.55}
            />
          );
        })}

        {trData(networkRegions).map((region) => (
          <g key={region.key} transform={`translate(${region.x} ${region.y * 0.6})`}>
            <circle
              r={3.2}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={0.3}
              className="network-node-pulse [transform-box:fill-box] [transform-origin:center]"
            />
            <circle r={0.9} fill="var(--gold)" />
            <text
              x={0}
              y={-4.5}
              textAnchor="middle"
              className="fill-text-on-ink-muted font-mono"
              style={{ fontSize: "2.6px", letterSpacing: "0.05em" }}
            >
              {region.label.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
