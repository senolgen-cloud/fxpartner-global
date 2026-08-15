// Editorial content for the /partners page. Kept separate from brokers.ts
// since this is partner-program copy, not broker review data. Any figures
// here (tier thresholds, rev-share percentages, calculator rate) are
// illustrative examples, not confirmed broker terms — every section that
// surfaces a number pulled from here also carries a disclaimer saying so.

export interface PartnerStep {
  title: string;
  body: string;
}

export const partnerSteps: PartnerStep[] = [
  {
    title: "Kayıt Ol",
    body: "Kitlen ve onları bir brokera nasıl yönlendirmeyi planladığına dair birkaç bilgiyle dakikalar içinde başvur. Ücretsiz, taahhüt yok.",
  },
  {
    title: "Referans linkini al",
    body: "Onaylandıktan sonra, FXPARTNER'ın mevcut ana IB anlaşması kapsamında kendi Alt-IB takip linkini alırsın — sıfırdan şart pazarlığı yapmana gerek yok.",
  },
  {
    title: "Yatırımcıları davet et",
    body: "Linkini kitlen, topluluğun veya ağın üzerinden paylaş — sosyal medya, Telegram, bir blog veya ağızdan ağıza.",
  },
  {
    title: "Ömür boyu komisyon kazan",
    body: "Linkin üzerinden kaydolan ve işlem yapan her müşterinin oluşturduğu rev-share'den kararlaştırılan payını, işlem yapmaya devam ettiği sürece kazan.",
  },
];

export interface PartnerTier {
  name: string;
  minReferred: number;
  revShareLabel: string;
  perks: string[];
}

// Illustrative tier structure only — final thresholds and rev-share are
// confirmed per broker agreement once a partner is approved.
export const partnerTiers: PartnerTier[] = [
  {
    name: "Bronz",
    minReferred: 1,
    revShareLabel: "Başlangıç rev-share",
    perks: ["Kişisel referans linki", "Aylık ödeme dökümü", "E-posta desteği"],
  },
  {
    name: "Gümüş",
    minReferred: 10,
    revShareLabel: "Artırılmış rev-share",
    perks: ["Öncelikli ödeme işlemi", "İçerik kütüphanesine erişim", "Özel partner ID"],
  },
  {
    name: "Altın",
    minReferred: 25,
    revShareLabel: "Yüksek rev-share seviyesi",
    perks: ["Üç aylık performans değerlendirmesi", "Yeni broker anlaşmalarına erken erişim", "Ortak pazarlama fırsatları"],
  },
  {
    name: "Elmas",
    minReferred: 50,
    revShareLabel: "Premium rev-share seviyesi",
    perks: ["Özel ortaklık temas kişisi", "Kampanya bazlı özel takip linkleri", "Öncelikli broker tanıtımları"],
  },
  {
    name: "Elit",
    minReferred: 100,
    revShareLabel: "Elit rev-share seviyesi",
    perks: ["Ortaklık masasına doğrudan hat", "Yeni broker ortaklıklarında söz hakkı", "Öne çıkan yerleşim uygunluğu"],
  },
  {
    name: "Efsane",
    minReferred: 250,
    revShareLabel: "En üst düzey pazarlıklı rev-share",
    perks: ["Özel ticari şartlar", "Ortak kampanya planlaması", "Kurucu seviyesinde ortaklık görüşmelerine doğrudan erişim"],
  },
];

export interface WhyCard {
  key: "shield" | "rocket" | "graph" | "network" | "diamond";
  title: string;
  body: string;
}

export const whyFxPartnerCards: WhyCard[] = [
  {
    key: "shield",
    title: "Regüle broker ağı",
    body: "Ağımızdaki her partner broker, FXPARTNER'ın kendi inceleme kriterlerinden geçti — yatırımcıları bilinmeze yönlendirmiyorsun.",
  },
  {
    key: "rocket",
    title: "Hızlı, sade onay süreci",
    body: "Uzun bir katılım süreci yok. Başvur, brokerin partner masasıyla eşleştir, onaylandığında linkini al.",
  },
  {
    key: "graph",
    title: "Şeffaf raporlama",
    body: "Referans ve komisyon hareketlerini kendi partner panelinden takip et — bizimkinden ayrı, kontrolü sende.",
  },
  {
    key: "network",
    title: "Tek anlaşma, birden fazla broker",
    body: "Ana IB anlaşmalarımız sayesinde her seferinde şartları yeniden pazarlık etmeden yeni broker ortaklıklarına genişleyebilirsin.",
  },
  {
    key: "diamond",
    title: "Gerçek bir ortaklık masası",
    body: "Sorular bir destek kuyruğuna değil, kendi broker ilişkilerimizi yöneten aynı ekibin özel bir ortaklık temas kişisine gider.",
  },
];

export interface ContentLibraryCategory {
  title: string;
  description: string;
  itemCount: number;
}

export const contentLibraryCategories: ContentLibraryCategory[] = [
  { title: "Instagram şablonları", description: "Feed ve Reels için boyutlandırılmış, düzenlenebilir post ve story tasarımları.", itemCount: 18 },
  { title: "Telegram banner'ları", description: "Trading toplulukları için kanal başlıkları ve sabitlenmiş gönderi görselleri.", itemCount: 12 },
  { title: "Reels ve Shorts senaryoları", description: "Kendin çekebileceğin veya bir editöre verebileceğin kısa video senaryoları.", itemCount: 9 },
  { title: "E-posta hazır metinleri", description: "Kitleni partner brokerlarla tanıştıran, göndermeye hazır e-posta metinleri.", itemCount: 6 },
  { title: "Landing sayfa içerikleri", description: "Basit bir referans landing sayfası için görsel ve metin blokları.", itemCount: 8 },
];

export interface ContentStudioSample {
  channel: string;
  preview: string;
}

export const contentStudioPrompt = "Instagram Gönderisi Oluştur";

export const contentStudioSamples: ContentStudioSample[] = [
  {
    channel: "Instagram",
    preview: "\"Trading ağın daha iyi bir işlem gerçekleştirmeyi hak ediyor. Brokerinin gerçekten sözünü tutup tutmadığını nasıl kontrol edeceğin burada.\" — carousel, 5 slayt",
  },
  {
    channel: "Telegram",
    preview: "📊 Yeni partner tanıtımı — topluluğunun linkin üzerinden hangi regüle brokerlara erişebileceğini gör.",
  },
  {
    channel: "Blog",
    preview: "\"Kitleni yönlendirmeden önce bir forex brokerında nelere dikkat etmelisin\" — 600 kelimelik taslak, SEO başlığı dahil.",
  },
  {
    channel: "E-posta",
    preview: "Konu: \"Paylaşmaya değer bir referans linki\" — bültenin için 3 paragraflık taslak.",
  },
];

export interface PartnerFaqItem {
  question: string;
  answer: string;
}

export const partnerFaqItems: PartnerFaqItem[] = [
  {
    question: "Partner programına katılmanın bir maliyeti var mı?",
    answer: "Hayır. Başvurmak ve partner olarak katılmak ücretsizdir. Kayıt ücreti veya minimum harcama şartı yoktur.",
  },
  {
    question: "Kendim işlem yapmam gerekiyor mu?",
    answer: "Hayır. Bu program kendi hesabında işlem yapanlar için değil, başka yatırımcıları yönlendirenler içindir. Kendi hesabında işlem yapıyorsan, bunun yerine cashback programımıza bak.",
  },
  {
    question: "Ödemem nasıl ve ne zaman yapılır?",
    answer: "Ödeme takvimi ve yöntemi, Alt-IB olarak onaylandıktan sonra her brokerin partner masası tarafından belirlenir — detayları katılım sürecinde seninle netleştireceğiz.",
  },
  {
    question: "Hangi brokerlarla ortak olabilirim?",
    answer: "Alt-IB ortaklıkları şu anda FXPARTNER'ın zaten onaylı bir ana IB anlaşması bulunduğu brokerlar için mevcuttur; bunlar bu sayfanın devamında listelenmiştir.",
  },
  {
    question: "Yönlendirdiğim bir müşteri işlem yapmayı bırakırsa ne olur?",
    answer: "Komisyonlar aktif işlem hacminden oluşur. Bir müşteri işlem yapmayı bırakırsa, o müşteri komisyon üretmeyi de bırakır — garantili veya sabit bir gelir yoktur.",
  },
  {
    question: "Bu, FXPARTNER'ın brokerlarla kendi affiliate ilişkisinden nasıl farklı?",
    answer: "Alt-IB olarak kendi takip linkini ve brokerle kendi anlaşmanı alırsın, bu FXPARTNER'ınkinden ayrıdır — verilerin ve ödemelerin sen ile brokerin partner masası arasındadır.",
  },
];

export const calculatorDefaults = {
  referredTraders: 25,
  avgLotsPerTraderPerMonth: 4,
  commissionPerLot: 5,
};

export interface NetworkRegion {
  key: string;
  label: string;
  // Position expressed as a percentage of the panel's width/height, so the
  // layout stays a stylized network graphic rather than a literal (and
  // easy to get subtly wrong) world-map projection.
  x: number;
  y: number;
}

export const networkRegions: NetworkRegion[] = [
  { key: "europe", label: "Avrupa", x: 50, y: 22 },
  { key: "mena", label: "MENA", x: 58, y: 46 },
  { key: "asia-pacific", label: "Asya-Pasifik", x: 82, y: 40 },
  { key: "africa", label: "Afrika", x: 48, y: 68 },
  { key: "americas", label: "Amerika", x: 16, y: 38 },
];

// Arcs are pairs of region keys from networkRegions above.
export const networkArcs: [string, string][] = [
  ["europe", "mena"],
  ["europe", "americas"],
  ["mena", "asia-pacific"],
  ["europe", "africa"],
  ["asia-pacific", "americas"],
];
