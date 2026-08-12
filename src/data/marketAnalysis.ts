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
  // Defaults to the daily-summary template cover when omitted (see
  // getMarketAnalysisCoverImage below) — every post always has a preview
  // image without each new entry needing to generate/set its own.
  coverImage?: string;
  intro: string;
  news: MarketNewsItem[];
  calendarLabel: string;
  calendarEvents: EconomicCalendarEvent[];
  closing: string;
}

const DAILY_COVER = "/piyasa-analizi/gunluk-ozet-cover.png";
const WEEKLY_COVER = "/piyasa-analizi/haftalik-gorunum-cover.png";

// Weekly posts (slug prefixed "haftalik-") get the weekly template cover;
// everything else (daily summaries) gets the daily one — a per-post
// coverImage always overrides this.
export function getMarketAnalysisCoverImage(post: MarketAnalysisPost): string {
  if (post.coverImage) return post.coverImage;
  return post.slug.startsWith("haftalik-") ? WEEKLY_COVER : DAILY_COVER;
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
  {
    slug: "haftalik-gorunum-2026-08-03",
    title: "FXPARTNER Haftalık Piyasa Görünümü | 3-9 Ağustos 2026",
    excerpt:
      "Haftanın gündeminde Cuma günü açıklanacak ABD tarım dışı istihdam (NFP) verisi var; EUR/USD kritik 1,15 desteğini test ederken, altın sıkışan üçgen formasyonunda kırılım bekliyor, USD/TRY ise TCMB'nin güçlü rezerv pozisyonuyla kontrollü seyrini sürdürüyor.",
    publishedAt: "2026-08-02",
    readingMinutes: 5,
    intro:
      "3-9 Ağustos haftasında piyasaların odağı, Cuma günü açıklanacak ABD tarım dışı istihdam (NFP) raporunda. Haftanın geri kalanında Çin ve ABD PMI verileri, Yeni Zelanda istihdam verisi ve Euro Bölgesi perakende satışları da takip edilecek. EUR/USD, XAU/USD ve USD/TRY üzerinden haftanın öne çıkan başlıklarını derledik.",
    news: [
      {
        icon: "💶",
        heading: "EUR/USD: NFP Öncesi 1,15 Desteği Kritik",
        body: "EUR/USD, hafta başında **1,1500 psikolojik seviyesinin** çevresinde işlem görüyor; bu seviyenin altında **1,1400** ve **1,1370-1,1420 bölgesi** bir sonraki destek noktaları olarak izleniyor. Yukarı yönde ise **100 günlük ortalamanın bulunduğu 1,1568** ilk direnç, **200 günlük ortalamanın geçtiği 1,1631** ise bir sonraki hedef konumunda. Piyasa beklentisi, Cuma günkü NFP verisinde **91 bin yeni istihdam** ve **%4,3 işsizlik oranı** yönünde; beklentinin altında kalacak bir veri doların değer kaybetmesine ve paritenin direnç bölgesine yönelmesine yol açabilir.",
      },
      {
        icon: "🥇",
        heading: "Altın (XAU/USD): Sıkışan Üçgen Kırılım Bekliyor",
        body: "XAU/USD, son altı haftadır **4.020-4.070 dolar bandında** simetrik bir üçgen formasyonu içinde sıkışmış durumda; fiyat şu an **4.040-4.080 dolar** aralığında işlem görüyor. **RSI göstergesinin 44 seviyesinde nötr** seyretmesi, yakın vadede sert bir kırılımın sinyalini veriyor. Yukarı yönlü bir kırılımda **4.120** ve **4.172 dolar** hedef seviyeler olarak öne çıkarken, **4.020 doların altına** sarkma durumunda **3.964** ve **3.914 dolar** bir sonraki destekler. 2026'nın ikinci çeyreğinde merkez bankalarının **289 ton altın alımı** yapması, fiyatı yapısal olarak desteklemeye devam ediyor.",
      },
      {
        icon: "🇹🇷",
        heading: "USD/TRY: TCMB Rezervleriyle Kontrollü Seyir",
        body: "USD/TRY, hafta başında **47,60-47,70 TL bandında** dengeli bir seyir izliyor. Türkiye Cumhuriyet Merkez Bankası'nın brüt rezervlerini **205,2 milyar dolara**, net rezervlerini (swaplar hariç) **78,8 milyar dolara** yükseltmiş olması, kurdaki volatiliteyi sınırlayan temel unsurlardan biri. Buna karşın yıl sonu projeksiyonları, kurun **49,70-50,00 TL bandına** doğru kademeli bir yükseliş izleyebileceğine işaret ediyor; TCMB'nin faiz politikası bu sürecin hızını belirleyecek ana değişken.",
      },
      {
        icon: "🇺🇸",
        heading: "Haftanın Ana Gündemi: Cuma Günü Açıklanacak NFP",
        body: "Hafta boyunca açıklanacak PMI ve istihdam verileri arasında en kritik başlık, **Cuma günü açıklanacak ABD tarım dışı istihdam raporu.** Veri öncesinde Çarşamba günkü **ADP özel sektör istihdam raporu** ve **ISM Hizmet Sektörü PMI'ı** piyasalara ön sinyal verebilir. Zayıf gelecek bir istihdam verisi, Fed'in faiz indirim beklentilerini güçlendirerek doları baskılayabilir ve altın/EUR başta olmak üzere risk varlıklarına destek verebilir; güçlü bir veri ise tam tersi bir etki yaratabilir.",
      },
    ],
    calendarLabel: "3-9 Ağustos 2026",
    calendarEvents: [
      {
        time: "3 Ağustos Pazartesi",
        icon: "🇺🇸",
        title: "ABD ISM İmalat PMI",
        note: "50 üzeri okuma doları destekler, altındaki bir okuma ise doları baskılar.",
      },
      {
        time: "5 Ağustos Çarşamba",
        icon: "🇺🇸",
        title: "ADP Özel Sektör İstihdam Raporu ve ISM Hizmet PMI",
        note: "Cuma'daki NFP öncesi işgücü piyasasına dair ilk sinyalleri verecek.",
      },
      {
        time: "6 Ağustos Perşembe",
        icon: "🇪🇺",
        title: "Euro Bölgesi Perakende Satışları",
        note: "Güçlü veri euroyu destekleyebilir, zayıf veri EUR/USD üzerinde baskı yaratabilir.",
      },
      {
        time: "7 Ağustos Cuma",
        icon: "🇺🇸",
        title: "ABD Tarım Dışı İstihdam (NFP), Ortalama Saatlik Kazançlar ve İşsizlik Oranı",
        note: "Haftanın en kritik verisi; piyasa beklentisi 91 bin yeni istihdam ve %4,3 işsizlik oranı yönünde. Sürpriz bir sapma EUR/USD, XAU/USD ve dolar endeksinde sert hareketlere yol açabilir.",
      },
      {
        time: "7 Ağustos Cuma",
        icon: "🇨🇦",
        title: "Kanada İşsizlik Oranı",
        note: "USD/CAD paritesinde volatiliteyi artırabilir.",
      },
    ],
    closing:
      "**FXPARTNER** ile küresel piyasaları takip edin, ekonomik gelişmeleri anlık analizlerle değerlendirin ve bilinçli işlem kararları alın.",
  },
  {
    slug: "haftalik-gorunum-2026-08-10",
    title: "FXPARTNER Haftalık Piyasa Görünümü | 10-16 Ağustos 2026",
    excerpt:
      "Haftanın ana gündemi Çarşamba günü açıklanacak ABD TÜFE (CPI) verisi; jeopolitik gerginlik Nasdaq'ı baskılarken altın 4.375 dolar civarında, EUR/USD 1,154 seviyesinde ve USD/TRY 47,70 TL bandında dengeli seyrini sürdürüyor.",
    publishedAt: "2026-08-12",
    readingMinutes: 5,
    intro:
      "10-16 Ağustos haftasında piyasaların odağı, Çarşamba günü açıklanacak ABD tüketici fiyat endeksi (TÜFE/CPI) verisinde — bu veri, Fed'in faiz patikasına dair beklentileri yeniden şekillendirebilir. Hafta boyunca ayrıca RBA faiz kararı, Almanya ve İngiltere'den makro veriler ile ABD'de art arda açıklanacak istihdam ve sanayi üretimi rakamları izlenecek. EUR/USD, XAU/USD, USD/TRY ve ABD hisse senedi piyasaları üzerinden haftanın öne çıkan başlıklarını derledik.",
    news: [
      {
        icon: "💶",
        heading: "EUR/USD: 1,154 Seviyesinde Yatay Seyir",
        body: "EUR/USD, hafta başında **1,1540-1,1542 bandında** işlem görüyor. Son bir ayda parite **%1,4 değer kazanırken**, son 12 aylık dönemde **%1,2 değer kaybetmiş** durumda — kısa vadeli toparlanma ile yıllık trend arasındaki bu ayrışma, yatırımcıların Çarşamba günkü ABD TÜFE verisini bekleyerek pozisyon almaktan kaçındığına işaret ediyor. Veri, doların ve dolayısıyla paritenin yönünü haftanın geri kalanında belirleyecek ana katalizör olarak öne çıkıyor.",
      },
      {
        icon: "🥇",
        heading: "Altın (XAU/USD): 4.375 Dolar Civarında, Güçlü Yıllık Performans",
        body: "XAU/USD, güncel olarak **4.375 dolar** seviyesinde işlem görüyor; günlük bant **4.357-4.435 dolar** arasında şekilleniyor. Ons altın, son 12 ayda **%31,4 değer kazanarak** güçlü bir yükseliş trendini sürdürüyor ve 52 haftalık aralığı **3.311-5.595 dolar** olarak kayıtlara geçti. Analistler Ağustos ayı için **3.581-4.646 dolar** aralığında bir seyir öngörüyor; merkez bankalarının sürdürdüğü net altın alımları fiyatı yapısal olarak destekleyen ana unsur olmaya devam ediyor.",
      },
      {
        icon: "🇹🇷",
        heading: "USD/TRY: 47,70 TL Bandında Kontrollü Seyir",
        body: "USD/TRY, hafta başında **47,67-47,75 TL bandında**, açılışını **47,70 TL** seviyesinden yaparak dengeli bir görünüm sergiliyor. Son 7 günlük veriye göre kur **47,54-47,80 TL** aralığında hareket etti ve ortalama **47,67 TL** seviyesinde seyretti — bu da TCMB'nin güçlü rezerv pozisyonuyla desteklenen kontrollü kur rejiminin sürdüğünü gösteriyor.",
      },
      {
        icon: "📉",
        heading: "ABD Hisse Senetleri: Jeopolitik Gerginlik ve Big Tech Zayıflığı Baskı Yaratıyor",
        body: "Nasdaq 100 endeksi, ABD-İran gerginliğine dair artan endişeler ve büyük teknoloji hisselerindeki (özellikle Alphabet) geri çekilmenin etkisiyle **29.503 puana** geriledi (**%0,40 düşüş**); günlük işlem bandı **29.428-29.706 puan** arasında şekillendi. S&P 500 **%0,3**, Nasdaq Composite ise **%0,6** değer kaybetti. Brent petrol ise jeopolitik risk primiyle **varil başına 87-88 dolar** bandında tutunmayı sürdürdü.",
      },
    ],
    calendarLabel: "10-16 Ağustos 2026",
    calendarEvents: [
      {
        time: "11 Ağustos Salı",
        icon: "🇦🇺",
        title: "RBA Faiz Kararı",
        note: "Avustralya Merkez Bankası'nın kararı, AUD paritelerinde volatiliteyi artırabilir.",
      },
      {
        time: "12 Ağustos Çarşamba",
        icon: "🇺🇸",
        title: "ABD Tüketici Fiyat Endeksi (TÜFE/CPI)",
        note: "Haftanın en kritik verisi; Fed'in faiz indirim beklentilerini ve dolayısıyla EUR/USD, XAU/USD ile dolar endeksi üzerindeki fiyatlamayı doğrudan etkileyebilir.",
      },
      {
        time: "15 Ağustos Cumartesi",
        icon: "🇺🇸",
        title: "Haftalık İşsizlik Başvuruları, Perakende Satışlar, Philly Fed Endeksi ve Sanayi Üretimi",
        note: "Aynı gün açıklanacak yoğun bir ABD veri paketi; işgücü piyasası ve tüketici harcamalarına dair güncel resmi verecek.",
      },
      {
        time: "16 Ağustos Pazar",
        icon: "🇺🇸",
        title: "Konut Başlangıçları, İnşaat İzinleri ve Michigan Tüketici Güveni (Öncü)",
        note: "Haftayı kapatan konut sektörü ve tüketici güveni verileri, dolar ve ABD hisse senedi piyasaları için ek bir yön sinyali oluşturabilir.",
      },
    ],
    closing:
      "**FXPARTNER** ile küresel piyasaları takip edin, ekonomik gelişmeleri anlık analizlerle değerlendirin ve bilinçli işlem kararları alın. Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.",
  },
];

export function getMarketAnalysisPostBySlug(slug: string): MarketAnalysisPost | undefined {
  return marketAnalysisPosts.find((p) => p.slug === slug);
}
