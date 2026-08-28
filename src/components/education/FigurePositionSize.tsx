import { tr } from "@/lib/chrome";

/**
 * The position-size formula, drawn as a fraction rather than written as a
 * sentence.
 *
 * Written out — "risk tutarını, stop mesafesi ile pip değerinin çarpımına
 * bölün" — it reads as three instructions and has to be held in the head in
 * order. Drawn, it is one shape: what you are prepared to lose, over what
 * one unit of distance costs you. The worked example underneath exists
 * because the formula alone never convinces anyone that %1 of ten thousand
 * is half a lot.
 */

// A worked example, not a recommendation. Every figure here is arithmetic:
// 10.000 × %1 = 100, and 100 / (20 × 10) = 0,50. The pip value is the one
// input that is not universal, which is what the note underneath says.
const EXAMPLE = [
  { value: "10.000", label: "Bakiye" },
  { value: "%1 → 100", label: "İşlem başına risk" },
  { value: "20 pip", label: "Stop mesafesi" },
  { value: "0,50 lot", label: "Sonuç" },
];

export default function FigurePositionSize() {
  return (
    <div>
      {/* The fraction. Laid out as a column (numerator, rule, denominator)
          beside an equals sign and the result, so it wraps to two lines on a
          narrow phone instead of shrinking the type. */}
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <div className="min-w-0">
          <div className="rounded-lg border border-hairline-light px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-dark sm:text-xs">
            {tr("Risk tutarı")}
          </div>
          <div className="my-2 h-px bg-hairline-light" aria-hidden="true" />
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-lg border border-hairline-light px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-dark sm:text-xs">
              {tr("Stop mesafesi")}
            </div>
            <span aria-hidden="true" className="font-mono text-sm text-text-muted">
              ×
            </span>
            <div className="rounded-lg border border-hairline-light px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-text-dark sm:text-xs">
              {tr("Pip değeri")}
            </div>
          </div>
        </div>

        {/* Stacked on a phone, so the equals sign has to point down the
            column rather than across it. */}
        <span aria-hidden="true" className="font-mono text-2xl leading-none text-text-muted">
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">=</span>
        </span>

        <div className="rounded-lg border border-signal/40 bg-signal/10 px-6 py-3 font-mono text-lg font-semibold uppercase tracking-[0.12em] text-signal">
          {tr("Lot")}
        </div>
      </div>

      {/* The same formula with numbers in it. gap-px over a hairline
          background draws the dividing rules, so there is one border colour
          in the figure rather than a grid of nested ones. */}
      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline-light bg-hairline-light sm:grid-cols-4">
        {EXAMPLE.map((cell) => (
          <div key={cell.label} className="bg-paper-high px-4 py-3.5">
            <dd className="font-mono text-base font-semibold text-text-dark sm:text-lg">
              {cell.value}
            </dd>
            <dt className="mt-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-text-muted">
              {tr(cell.label)}
            </dt>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
        {tr("Örnekte pip değeri lot başına 10 birim alınmıştır. Bu değer enstrümana ve hesabınızın para birimine göre değişir; kendi hesabınız için platformun sembol özellikleri penceresinden okunur.")}
      </p>
    </div>
  );
}
