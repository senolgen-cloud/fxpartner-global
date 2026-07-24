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
];

export function getMarketAnalysisPostBySlug(slug: string): MarketAnalysisPost | undefined {
  return marketAnalysisPosts.find((p) => p.slug === slug);
}
