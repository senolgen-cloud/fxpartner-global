export type Bias = "BULLISH" | "BEARISH";

export interface TechnicalLevel {
  price: string;
  // 0-2 asterisks in the source research — stronger levels get more weight
  // drawn in the card (thicker line / bolder text).
  strength: 0 | 1 | 2;
}

export interface TechnicalAnalysisPost {
  slug: string;
  // e.g. "Gold", "EUR/USD" — used as the card headline and site listing.
  instrument: string;
  timeframe: string; // e.g. "30 MIN"
  publishedAt: string; // ISO date
  pivot: string;
  lastPrice: string;
  bias: Bias;
  headline: string; // short TR headline, e.g. "Altın Gün içi: Hedef 4.337"
  // Both lists ordered farthest-from-pivot -> nearest-to-pivot (so they read
  // top-to-bottom as a ladder around the PIVOT row). Never include a level
  // equal to the pivot price itself — the pivot row already shows it.
  resistances: TechnicalLevel[];
  supports: TechnicalLevel[];
  preference: string; // "Our preference" paragraph, TR
  alternative: string; // "Alternative scenario" paragraph, TR
  comment: string; // RSI/MACD/MA commentary, TR
  source: string; // attribution shown in the small print, e.g. "Trading Central"
}

export const technicalAnalysisPosts: TechnicalAnalysisPost[] = [
  {
    slug: "altin-gun-ici-2026-08-13",
    instrument: "Gold",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "4433",
    lastPrice: "4376",
    bias: "BEARISH",
    headline: "Altın Gün İçi: Hedef 4.337",
    resistances: [
      { price: "4493", strength: 2 },
      { price: "4471", strength: 1 },
    ],
    supports: [
      { price: "4337", strength: 2 },
      { price: "4315", strength: 2 },
      { price: "4293", strength: 1 },
    ],
    preference:
      "4.433 direnç olduğu sürece düşüş devam eder; 4.337 ve 4.315 hedefleriyle satış senaryosu ön planda.",
    alternative: "4.433 seviyesinin üzerinde bir hareket, 4.471 ve 4.493 seviyelerini getirir.",
    comment:
      "RSI (bağıl güç endeksi) 50'nin altında. MACD (trend sapma göstergesi) sinyal çizgisinin altında ve negatif. Dahası, cari fiyat 20 ve 50 hareketli ortalamalarının altında (sırasıyla 4.398 ve 4.408 seviyelerinde).",
    source: "Trading Central",
  },
];

export function getTechnicalAnalysisPostBySlug(slug: string): TechnicalAnalysisPost | undefined {
  return technicalAnalysisPosts.find((p) => p.slug === slug);
}
