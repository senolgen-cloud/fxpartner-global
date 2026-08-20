// Enstrüman başına sözleşme değeri: 1.00 lotluk pozisyonda, fiyatın 1 birim
// hareketi kaç dolar eder.
//
// ⚠️ BU DEĞERLER TAHMİN DEĞİL — hesabın kendi kapanmış işlemlerinden türetildi:
//
//     sözleşmeDeğeri = profit / (fiyat hareketi × lot)
//
// 124 kapanmış işlem üzerinde hesaplandı ve aşağıdaki enstrümanlarda tüm
// işlemler medyanın %2'si içinde çıktı, yani değer güvenilir. Broker
// koşulları değişirse aynı hesap yeniden yapılıp buradaki sayı güncellenmeli.
//
// Neden gerekiyor: sinyal geçmişinde "şu kadar lotla ne kadar eder"
// gösterebilmek için. Daha önce burada önce EA'nın "pips" alanı, sonra ham
// fiyat farkı, sonra da 1-lota indirgenmiş P/L vardı; üçü de farklı şekilde
// yanlıştı. Sözleşme değeri bilinince doğru cevap doğrudan hesaplanabiliyor.

export type ContractSpec = {
  /** 1.00 lotta, fiyatın 1 birim hareketinin dolar karşılığı. */
  valuePerUnit: number;
  /**
   * Kotasyon para birimi USD mi?
   *
   * USD değilse sözleşme değeri kurla birlikte oynar — türetilen sayı o
   * işlemlerin yapıldığı andaki kuru yansıtır, bugünkünü değil. Bu yüzden
   * bu enstrümanlarda merdiven "yaklaşık" olarak işaretlenir.
   */
  usdQuoted: boolean;
  /** Fiyatın kaç ondalıkla gösterileceği. */
  priceDecimals: number;
};

export const CONTRACT_SPECS: Record<string, ContractSpec> = {
  // — Metaller —
  // 45 işlemde tutarlı: 1 lot, $1 hareket = $100
  GOLD: { valuePerUnit: 100, usdQuoted: true, priceDecimals: 2 },
  "GOLD24-7": { valuePerUnit: 100, usdQuoted: true, priceDecimals: 2 },
  XAUUSD: { valuePerUnit: 100, usdQuoted: true, priceDecimals: 2 },
  SILVER: { valuePerUnit: 5000, usdQuoted: true, priceDecimals: 3 },
  XAGUSD: { valuePerUnit: 5000, usdQuoted: true, priceDecimals: 3 },

  // — Endeksler —
  // US100CASH: 27 işlemde tutarlı olarak 1.0 çıktı — yani 10 lotta 1 puan = $10.
  US100CASH: { valuePerUnit: 1, usdQuoted: true, priceDecimals: 2 },
  US30CASH: { valuePerUnit: 1, usdQuoted: true, priceDecimals: 2 },
  US500CASH: { valuePerUnit: 1, usdQuoted: true, priceDecimals: 2 },

  // — Enerji —
  OILCASH: { valuePerUnit: 100, usdQuoted: true, priceDecimals: 2 },
  BRENTCASH: { valuePerUnit: 100, usdQuoted: true, priceDecimals: 2 },

  // — Kripto —
  BTCUSD: { valuePerUnit: 1, usdQuoted: true, priceDecimals: 2 },
  ETHUSD: { valuePerUnit: 1, usdQuoted: true, priceDecimals: 2 },

  // — Forex, USD kotasyonlu (standart 100k sözleşme) —
  EURUSD: { valuePerUnit: 100000, usdQuoted: true, priceDecimals: 5 },
  GBPUSD: { valuePerUnit: 100000, usdQuoted: true, priceDecimals: 5 },
  AUDUSD: { valuePerUnit: 100000, usdQuoted: true, priceDecimals: 5 },
  NZDUSD: { valuePerUnit: 100000, usdQuoted: true, priceDecimals: 5 },

  // — Forex/endeks, USD kotasyonlu DEĞİL —
  // Bunlarda türetilen değer işlem anındaki kura bağlı; veride de zaten
  // dağılım gösteriyorlar (USDJPY 260-633, USDCHF 123k-127k). Medyan
  // alındı ama "yaklaşık" işaretli.
  USDJPY: { valuePerUnit: 629, usdQuoted: false, priceDecimals: 3 },
  USDCHF: { valuePerUnit: 125662, usdQuoted: false, priceDecimals: 5 },
  GER40CASH: { valuePerUnit: 1.118, usdQuoted: false, priceDecimals: 2 },
};

export function getContractSpec(pair: string): ContractSpec | null {
  return CONTRACT_SPECS[pair.toUpperCase()] ?? null;
}

/**
 * Bir fiyat hareketinin, verilen lot miktarında kaç dolar ettiği.
 * Spec bilinmiyorsa null döner — uydurmak yerine göstermemeyi tercih ediyoruz.
 */
export function moneyForMove(pair: string, priceMove: number, lots: number): number | null {
  const spec = getContractSpec(pair);
  if (!spec) return null;
  return priceMove * spec.valuePerUnit * lots;
}

/**
 * İşlemin yönünü hesaba katarak giriş->çıkış fiyat hareketi.
 * SELL'de fiyatın düşmesi kâr olduğu için işaret ters çevrilir.
 */
export function favorableMove(
  entry: string | number | null,
  exit: string | number | null,
  direction: string | null
): number | null {
  if (entry == null || exit == null) return null;
  const e = typeof entry === "string" ? parseFloat(entry) : entry;
  const x = typeof exit === "string" ? parseFloat(exit) : exit;
  if (Number.isNaN(e) || Number.isNaN(x)) return null;
  const diff = x - e;
  return direction === "SELL" ? -diff : diff;
}

/** Merdivende gösterilecek standart lot basamakları. */
export const LOT_LADDER = [0.01, 0.1, 1, 10] as const;

/** $1.234,56 biçimi; sıfıra çok yakın değerlerde daha fazla ondalık. */
export function formatMoney(value: number): string {
  const abs = Math.abs(value);
  const decimals = abs > 0 && abs < 1 ? 2 : 2;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}$${abs.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
