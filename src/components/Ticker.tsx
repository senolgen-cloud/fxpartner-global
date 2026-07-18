import { getTickerPairs, type TickerPair } from "@/lib/rates";

function TickerRow({ pairs }: { pairs: TickerPair[] }) {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {pairs.map((p) => (
        <div key={p.symbol} className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-xs tracking-wide text-text-on-ink-muted">
            {p.symbol}
          </span>
          <span className="tabular-stat font-mono text-xs text-text-on-ink">
            {p.value}
          </span>
          {p.delta && (
            <span
              className={`tabular-stat font-mono text-xs ${
                p.up ? "text-tick-up" : "text-tick-down"
              }`}
            >
              {p.up ? "▲" : "▼"} {p.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function Ticker() {
  const pairs = await getTickerPairs();
  if (pairs.length === 0) return null;

  return (
    <div className="overflow-hidden border-y border-hairline bg-ink-soft py-2.5">
      <div className="ticker-track flex w-max">
        <TickerRow pairs={pairs} />
        <div aria-hidden="true" className="flex shrink-0">
          <TickerRow pairs={pairs} />
        </div>
      </div>
    </div>
  );
}
