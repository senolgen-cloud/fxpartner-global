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
  // Not every source write-up includes an explicit current-price line
  // (e.g. WTI/Dow Jones/Apple below only give pivot + targets) — omit
  // rather than guessing one.
  lastPrice?: string;
  bias: Bias;
  headline: string; // short TR headline, e.g. "Altın Gün içi: Hedef 4.337"
  // Path under /public to the real Trading Central chart GIF for this
  // instrument, when the user supplied one — shown alongside the pivot
  // ladder instead of (or next to) the coded card. Omit when no chart was
  // provided for that instrument (e.g. Apple below).
  chartImage?: string;
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

// Title shown for a group of same-day posts on /teknik-analiz and in the
// bulletin share — keyed by publishedAt. Falls back to a generic title
// when a date has no explicit entry.
export const bulletinTitles: Record<string, string> = {
  "2026-08-13": "13.08.2026 - Gün Ortası Teknik Analiz Bülteni",
  "2026-08-18": "18.08.2026 - Gün İçi Teknik Analiz Bülteni",
  "2026-08-19": "19.08.2026 - Gün İçi Teknik Analiz Bülteni",
};

export function getBulletinTitle(publishedAt: string): string {
  return bulletinTitles[publishedAt] ?? `${publishedAt} - Teknik Analiz Bülteni`;
}

// The per-day bulletin route (/teknik-analiz/[date]) uses DD-MM-YYYY in the
// URL rather than the ISO format posts are keyed by internally, since
// that's the date format the site's own bulletins are announced with
// (e.g. Telegram posts, "18.08.2026 - ..." titles above).
export function isoToBulletinSlug(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export function bulletinSlugToIso(slug: string): string | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(slug);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
}

export const technicalAnalysisPosts: TechnicalAnalysisPost[] = [
  {
    slug: "eur-usd-gun-ici-2026-08-13",
    instrument: "EUR/USD",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "1,1546",
    lastPrice: "1,1524",
    bias: "BEARISH",
    headline: "EUR/USD Gün İçi: İzle 1,1497",
    chartImage: "/Grafik/1.gif",
    resistances: [
      { price: "1,1579", strength: 1 },
      { price: "1,1566", strength: 1 },
    ],
    supports: [
      { price: "1,1497", strength: 1 },
      { price: "1,1485", strength: 1 },
    ],
    preference: "1,1546 direnç olduğu sürece düşüş devam eder, 1,1497 ve 1,1485 hedefleriyle.",
    alternative: "1,1546 seviyesinin üzerinde bir hareket 1,1566 ve 1,1579 seviyelerini getirir.",
    comment:
      "RSI (bağıl güç endeksi) 50'nin altında. MACD (trend sapma göstergesi) sinyal çizgisinin üzerinde, fakat negatif. Dahası, cari fiyat 20 ve 50 hareketli ortalamalarının altında (sırasıyla 1,1524 ve 1,1531 seviyelerinde).",
    source: "Trading Central",
  },
  {
    slug: "ham-petrol-wti-gun-ici-2026-08-13",
    instrument: "Ham Petrol (WTI)",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "83,70",
    lastPrice: "81,82",
    bias: "BEARISH",
    headline: "Ham Petrol (WTI) Gün İçi: Düşüş Hakim",
    chartImage: "/Grafik/2.gif",
    resistances: [
      { price: "86,00", strength: 1 },
      { price: "84,65", strength: 1 },
    ],
    supports: [
      { price: "81,25", strength: 1 },
      { price: "79,90", strength: 1 },
    ],
    preference: "83,70 seviyesinin altında hedef 81,25 ve ilerleyen seviyelerde 79,90 olmak üzere satış pozisyonları.",
    alternative: "83,70 seviyesinin üzerinde hedef 84,65 ve 86,00 olmak üzere yükseliş görülebilir.",
    comment: "Direnç 83,70 seviyesinde oldukça ayı eğilimli dalgalı fiyat hareketleri görülebilir.",
    source: "Trading Central",
  },
  {
    slug: "altin-gun-ici-2026-08-13",
    instrument: "Gold",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "4433",
    lastPrice: "4376",
    bias: "BEARISH",
    headline: "Altın Gün İçi: Hedef 4.337",
    chartImage: "/Grafik/3.gif",
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
  {
    slug: "gbp-usd-gun-ici-2026-08-13",
    instrument: "GBP/USD",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "1,3512",
    lastPrice: "1,3479",
    bias: "BEARISH",
    headline: "GBP/USD Gün İçi: 1,3437 Göz Önünde",
    chartImage: "/Grafik/4.gif",
    resistances: [
      { price: "1,3564", strength: 1 },
      { price: "1,3545", strength: 1 },
    ],
    supports: [
      { price: "1,3437", strength: 1 },
      { price: "1,3417", strength: 1 },
    ],
    preference: "1,3512 direnç olduğu sürece düşüş devam eder, 1,3437 ve 1,3417 hedefleriyle.",
    alternative: "1,3512 seviyesinin üzerinde bir hareket 1,3545 ve 1,3564 seviyelerini getirir.",
    comment:
      "RSI (bağıl güç endeksi) 50'nin altında. MACD (trend sapma göstergesi) sinyal çizgisinin altında ve negatif. Dahası, cari fiyat 20 ve 50 hareketli ortalamalarının altında (sırasıyla 1,3490 ve 1,3501 seviyelerinde).",
    source: "Trading Central",
  },
  {
    slug: "usd-jpy-gun-ici-2026-08-13",
    instrument: "USD/JPY",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "159,57",
    lastPrice: "159,41",
    bias: "BEARISH",
    headline: "USD/JPY Gün İçi: Dönüm Noktası",
    chartImage: "/Grafik/5.gif",
    resistances: [
      { price: "160,04", strength: 1 },
      { price: "159,86", strength: 1 },
    ],
    supports: [
      { price: "158,27", strength: 1 },
      { price: "158,09", strength: 1 },
    ],
    preference: "159,57 direnç olduğu sürece düşüş devam eder, 158,27 ve 158,09 hedefleriyle.",
    alternative: "159,57 seviyesinin üzerinde bir hareket 159,86 ve 160,04 seviyelerini getirir.",
    comment: "Fiyat neredeyse pivot seviyemizi test ediyor; bu bir dönüş için son şans olabilir.",
    source: "Trading Central",
  },
  {
    slug: "usd-cad-gun-ici-2026-08-13",
    instrument: "USD/CAD",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "1,3904",
    bias: "BULLISH",
    headline: "USD/CAD Gün İçi: Geri Çekilme mi, Daha Fazla Yükseliş mi?",
    chartImage: "/Grafik/6.gif",
    resistances: [
      { price: "1,3972", strength: 1 },
      { price: "1,3959", strength: 1 },
    ],
    supports: [
      { price: "1,3883", strength: 1 },
      { price: "1,3871", strength: 1 },
    ],
    preference: "Bir sonraki hedefimiz 1,3972 olmalıdır.",
    alternative: "1,3904 seviyesinin altında bir hareket 1,3883 ve 1,3871 seviyelerini getirir.",
    comment:
      "Fiyatlar şimdi ilk hedefimize yaklaşırken, bu seviye bir geri çekilmeye neden olabilir. Bununla birlikte, bunun üzerinde kararlı bir kırılma ayrıca daha fazla yukarı yönlü hareket için bir katalizör görevi görebilir.",
    source: "Trading Central",
  },
  {
    slug: "aud-usd-gun-ici-2026-08-13",
    instrument: "AUD/USD",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "0,7067",
    lastPrice: "0,7048",
    bias: "BEARISH",
    headline: "AUD/USD Gün İçi: Ara 0,7026",
    chartImage: "/Grafik/7.gif",
    resistances: [
      { price: "0,7095", strength: 1 },
      { price: "0,7085", strength: 1 },
    ],
    supports: [
      { price: "0,7026", strength: 1 },
      { price: "0,7016", strength: 1 },
    ],
    preference: "0,7067 direnç olduğu sürece düşüş devam eder, 0,7026 ve 0,7016 hedefleriyle.",
    alternative: "0,7067 seviyesinin üzerinde bir hareket 0,7085 ve 0,7095 seviyelerini getirir.",
    comment:
      "RSI (bağıl güç endeksi) 50'nin altında. MACD (trend sapma göstergesi) sinyal çizgisinin üzerinde, fakat negatif. Dahası, cari fiyat 20 ve 50 hareketli ortalamalarının altında (sırasıyla 0,7053 ve 0,7062 seviyelerinde).",
    source: "Trading Central",
  },
  {
    slug: "dow-jones-cme-gun-ici-2026-08-13",
    instrument: "Dow Jones (CME)",
    timeframe: "30 DK",
    publishedAt: "2026-08-13",
    pivot: "53800",
    lastPrice: "53974",
    bias: "BULLISH",
    headline: "Dow Jones Gün İçi: Güniçi Destek 53800 Civarında",
    chartImage: "/Grafik/8.gif",
    resistances: [
      { price: "54300", strength: 1 },
      { price: "54080", strength: 1 },
    ],
    supports: [
      { price: "53650", strength: 1 },
      { price: "53490", strength: 1 },
    ],
    preference: "53800 seviyesinin üzerinde hedef 54080 ve ilerleyen seviyelerde 54300 olmak üzere alış pozisyonları.",
    alternative: "53800 seviyesinin altında hedef 53650 ve 53490 olmak üzere düşüş görülebilir.",
    comment: "53800 seviyesindeki destek, geçici bir istikrarın oluşmasını sağladı.",
    source: "Trading Central",
  },
  {
    slug: "apple-gun-ici-2026-08-13",
    instrument: "Apple",
    timeframe: "Gün İçi",
    publishedAt: "2026-08-13",
    pivot: "298,34",
    bias: "BULLISH",
    headline: "Apple Gün İçi: 308,32'ye Doğru Geri Tepme",
    resistances: [{ price: "308,32", strength: 1 }],
    supports: [
      { price: "294,95", strength: 1 },
      { price: "292,93", strength: 1 },
    ],
    preference: "308,32'ye doğru geri tepme.",
    alternative: "298,34 seviyesinin altında bir hareket 294,95 ve 292,93 seviyelerini getirir.",
    comment:
      "RSI (bağıl güç endeksi) 50'nin altında. MACD (trend sapma göstergesi) sinyal çizgisinin üzerinde, fakat negatif. Yapılandırma çeşitli. Dahası, cari fiyat 20 ve 50 hareketli ortalamalarının altında (sırasıyla 303,02 ve 306,58 seviyelerinde).",
    source: "Trading Central",
  },
  {
    slug: "altin-gun-ici-2026-08-18",
    instrument: "Gold",
    timeframe: "Gün İçi",
    publishedAt: "2026-08-18",
    pivot: "4.428",
    lastPrice: "4.393",
    bias: "BEARISH",
    headline: "Altın Gün İçi: Hedef 4.346",
    chartImage: "/Grafik/18082026-gold.png",
    resistances: [
      { price: "4.485", strength: 1 },
      { price: "4.464", strength: 1 },
    ],
    supports: [
      { price: "4.324", strength: 1 },
      { price: "4.346", strength: 1 },
    ],
    preference:
      "4.428 seviyesi direnç olarak korunduğu sürece aşağı yönlü hareketin devam etmesi bekleniyor. Bu durumda 4.346 ve ardından 4.324 seviyeleri hedeflenebilir.",
    alternative:
      "Altın 4.428 üzerinde kalıcılaşırsa, yükselişin 4.464 ve 4.485 seviyelerine doğru devam etmesi mümkün.",
    comment:
      "RSI 50 seviyesinin altında, MACD negatif bölgede ve sinyal çizgisinin altında. Fiyatın 20 ve 50 periyotluk hareketli ortalamaların altında bulunması da kısa vadede satıcılı görünümü destekliyor.",
    source: "Trading Central",
  },
  {
    slug: "silver-gun-ici-2026-08-18",
    instrument: "Silver",
    timeframe: "Gün İçi",
    publishedAt: "2026-08-18",
    pivot: "66,08",
    lastPrice: "65,02",
    bias: "BEARISH",
    headline: "Silver Gün İçi: Hedef 63,55",
    chartImage: "/Grafik/18082026-silver.png",
    resistances: [
      { price: "67,72", strength: 1 },
      { price: "67,11", strength: 1 },
    ],
    supports: [
      { price: "62,94", strength: 1 },
      { price: "63,55", strength: 1 },
    ],
    preference:
      "66,08 seviyesi direnç olarak kaldığı sürece aşağı yönlü hareketin devam etmesi bekleniyor. Bu senaryoda 63,55 ve ardından 62,94 seviyeleri hedeflenebilir.",
    alternative:
      "Silver 66,08 üzerinde kalıcılaşırsa, yükselişin 67,11 ve 67,72 seviyelerine doğru devam etmesi mümkün.",
    comment:
      "RSI 50'nin altında ve MACD negatif bölgede, sinyal çizgisinin altında bulunuyor. Ayrıca fiyatın 20 ve 50 periyotluk hareketli ortalamaların altında olması kısa vadeli satış baskısını destekliyor.",
    source: "Trading Central",
  },
  {
    slug: "wti-gun-ici-2026-08-18",
    instrument: "Ham Petrol (WTI)",
    timeframe: "Gün İçi",
    publishedAt: "2026-08-18",
    pivot: "82,90",
    lastPrice: "84,24",
    bias: "BULLISH",
    headline: "Ham Petrol (WTI) Gün İçi: Hedef 85,85",
    chartImage: "/Grafik/18082026-Oil-Wti.png",
    resistances: [
      { price: "88,05", strength: 1 },
      { price: "87,00", strength: 1 },
      { price: "85,85", strength: 1 },
    ],
    supports: [
      { price: "81,30", strength: 1 },
      { price: "82,25", strength: 1 },
    ],
    preference:
      "82,90 seviyesi üzerinde kaldığı sürece yukarı yönlü görünüm korunuyor. Bu durumda ilk hedef 85,85, ardından 87,00 seviyesi öne çıkıyor.",
    alternative:
      "82,90 seviyesinin altında kalınması halinde satış baskısı artabilir. Bu durumda 82,25 ve 81,30 seviyeleri destek olarak takip edilebilir.",
    comment:
      "82,90 seviyesindeki direncin yukarı kırılması, yükseliş hareketini hızlandırarak fiyatı 85,85 bölgesine taşıdı. Mevcut yapı, 82,90 üzerinde kaldığı sürece pozitif görünümü destekliyor.",
    source: "Trading Central",
  },
  {
    slug: "altin-gun-ici-2026-08-19",
    instrument: "Gold",
    timeframe: "30 Dakika",
    publishedAt: "2026-08-19",
    pivot: "4.386",
    lastPrice: "4.349",
    bias: "BEARISH",
    headline: "Altın Gün İçi: Hedef 4.297",
    chartImage: "/Grafik/19082026-gold.png",
    resistances: [
      { price: "4.442", strength: 1 },
      { price: "4.421", strength: 1 },
    ],
    supports: [
      { price: "4.297", strength: 1 },
      { price: "4.276", strength: 1 },
    ],
    preference:
      "4.386 pivot direnci korundukça aşağı yönlü baskının sürmesini bekliyoruz; ilk etapta 4.297, kırılırsa 4.276 hedefte.",
    alternative:
      "4.386 üzerinde günlük kapanış, baskıyı geçersiz kılar ve fiyatı 4.421-4.442 direnç bandına taşıyabilir.",
    comment:
      "Teknik olarak RSI 45,21 ile nötr-zayıf bölgede, MACD -3,73 ile sinyal çizgisinin altında negatif seyrediyor; fiyat 20 ve 50 periyotluk ortalamaların altında kalarak kısa vadeli satıcılı yapıyı doğruluyor. Temelde ise tablo karışık: ABD 10 yıllık tahvil getirisinin %4,71 civarında güçlü kalması ve dolar endeksindeki dirençli seyir haftalardır ons altın üzerinde baskı unsuru, ancak Asya borsalarındaki çip sektörü kaynaklı satış dalgasının tetiklediği risk iştahı kaybı, güvenli liman talebiyle olası bir aşağı yönlü sert hareketi sınırlayabilir. Bir trader gözüyle, 4.386 üzerine kalıcı bir günlük kapanış görülmeden düşüş senaryosunu ana senaryo olarak korumak mantıklı.",
    source: "Trading Central",
  },
  {
    slug: "usd-jpy-gun-ici-2026-08-19",
    instrument: "USD/JPY",
    timeframe: "30 Dakika",
    publishedAt: "2026-08-19",
    pivot: "159,82",
    lastPrice: "159,33",
    bias: "BEARISH",
    headline: "USD/JPY Gün İçi: Hedef 159,05",
    chartImage: "/Grafik/19082026-usdjpy.png",
    resistances: [
      { price: "160,35", strength: 1 },
      { price: "160,15", strength: 1 },
    ],
    supports: [
      { price: "159,05", strength: 1 },
      { price: "158,85", strength: 1 },
    ],
    preference:
      "159,82 seviyesi direnç olarak kaldığı sürece aşağı yönlü hareketin devam etmesini bekliyoruz; 159,05 ve ardından 158,85 hedefte.",
    alternative:
      "159,82 üzerinde kalıcılaşma, toparlanmayı 160,15-160,35 bandına taşıyabilir.",
    comment:
      "RSI 31,39 ile aşırı satım bölgesine yaklaşıyor, MACD -0,07 ile hafif negatif; fiyat kısa vadeli ortalamaların altına sarkarak momentumun zayıfladığına işaret ediyor. Temel tarafta ise pariteyi asıl belirleyen unsur, 160,00 seviyesinin test edilmesi durumunda gündeme gelebilecek resmi Japon kur müdahalesi ihtimali — bu, yükselişleri doğal olarak sınırlayan psikolojik bir tavan oluşturuyor. Buna karşın ABD tahvil getirilerinin %4,71 civarında yüksek kalması dolar lehine bir zemin sağlıyor; bu iki gücün çekişmesi pariteyi 159,82 pivotu etrafında dar bir bantta tutabilir. Müdahale riski nedeniyle 160,00 üzerinde agresif long pozisyonlardan kaçınmak, deneyimli bir trader için temkinli yaklaşım olur.",
    source: "Trading Central",
  },
  {
    slug: "gbp-usd-gun-ici-2026-08-19",
    instrument: "GBP/USD",
    timeframe: "30 Dakika",
    publishedAt: "2026-08-19",
    pivot: "1,3565",
    lastPrice: "1,3542",
    bias: "BEARISH",
    headline: "GBP/USD Gün İçi: Hedef 1,3497",
    chartImage: "/Grafik/19082026-gbpusd.png",
    resistances: [
      { price: "1,3617", strength: 1 },
      { price: "1,3597", strength: 1 },
    ],
    supports: [
      { price: "1,3497", strength: 1 },
      { price: "1,3478", strength: 1 },
    ],
    preference:
      "1,3565 seviyesi direnç olarak kaldığı sürece aşağı yönlü hareketin devam etmesini bekliyoruz; 1,3497 ve ardından 1,3478 hedefte.",
    alternative:
      "1,3565 üzerinde günlük kapanış, toparlanmayı 1,3597-1,3617 bandına taşıyabilir.",
    comment:
      "RSI 57,87 ile nötr bölgede fakat MACD 0,00 ile sinyal çizgisine yapışık, yani momentum kararsız — teknik olarak net bir yön henüz teyit edilmiş değil. Temel cephede kablo, kendi başına zayıf bir haber akışından değil, genel dolar gücünden baskı görüyor: yüksek ABD tahvil getirileri ve risk iştahının teknoloji sektöründeki satışlarla zayıflaması, USD çaprazlarının genelinde dolara destek veriyor. Gün içinde açıklanacak Avrupa PMI verileri ve merkez bankası açıklamaları, paritenin 1,3565 pivotu etrafındaki kararsızlığı kırabilecek asıl katalizör; veri öncesi temkinli, pivotun altında kalındığı sürece aşağı yönlü senaryoyu öncelemek daha tutarlı.",
    source: "Trading Central",
  },
  {
    slug: "wti-gun-ici-2026-08-19",
    instrument: "Ham Petrol (WTI)",
    timeframe: "30 Dakika",
    publishedAt: "2026-08-19",
    pivot: "83,30",
    lastPrice: "84,67",
    bias: "BULLISH",
    headline: "Ham Petrol (WTI) Gün İçi: Hedef 85,85",
    chartImage: "/Grafik/19082026-wti.png",
    resistances: [
      { price: "87,00", strength: 1 },
      { price: "85,85", strength: 1 },
    ],
    supports: [
      { price: "82,25", strength: 1 },
      { price: "81,30", strength: 1 },
    ],
    preference:
      "83,30 pivot desteği korundukça yukarı yönlü görünümün devam etmesini bekliyoruz; ilk hedef 85,85, ardından 87,00.",
    alternative:
      "83,30 altına sarkma, toparlanmayı geçersiz kılar ve fiyatı 82,25-81,30 destek bandına çekebilir.",
    comment:
      "RSI 59,21 ile yükseliş yönünü destekleyen bölgede, MACD 0,42 ile pozitif ve sinyal çizgisinin üzerinde — teknik yapı alım tarafını destekliyor. Temelde ise fiyatı esas taşıyan unsur arz tarafı: Ortadoğu'daki jeopolitik gerginlik ve Umman Boğazı üzerinden geçen ticaret rotalarındaki tıkanıklık, Brent'i 91 doların üzerine taşırken WTI'ı da aynı risk primiyle yukarı çekiyor. Bir trader için kritik nokta, bu yükselişin makro büyüme endişesinden değil jeopolitik arz riskinden beslenmesi — yani gerginlik dinmeden 83,30 pivotunun altına sarkma ihtimali düşük görünüyor, ancak olası bir de-eskalasyon haberi hızlı bir geri çekilmeyi tetikleyebilir.",
    source: "Trading Central",
  },
];

export function getTechnicalAnalysisPostBySlug(slug: string): TechnicalAnalysisPost | undefined {
  return technicalAnalysisPosts.find((p) => p.slug === slug);
}
