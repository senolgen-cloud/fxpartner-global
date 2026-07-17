const pairs = [
  { symbol: "EUR/USD", value: "1.0842", delta: "+0.12%", up: true },
  { symbol: "GBP/USD", value: "1.2673", delta: "-0.08%", up: false },
  { symbol: "USD/JPY", value: "151.34", delta: "+0.24%", up: true },
  { symbol: "USD/TRY", value: "34.187", delta: "+0.41%", up: true },
  { symbol: "XAU/USD", value: "2318.6", delta: "-0.19%", up: false },
  { symbol: "USD/CHF", value: "0.9042", delta: "+0.05%", up: true },
  { symbol: "AUD/USD", value: "0.6521", delta: "-0.11%", up: false },
  { symbol: "BTC/USD", value: "67,240", delta: "+1.32%", up: true },
];

function TickerRow() {
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
          <span
            className={`tabular-stat font-mono text-xs ${
              p.up ? "text-tick-up" : "text-tick-down"
            }`}
          >
            {p.up ? "▲" : "▼"} {p.delta}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Ticker() {
  return (
    <div className="overflow-hidden border-y border-hairline bg-ink-soft py-2.5">
      <div className="ticker-track flex w-max">
        <TickerRow />
        <div aria-hidden="true" className="flex shrink-0">
          <TickerRow />
        </div>
      </div>
    </div>
  );
}
