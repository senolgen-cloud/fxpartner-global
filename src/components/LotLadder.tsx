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
    <div className={compact ? "" : "rounded-xl border border-hairline bg-ink/40 p-4"}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-on-ink-muted">
          Lot başına sonuç
        </span>
        <span className="font-mono text-[10px] text-text-on-ink-muted">
          {priceMove > 0 ? "+" : "−"}
          {Math.abs(priceMove).toFixed(spec.priceDecimals)} birim hareket
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4">
        {rows.map(({ lots, money }) => (
          <div key={lots} className="flex items-baseline justify-between gap-2">
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
          Yaklaşık — bu enstrümanın kotasyonu USD değil, sözleşme değeri kura
          göre değişir.
        </p>
      )}
    </div>
  );
}
