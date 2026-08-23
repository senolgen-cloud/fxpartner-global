"use client";

// Client helpers, not the server tr(): this component has no "use client"
// of its own, but it is only ever rendered from one, so it is compiled into
// the client bundle — where the per-request locale store does not exist and
// tr() would quietly return Turkish to every reader.
import { useTr } from "@/components/useTr";
import {
  LOT_LADDER,
  formatMoney,
  getContractSpec,
  moneyForMove,
} from "@/lib/contractSizes";

/**
 * "Bu hareket kaç lotta ne eder" merdiveni.
 *
 * Sinyal geçmişindeki tek anlamlı soruyu cevaplıyor: bir kullanıcı bu sinyali
 * kendi lot büyüklüğüyle uygulasaydı sonuç ne olurdu. Pips ya da 1-lota
 * indirgenmiş tek bir rakam bunu cevaplayamıyordu — pips enstrümanlar arasında
 * tutarsızdı, tek rakam ise okuyucunun kendi lotuna çevirmesini gerektiriyordu.
 *
 * Sözleşme değeri bilinmeyen enstrümanda hiçbir şey göstermiyoruz; yanlış bir
 * sayı göstermektense boş bırakmak daha iyi.
 */
export default function LotLadder({
  pair,
  priceMove,
  compact = false,
}: {
  pair: string;
  /** Yön hesaba katılmış fiyat hareketi (kâr pozitif). */
  priceMove: number | null;
  compact?: boolean;
}) {
  const tr = useTr();
  const spec = getContractSpec(pair);
  if (!spec || priceMove === null) return null;

  const rows = LOT_LADDER.map((lots) => ({
    lots: lots as number,
    money: moneyForMove(pair, priceMove, lots),
  })).filter((r): r is { lots: number; money: number } => r.money !== null);

  if (rows.length === 0) return null;

  const positive = priceMove > 0;
  const color = positive ? "text-tick-up" : "text-tick-down";

  return (
    // Container query, not a viewport one. This ladder sits inside a signal
    // card whose width has nothing to do with the window: at a 700px viewport
    // the card is 275px, and sm:grid-cols-4 was giving four 42px columns to
    // hold values 73px wide, so every figure printed over its neighbour.
    // 24rem is where four columns and their gaps actually fit.
    <div className={compact ? "@container" : "@container rounded-xl border border-hairline bg-ink/40 p-4"}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
          {tr("Lot başına sonuç")}
        </span>
        <span className="font-mono text-[10px] text-text-on-ink-muted">
          {priceMove > 0 ? "+" : "−"}
          {Math.abs(priceMove).toFixed(spec.priceDecimals)} birim hareket
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 @[24rem]:grid-cols-4">
        {rows.map(({ lots, money }) => (
          // flex-wrap, not truncation: in the narrowest card two columns are
          // 109px and the widest pair ("10.00 +$13.060,00") needs 125, so the
          // value drops to its own line only on the rows that need it.
          <div
            key={lots}
            className="flex flex-wrap items-baseline justify-between gap-x-2"
          >
            <span className="font-mono text-xs text-text-on-ink-muted">
              {lots.toFixed(2)}
            </span>
            <span className={`font-mono text-xs font-semibold ${color}`}>
              {formatMoney(money)}
            </span>
          </div>
        ))}
      </div>

      {/* Kotasyonu USD olmayan enstrümanlarda sözleşme değeri kurla
          oynuyor — sayıyı vermeyi bırakmak yerine yaklaşık olduğunu
          söylüyoruz, çünkü büyüklük mertebesi yine de doğru. */}
      {!spec.usdQuoted && (
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-text-on-ink-muted">
          {tr("Yaklaşık — bu enstrümanın kotasyonu USD değil, sözleşme değeri kura göre değişir.")}
        </p>
      )}
    </div>
  );
}
