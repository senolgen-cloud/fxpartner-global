import { tr } from "@/lib/chrome";

/**
 * The four pending order types, placed where they actually sit.
 *
 * Every one of them is defined relative to the current price, and the pair
 * that gets confused is buy stop with buy limit — same direction, opposite
 * sides of the line. A list of four definitions cannot show that; a line
 * with two names above it and two below it is the definition.
 *
 * The order names stay in English on purpose. They are what the platform
 * prints in its own order window, and a reader comparing this figure to that
 * window needs the same words in both places.
 */

const ABOVE = [
  { name: "Buy stop", note: "Yukarı kırılımda alış" },
  { name: "Sell limit", note: "Yukarıda satış" },
];

const BELOW = [
  { name: "Buy limit", note: "Aşağıda alış" },
  { name: "Sell stop", note: "Aşağı kırılımda satış" },
];

export default function FigurePendingOrders() {
  return (
    <div>
      <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
        {tr("Fiyat yukarı giderse tetiklenir")}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ABOVE.map((o) => (
          <div key={o.name} className="rounded-lg border border-hairline-light bg-paper-high px-4 py-3">
            <span className="font-mono text-[13px] font-semibold text-text-dark">{o.name}</span>
            <span className="mt-1 block text-[12px] leading-relaxed text-text-muted">
              {tr(o.note)}
            </span>
          </div>
        ))}
      </div>

      {/* The line the whole figure is about. Given the accent colour and a
          label on it rather than beside it, so nothing else in the figure
          competes for being the reference. */}
      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-signal/50" aria-hidden="true" />
        <span className="whitespace-nowrap rounded-full border border-signal/40 bg-signal/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-signal">
          {tr("Güncel fiyat")}
        </span>
        <span className="h-px flex-1 bg-signal/50" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BELOW.map((o) => (
          <div key={o.name} className="rounded-lg border border-hairline-light bg-paper-high px-4 py-3">
            <span className="font-mono text-[13px] font-semibold text-text-dark">{o.name}</span>
            <span className="mt-1 block text-[12px] leading-relaxed text-text-muted">
              {tr(o.note)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
        {tr("Fiyat aşağı giderse tetiklenir")}
      </p>
    </div>
  );
}
