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
    slug: "piyasa-ozeti-2026-07-31",
    title: "FXPARTNER Günlük Piyasa Özeti | 31.07.2026",
    excerpt:
      "Fed faizi beşinci kez sabit tuttu, altın 4.000 doların üzerinde kaldı; ECB'de Eylül faiz artışı bekleniyor; Microsoft ve Meta bilançoları Nasdaq'ı ayrıştırdı; Brent petrol OPEC+ üretim artışına rağmen toparlandı.",
    publishedAt: "2026-07-31",
    readingMinutes: 5,
    intro:
      "Bu haftanın gündemine Fed'in faiz kararı, ECB'nin sonbahar için verdiği sinyaller, teknoloji devlerinin bilançoları ve OPEC+'ın üretim kararı damgasını vurdu. EUR/USD, XAU/USD, Nasdaq 100 ve Brent petrol üzerinden özetliyoruz.",
    news: [
      {
        icon: "💶",
        heading: "EUR/USD: ECB'de Eylül Faiz Artışı Beklentisi Güçleniyor",
        body: "Euro Bölgesi'nde güçlü seyreden GSYH ve PMI verileri, Avrupa Merkez Bankası'nın **Eylül toplantısında faiz artırabileceği** beklentisini pekiştiriyor. Buna karşın Fed'in yakın dönemde net bir yönlendirme vermemesi, doların güvenini zayıflatıyor ve iki banka arasındaki **faiz farkının** çift yönlü fiyatlanmasına yol açıyor. EUR/USD paritesi bu hafta **1,14 seviyesinin** çevresinde işlem gördü.",
      },
      {
        icon: "🥇",
        heading: "Altın: Fed Faizi Beşinci Kez Sabit Tuttu, XAU/USD 4.000 Doların Üzerinde",
        body: "FOMC, politika faizini **%3,50-3,75 aralığında sabit tutarak** üst üste beşinci toplantısında da bekle-gör tutumunu sürdürdü; kararda üç üyenin 25 baz puanlık artış yönünde muhalif oy kullanması dikkat çekti. Karar sonrası XAU/USD **4.000 doların üzerinde** kalmayı sürdürdü. 2026'nın ilk çeyreğinde merkez bankalarının net **244 ton altın alımı** yapması — özellikle Çin, Polonya, Kazakistan ve Özbekistan'ın alımları — fiyatı yapısal olarak destekleyen bir unsur olmaya devam ediyor.",
      },
      {
        icon: "💻",
        heading: "Nasdaq 100: Teknoloji Bilançoları Karışık Sinyal Verdi",
        body: "Temmuz ayı bilanço sezonunda Nasdaq'ta ayrışma yaşandı: **Microsoft**, Azure bulut gelirindeki **%43'lük büyüme** sayesinde beklentileri aşarak hisselerinde **%15 yükseliş** kaydetti. Buna karşın **Meta Platforms**, hisse başına kâr beklentisinin altında kalınca **%9'un üzerinde değer kaybetti**, **Qualcomm** ise karışık sonuçlarla **%7 geriledi**. Net etki olarak Nasdaq Composite günü **%2,8 yükselişle** tamamladı; çip ve bulut tarafındaki güçlü sonuçlar, zayıf sosyal medya bilançosunun etkisini dengeledi.",
      },
      {
        icon: "🛢️",
        heading: "Brent Petrol: OPEC+ Üretimi Artırdı, Fiyatlar Yine de Toparlandı",
        body: "OPEC+, **Ağustos ayından itibaren** üretimi günlük **188 bin varil** artırarak Nisan'dan bu yana üretim kısıtlamalarını gevşettiği **beşinci ardışık ayı** işaret etti. Arz artışına rağmen Orta Doğu'da süregelen jeopolitik gerilim fiyatlara destek verdi ve Brent, **varil başına 88 doların üzerine** çıktı. Büyük yatırım bankaları, arz fazlasının etkisiyle fiyatların yılın geri kalanında kademeli olarak gerileyebileceğini öngörüyor.",
      },
    ],
    calendarLabel: "Ağustos 2026'nın İlk Haftası",
    calendarEvents: [
      {
        time: "7 Ağustos Cuma",
        icon: "🇺🇸",
        title: "ABD Tarım Dışı İstihdam (NFP) Verisi",
        note: "Ayın ilk Cuma günü açıklanan NFP verisi, **Fed'in faiz patikası beklentilerini** ve dolayısıyla EUR/USD ile XAU/USD üzerindeki fiyatlamayı etkileyebilir.",
      },
      {
        time: "Eylül 2026",
        icon: "🇪🇺",
        title: "ECB Eylül Toplantısına Yönelik Açıklamalar",
        note: "ECB yetkilileri Eylül toplantısı öncesi vereceği sinyaller nedeniyle yakından izleniyor; olası bir faiz artışı sinyali euro paritelerinde volatiliteyi artırabilir.",
      },
    ],
    closing:
      "**FXPARTNER** ile küresel piyasaları takip edin, ekonomik gelişmeleri anlık analizlerle değerlendirin ve bilinçli işlem kararları alın.",
  },
];

export function getMarketAnalysisPostBySlug(slug: string): MarketAnalysisPost | undefined {
  return marketAnalysisPosts.find((p) => p.slug === slug);
}
