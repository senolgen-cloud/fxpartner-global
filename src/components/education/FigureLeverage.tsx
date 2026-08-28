import { tr } from "@/lib/chrome";

/**
 * The same position at three leverages.
 *
 * Leverage is usually explained as "it multiplies your gains and losses",
 * which is the one thing it does not do. What it changes is how much of the
 * balance the position locks up as margin; the money a pip is worth is set by
 * the position's size, and the position here is the same size in all three
 * rows. Holding one column constant while the other collapses is the fastest
 * way to show which of the two is which.
 *
 * The consequence — a smaller margin leaves more free equity, which is room
 * to open more risk with — is the lesson's job to make. The figure's job is
 * to establish which number actually moved.
 */

// 100.000 units of a position, divided by the leverage. 100.000/30 = 3.333,
// /100 = 1.000, /500 = 200. Written out rather than computed so the numbers
// in the figure are the numbers in the source.
const ROWS = [
  { leverage: "1 : 30", margin: "3.333", bar: 100 },
  { leverage: "1 : 100", margin: "1.000", bar: 30 },
  { leverage: "1 : 500", margin: "200", bar: 6 },
];

export default function FigureLeverage() {
  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 sm:gap-x-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
          {tr("Kaldıraç")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
          {tr("Bloke olan teminat")}
        </span>
        <span />

        {ROWS.map((row) => (
          <div key={row.leverage} className="contents">
            <span className="font-mono text-sm font-semibold tabular-nums text-text-dark">
              {row.leverage}
            </span>
            {/* min-w keeps the 1:500 bar visible: at 6% of the track it would
                otherwise round to a couple of pixels and read as "nothing",
                when the point is that it is small but real. */}
            <span className="block h-6 rounded-md bg-hairline-light/40">
              <span
                className="block h-full min-w-[0.5rem] rounded-md bg-gold/40"
                style={{ width: `${row.bar}%` }}
              />
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-text-dark">
              {row.margin}
            </span>
          </div>
        ))}
      </div>

      {/* The half of the picture that does not move. Set apart rather than
          added as another row, because it is a different kind of statement:
          the rows above are three cases, this is the constant across all
          three. */}
      <div className="mt-6 rounded-xl border border-signal/30 bg-signal/[0.06] px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-signal">
          {tr("Üç satırda da değişmeyen")}
        </span>
        <p className="mt-2 text-[14px] leading-relaxed text-text-dark/90">
          {tr("Pozisyon aynı büyüklükte, dolayısıyla 20 pip'lik bir hareketin karşılığı üç satırda da aynı tutardır. Kaldıraç bu tutarı değil, pozisyonun bloke ettiği teminatı değiştirir.")}
        </p>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
        {tr("100.000 birimlik bir pozisyon üzerinden, hesap para birimi cinsinden. Serbest kalan teminat daha fazla pozisyon açmaya imkan verir; riski büyüten kaldıracın kendisi değil, o imkanın kullanılmasıdır.")}
      </p>
    </div>
  );
}
