export interface MarketNewsItem {
  icon: string;
  heading: string;
  body: string;
}

export interface EconomicCalendarEvent {
  time: string;
  icon?: string;
  title: string;
  note?: string;
}

export interface MarketAnalysisPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  intro: string;
  news: MarketNewsItem[];
  calendarLabel: string;
  calendarEvents: EconomicCalendarEvent[];
  closing: string;
}

export const marketAnalysisPosts: MarketAnalysisPost[] = [
  {
    slug: "piyasa-ozeti-2026-07-24",
    title: "FXPARTNER Günlük Piyasa Özeti | 24.07.2026",
    excerpt:
      "ABD teknoloji hisselerinde sert geri çekilme, ECB'den faiz sinyali, Japon tahvillerinde yükseliş ve Volkswagen'in aşağı yönlü revizyonu — günün öne çıkan gelişmeleri ve İngiltere PMI verisi.",
    publishedAt: "2026-07-24",
    readingMinutes: 4,
    intro:
      "Küresel piyasalarda risk iştahı zayıflarken, yatırımcıların odağı teknoloji şirketleri, merkez bankaları ve makroekonomik verilere çevrilmiş durumda.",
    news: [
      {
        icon: "📉",
        heading: "ABD Teknoloji Hisselerinde Sert Geri Çekilme",
        body: "\"Magnificent Seven\" olarak bilinen teknoloji devleri, yapay zekâ yatırımlarına ilişkin artan maliyet endişeleri ve Orta Doğu'da yükselen jeopolitik risklerin etkisiyle yaklaşık **797 milyar dolar** piyasa değeri kaybetti. Endekste yaşanan **%4,8'lik düşüş**, küresel risk algısını olumsuz etkiledi.",
      },
      {
        icon: "🇪🇺",
        heading: "ECB'den Faiz Sinyali",
        body: "Avrupa Merkez Bankası yetkilileri, euro bölgesinde enflasyon görünümünün beklenen seviyeye ulaşmaması halinde **Eylül toplantısında 25 baz puanlık yeni bir faiz artışının** gündeme gelebileceğini belirtiyor. Bu açıklamalar, euro ve Avrupa tahvil piyasalarında yakından takip ediliyor.",
      },
      {
        icon: "🇯🇵",
        heading: "Japon Tahvillerinde Faiz Yükselişi",
        body: "Japonya'nın 40 yıllık devlet tahvili faizi **%4,01** seviyesine çıkarak son dönemin dikkat çeken hareketlerinden birini gerçekleştirdi. Piyasalar, Japonya Merkez Bankası'nın enflasyonla mücadelede daha agresif adımlar atıp atmayacağını fiyatlıyor.",
      },
      {
        icon: "🚗",
        heading: "Volkswagen Beklentilerini Aşağı Çekti",
        body: "Volkswagen, Çin pazarındaki talep zayıflığının devam etmesi nedeniyle **2026 gelir beklentisini aşağı yönlü revize etti.** Şirket, yıllık gelirlerinde **%3'e varan düşüş** yaşanabileceğini öngörüyor.",
      },
    ],
    calendarLabel: "24 Temmuz 2026",
    calendarEvents: [
      {
        time: "11:30 (GMT+3)",
        icon: "🇬🇧",
        title: "İngiltere Hizmet Sektörü PMI (Öncü Veri)",
        note: "Günün en önemli verilerinden biri olan PMI açıklaması, **GBP paritelerinde volatiliteyi artırabilir.** Özellikle GBP/USD ve EUR/GBP işlem yapan yatırımcıların veri saatinde risk yönetimine dikkat etmeleri önerilir.",
      },
    ],
    closing:
      "**FXPARTNER** ile küresel piyasaları takip edin, ekonomik gelişmeleri anlık analizlerle değerlendirin ve bilinçli işlem kararları alın.",
  },
  {
    slug: "piyasa-ozeti-2026-07-27",
    title: "FXPARTNER Günlük Forex Bülteni | 27.07.2026",
    excerpt:
      "EUR/USD, Gold, Silver, Brent ve WTI ham petrol ile US100 için günün fiyat hareketleri — enerjide sert düşüş, değerli metaller ve ABD teknoloji endeksinde yükseliş.",
    publishedAt: "2026-07-27",
    readingMinutes: 3,
    intro:
      "27 Temmuz 2026 sabahı (08:32 itibarıyla) MT5 platformundan alınan anlık verilere göre, enerji emtialarında sert satış baskısı görülürken, değerli metaller ve ABD teknoloji ağırlıklı endekste yükseliş öne çıkıyor.",
    news: [
      {
        icon: "🛢️",
        heading: "Ham Petrolde Sert Satış Baskısı",
        body: "BRENTCash **%5,85** değer kaybederek 92,67 seviyesine gerilerken, OILCash (WTI) **%6,15** düşüşle 85,48 seviyesinde işlem görüyor. Her iki kontrat da günün geniş bir bandını test etti (BRENTCash: 90,79–93,40; OILCash: 83,90–86,93) — enerji tarafında güçlü bir satış baskısına işaret ediyor.",
      },
      {
        icon: "🥇",
        heading: "Değerli Metallerde Alım İlgisi Sürüyor",
        body: "GOLD **%0,91** yükselişle 4.089,43–4.090,01 bandında, SILVER ise **%1,79** artışla 59,23–59,30 bandında işlem görüyor. Petroldeki zayıflığın aksine metallerde süregelen alım ilgisi dikkat çekiyor.",
      },
      {
        icon: "💶",
        heading: "EUR/USD Sınırlı Pozitif Seyirde",
        body: "EUR/USD paritesi **%0,32** artışla 1,1406–1,1408 bandında hareket ediyor; günün aralığı 1,1385–1,1413 ile dar kaldı — parite şu an belirgin bir yön arayışında görünmüyor.",
      },
      {
        icon: "📈",
        heading: "ABD Teknoloji Endeksinde Güçlü Alım",
        body: "US100Cash (Nasdaq 100), **%1,40** yükselişle günün en güçlü performans gösteren enstrümanlarından biri oldu; endeks yaklaşık 28.525 seviyesinde işlem görüyor.",
      },
    ],
    calendarLabel: "27 Temmuz 2026",
    // Bugün için doğrulanmış bir ekonomik takvim kaynağı paylaşılmadı —
    // uydurma veri koymamak için bu bölüm boş bırakıldı (bkz. sayfadaki
    // koşullu render). Kaynak sağlanırsa buraya gerçek maddeler eklenir.
    calendarEvents: [],
    closing:
      "Bu bülten, MT5 platformundan alınan anlık fiyat verilerine dayanmaktadır ve yatırım tavsiyesi niteliği taşımaz. Güncel spread ve fiyatları işlem yapmadan önce brokerinizin platformundan teyit edin.",
  },
];

export function getMarketAnalysisPostBySlug(slug: string): MarketAnalysisPost | undefined {
  return marketAnalysisPosts.find((p) => p.slug === slug);
}
