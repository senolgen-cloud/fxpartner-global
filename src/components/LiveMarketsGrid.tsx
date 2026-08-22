import Link from "@/components/LocaleLink";
import { tr } from "@/lib/chrome";
import { getTickerPairs, type TickerPair } from "@/lib/rates";

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";

// Human labels + a short "what is this" subtitle for the subset of
// getTickerPairs() symbols we show here — same real, free-API-sourced data
// as the site ticker (src/lib/rates.ts), just presented as cards instead of
// a scrolling strip.
const CARD_META: Record<string, { label: string; sub: string }> = {
  "XAU/USD": { label: "Altın", sub: "Spot Altın / ABD Doları" },
  "BTC/USD": { label: "Bitcoin", sub: "Bitcoin / ABD Doları" },
  "EUR/USD": { label: "Euro", sub: "Euro / ABD Doları" },
  "GBP/USD": { label: "Sterlin", sub: "İngiliz Sterlini / ABD Doları" },
  "USD/JPY": { label: "Japon Yeni", sub: "ABD Doları / Japon Yeni" },
  "USD/TRY": { label: "Türk Lirası", sub: "ABD Doları / Türk Lirası" },
};

const CARD_ORDER = ["XAU/USD", "BTC/USD", "EUR/USD", "GBP/USD", "USD/JPY", "USD/TRY"];

// Deterministic per-symbol squiggle, same "decorative, not real intraday
// data" convention already used for the signal cards' sparkline (we don't
// have a real intraday price series for most of these instruments on the
// free APIs backing rates.ts) — a visual accent matching direction only.
function decorativePath(symbol: string, up: boolean): string {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed = (seed * 31 + symbol.charCodeAt(i)) >>> 0;
  const points = 10;
  const vals: number[] = [];
  let v = up ? 30 : 10;
  for (let i = 0; i < points; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const jitter = ((seed % 100) / 100 - 0.5) * 10;
    v += (up ? 1 : -1) * 1.6 + jitter;
    v = Math.max(4, Math.min(36, v));
    vals.push(v);
  }
  const step = 200 / (points - 1);
  return vals.map((val, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)} ${(40 - val).toFixed(1)}`).join(" ");
}

function MarketCard({ pair }: { pair: TickerPair }) {
  const meta = CARD_META[pair.symbol] ?? { label: pair.symbol, sub: pair.symbol };
  const up = pair.up ?? true;
  const color = pair.up === null ? "var(--text-on-ink-muted)" : up ? TICK_UP : TICK_DOWN;

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-gradient-to-b from-ink-soft to-ink p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="notranslate font-display text-lg font-semibold text-text-on-ink">
            {pair.symbol.replace("/", "")}
          </span>
          <span className="ml-2 text-xs text-text-on-ink-muted">{meta.label}</span>
        </div>
        {pair.delta && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: `${color}26`, color }}
          >
            {pair.up ? "▲" : "▼"} {pair.delta}
          </span>
        )}
      </div>

      <p className="mt-2 font-display text-2xl font-bold tabular-stat text-text-on-ink">
        {pair.value}
      </p>

      <svg viewBox="0 0 200 40" className="mt-3 h-9 w-full" style={{ color }} fill="none">
        <path
          d={decorativePath(pair.symbol, up)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
        <span className="font-mono text-[11px] text-text-on-ink-muted">{meta.sub}</span>
        <Link
          href="/teknik-analiz"
          className="font-mono text-[11px] uppercase tracking-[0.1em] text-signal hover:text-signal-strong"
        >
          {tr("Analizi Gör →")}
        </Link>
      </div>
    </div>
  );
}

// Real-time market snapshot sitting alongside the trade signals list — ties
// "what the market's doing right now" to "what we're trading right now".
// Data is the same free-API feed already powering the site ticker
// (src/lib/rates.ts), just re-shown as cards; nothing here is fabricated.
export default async function LiveMarketsGrid() {
  const pairs = await getTickerPairs();
  const cards = CARD_ORDER.map((sym) => pairs.find((p) => p.symbol === sym)).filter(
    (p): p is TickerPair => Boolean(p)
  );

  if (cards.length === 0) return null;

  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            {tr("Canlı Piyasalar")}
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            {tr("Sinyallerimizle aynı anda piyasada olanlar")}
          </h2>
          <p className="mt-3 max-w-xl text-text-on-ink-muted">
            {tr("Aşağıdaki sinyaller açılırken piyasanın genel görünümü — anlık fiyat ve günlük değişim.")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((pair) => (
            <MarketCard key={pair.symbol} pair={pair} />
          ))}
        </div>
      </div>
    </section>
  );
}
