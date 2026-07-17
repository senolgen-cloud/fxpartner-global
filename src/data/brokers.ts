export interface Broker {
  rank: number;
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  rating: number; // out of 5
  founded: number;
  minDeposit: string;
  maxLeverage: string;
  regulators: string[];
  platforms: string[];
  headquarters: string;
  referralUrl: string;
  partnerCode?: string;
  summary: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  accentNote: string;
  categories: string[];
  scoreCost: number;
  scoreWithdrawal: number;
}

export const brokerCategories = [
  "Yeni Başlayanlar",
  "Düşük Spread",
  "Yüksek Kaldıraç",
  "Kurumsal Güven",
  "Çoklu Platform",
  "Algoritmik Trading",
] as const;

export type BrokerCategory = (typeof brokerCategories)[number];

export const categoryInfo: Record<
  BrokerCategory,
  { slug: string; description: string }
> = {
  "Yeni Başlayanlar": {
    slug: "yeni-baslayanlar",
    description:
      "Düşük minimum yatırım ve sade hesap açma süreciyle forex'e ilk adımı atanlara uygun brokerlar.",
  },
  "Düşük Spread": {
    slug: "dusuk-spread",
    description:
      "Ham fiyata yakın spread ve şeffaf komisyon yapısıyla işlem maliyetini önceliklendiren brokerlar.",
  },
  "Yüksek Kaldıraç": {
    slug: "yuksek-kaldirac",
    description:
      "Daha yüksek kaldıraç seçenekleri sunan, aktif ve deneyimli traderlara yönelik brokerlar.",
  },
  "Kurumsal Güven": {
    slug: "kurumsal-guven",
    description:
      "Çok sayıda üst düzey (Tier-1) düzenleyici otorite altında faaliyet gösteren, kurumsal ölçekli brokerlar.",
  },
  "Çoklu Platform": {
    slug: "coklu-platform",
    description:
      "MT4/MT5'in yanı sıra kendi geliştirdiği web, mobil veya cTrader gibi ek platform seçenekleri sunan brokerlar.",
  },
  "Algoritmik Trading": {
    slug: "algoritmik-trading",
    description:
      "EA (Expert Advisor) desteği, VPS ve otomatik strateji altyapısına uygun brokerlar.",
  },
};

export function getCategoryBySlug(slug: string) {
  const entry = (Object.entries(categoryInfo) as [BrokerCategory, { slug: string; description: string }][]).find(
    ([, info]) => info.slug === slug
  );
  if (!entry) return undefined;
  const [name, info] = entry;
  return { name, ...info };
}

// --- FXPARTNER Endeksi ---
// Dört eksenli, "Broker nasıl seçilir?" rehberindeki 01-04 adımlarıyla
// birebir eşleşen puanlama sistemi. Düzenleme ve Platform eksenleri
// brokerın kendi verisinden (regulators, platforms) deterministik olarak
// hesaplanır; Maliyet ve Para Çekme eksenleri incelemede yer alan
// doğrulanabilir sinyallere (pros/cons/summary) dayanan editoryal
// değerlendirmedir. Sinyal bulunmayan brokerlar nötr (3/5) alır.
export const scoreAxes = [
  {
    n: "01",
    key: "regulation",
    label: "Düzenleme",
    description:
      "Tier-1 otorite sayısı ve toplam lisans çeşitliliğine göre hesaplanır.",
  },
  {
    n: "02",
    key: "cost",
    label: "Maliyet",
    description:
      "Spread, komisyon ve minimum yatırım şeffaflığına dair editoryal değerlendirme.",
  },
  {
    n: "03",
    key: "platform",
    label: "Platform",
    description:
      "Sunulan işlem platformu sayısı ve çeşitliliğine göre hesaplanır.",
  },
  {
    n: "04",
    key: "withdrawal",
    label: "Para Çekme",
    description:
      "İncelemede doğrulanabilir para çekme hız/şeffaflık sinyallerine dayanır; sinyal yoksa nötr puan atanır.",
  },
] as const;

export type ScoreAxisKey = (typeof scoreAxes)[number]["key"];

const TIER1_REGULATORS = new Set([
  "FCA",
  "ASIC",
  "CySEC",
  "DFSA",
  "Central Bank of Ireland",
]);

function computeRegulationScore(broker: Broker): number {
  const tier1Count = broker.regulators.filter((r) =>
    TIER1_REGULATORS.has(r)
  ).length;
  let score = 1;
  if (tier1Count >= 3) score = 5;
  else if (tier1Count === 2) score = 4;
  else if (tier1Count === 1) score = 3;
  else score = broker.regulators.length > 1 ? 2 : 1;
  if (tier1Count >= 2 && broker.regulators.length >= 4) score = 5;
  return Math.min(5, score);
}

function computePlatformScore(broker: Broker): number {
  return Math.min(5, Math.max(1, broker.platforms.length + 1));
}

export function getBrokerScores(broker: Broker) {
  const regulation = computeRegulationScore(broker);
  const cost = broker.scoreCost;
  const platform = computePlatformScore(broker);
  const withdrawal = broker.scoreWithdrawal;
  const composite =
    Math.round(((regulation + cost + platform + withdrawal) / 4) * 2 * 10) /
    10;
  return { regulation, cost, platform, withdrawal, composite };
}

export const brokers: Broker[] = [
  {
    rank: 1,
    slug: "xm",
    name: "XM Global",
    logo: "/brokers/xm.png",
    tagline: "MT4, MT5 ve XM App üzerinden işlem imkanı",
    rating: 4.8,
    founded: 2009,
    minDeposit: "$5",
    maxLeverage: "1:1000*",
    regulators: ["ASIC", "CySEC", "DFSA", "FSC (Belize)"],
    platforms: ["MT4", "MT5", "XM App"],
    headquarters: "Kıbrıs / Avustralya",
    referralUrl: "https://affs.click/gvaLg",
    partnerCode: "FXPARTNER",
    summary:
      "XM, geniş kapsamlı eğitim materyalleri, düzenli canlı webinarlar ve çok düşük bir minimum yatırım tutarıyla FXPARTNER topluluğunda en çok tercih edilen brokerdır. FXPARTNER ortak kodu ile açılan hesaplar VIP avantajlardan faydalanabilir.",
    pros: [
      "5 USD gibi düşük minimum yatırım",
      "FXPARTNER ortak kodu ile VIP avantajlar",
      "Çoklu düzenleyici lisans (ASIC, CySEC)",
      "Negatif bakiye koruması",
    ],
    cons: [
      "Ham fiyat (raw spread) hesap seçeneği sınırlı",
      "Bölgeye göre kaldıraç oranları değişkenlik gösterir",
    ],
    bestFor: "Yeni başlayanlar ve eğitim odaklı yatırımcılar",
    accentNote: "En çok tercih edilen",
    categories: ["Yeni Başlayanlar"],
    scoreCost: 4,
    scoreWithdrawal: 3,
  },
  {
    rank: 2,
    slug: "avatrade",
    name: "AvaTrade",
    logo: "/brokers/avatrade.jpg",
    tagline: "Kurumsal güven, geniş düzenleme ağı",
    rating: 4.5,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:400*",
    regulators: ["Central Bank of Ireland", "ASIC", "FSCA", "ADGM"],
    platforms: ["MT4", "MT5", "AvaTradeGO", "WebTrader"],
    headquarters: "İrlanda",
    referralUrl: "https://tracking.avapartner.com/yRwAAA",
    summary:
      "AvaTrade, dünya genelinde 9'dan fazla düzenleyici otorite altında faaliyet gösteren, sabit spread seçeneği ve sosyal/kopya trading altyapısı sunan kurumsal ölçekli bir brokerdır. FXPARTNER üzerinden özel bonus kampanyalarına erişilebilir.",
    pros: [
      "9+ düzenleyici lisans ile geniş güvenlik ağı",
      "FXPARTNER'e özel bonus kampanyaları",
      "Sabit ve değişken spread seçenekleri",
      "Kendi mobil platformu AvaTradeGO",
    ],
    cons: [
      "Minimum yatırım XM'e göre daha yüksek",
      "İşlem başına komisyon bazı hesap tiplerinde mevcut",
    ],
    bestFor: "Kurumsal güven ve kopya trading arayanlar",
    accentNote: "En çok düzenlenen",
    categories: ["Kurumsal Güven", "Çoklu Platform"],
    scoreCost: 3,
    scoreWithdrawal: 3,
  },
  {
    rank: 3,
    slug: "tickmill",
    name: "Tickmill",
    logo: "/brokers/tickmill.webp",
    tagline: "MetaTrader platformları ve düşük spread",
    rating: 4.5,
    founded: 2014,
    minDeposit: "$100",
    maxLeverage: "1:500*",
    regulators: ["FCA", "CySEC", "FSA (Seychelles)", "Labuan FSA"],
    platforms: ["MT4", "MT5"],
    headquarters: "Birleşik Krallık",
    referralUrl: "https://tickmill.link/4vvHCRK",
    partnerCode: "IB45254758",
    summary:
      "Tickmill, düşük maliyetli Pro hesapları, hoşgeldin ve marj bonusları ile FCA dahil üst düzey düzenleyici altyapısıyla maliyet bilinci yüksek yatırımcılara hitap eder. FXPARTNER VIP ortak kodu ile ek avantajlar sunulur.",
    pros: [
      "Pro hesaplarda düşük ham spread + komisyon",
      "Hoşgeldin ve marj bonusları",
      "FCA dahil üst düzey düzenleyici lisanslar",
      "Hızlı ve şeffaf para yatırma/çekme süreçleri",
    ],
    cons: [
      "Classic hesap tipinde minimum yatırım göreceli yüksek",
      "Eğitim içerikleri XM kadar kapsamlı değil",
    ],
    bestFor: "Maliyet bilinci yüksek, aktif işlem yapan yatırımcılar",
    accentNote: "En güçlü bonus programı",
    categories: ["Düşük Spread", "Kurumsal Güven"],
    scoreCost: 5,
    scoreWithdrawal: 4,
  },
  {
    rank: 4,
    slug: "lite-finance",
    name: "Lite Finance",
    logo: "/brokers/lite-finance.png",
    tagline: "1:1000'e kadar seçilebilir kaldıraç",
    rating: 4.5,
    founded: 2005,
    minDeposit: "$10",
    maxLeverage: "1:1000*",
    regulators: ["Offshore lisans"],
    platforms: ["MT4", "MT5", "LiteFinance WebTerminal"],
    headquarters: "Kıbrıs",
    referralUrl: "https://litefinance-tr.org/?uid=667827970",
    summary:
      "Lite Finance, cent hesaplar, yüksek kaldıraç seçenekleri ve düşük minimum yatırım tutarıyla özellikle küçük sermayeyle başlamak isteyen yatırımcılar arasında popülerdir. FXPARTNER'e özel bonus ve promosyonlardan faydalanılabilir.",
    pros: [
      "10 USD ile hesap açma imkanı",
      "FXPARTNER'e özel bonus ve promosyonlar",
      "Cent hesap seçeneği ile düşük riskli pratik",
      "Basit ve hızlı hesap açma süreci",
    ],
    cons: [
      "Üst düzey (Tier-1) düzenleyici lisans bulunmuyor",
      "Kurumsal yatırımcı içeriği XM/AvaTrade kadar geniş değil",
    ],
    bestFor: "Küçük sermayeyle başlayan bireysel yatırımcılar",
    accentNote: "En düşük bariyer",
    categories: ["Yeni Başlayanlar"],
    scoreCost: 4,
    scoreWithdrawal: 3,
  },
  {
    rank: 5,
    slug: "exness",
    name: "EXNESS",
    logo: "/brokers/exness.png",
    tagline: "Sıfıra yakın spread ve anında para çekme",
    rating: 4.3,
    founded: 2008,
    minDeposit: "$10",
    maxLeverage: "Sınırsız*",
    regulators: ["FCA", "CySEC", "FSCA", "FSC (Mauritius)"],
    platforms: ["MT4", "MT5", "Exness Terminal"],
    headquarters: "Kıbrıs",
    referralUrl: "https://one.exnessonelink.com/a/nt8xpejsow",
    partnerCode: "nt8xpejsow",
    summary:
      "Exness, anlık para çekim süreleri, sıfıra yakın spread seçenekleri ve esnek/sınırsıza kadar kaldıraç seçenekleriyle özellikle aktif traderlar arasında öne çıkar. FXPARTNER ortak kodu ile hesap açanlar özel avantajlara erişebilir.",
    pros: [
      "Anlık/otomatik para çekim süreçleri",
      "Bazı hesap tiplerinde sınırsıza yakın kaldıraç",
      "10 USD ile düşük giriş bariyeri",
      "FXPARTNER ayrıcalıklarına erişim imkanı",
    ],
    cons: [
      "Çok yüksek kaldıraç deneyimsiz yatırımcılar için risklidir",
      "Hesap tipi çeşitliliği ilk bakışta kafa karıştırıcı olabilir",
    ],
    bestFor: "Aktif işlem hacmi yüksek deneyimli traderlar",
    accentNote: "En hızlı para çekim vurgusu",
    categories: ["Yüksek Kaldıraç", "Düşük Spread"],
    scoreCost: 5,
    scoreWithdrawal: 5,
  },
  {
    rank: 6,
    slug: "markets-com",
    name: "markets.com",
    logo: "/brokers/markets-com.png",
    tagline: "Web, mobil, MT4 ve MT5 platform seçenekleri",
    rating: 4.0,
    founded: 2008,
    minDeposit: "$100",
    maxLeverage: "1:300*",
    regulators: ["CySEC", "FSC (BVI)"],
    platforms: ["Marketsx (Web)", "Mobil", "MT4", "MT5"],
    headquarters: "Kıbrıs / BVI",
    referralUrl: "https://refer.markets.com/2R72MI",
    partnerCode: "2R72MI",
    summary:
      "markets.com, kendi geliştirdiği Marketsx platformu ile web, mobil ve MetaTrader seçeneklerini bir arada sunan köklü bir brokerdır. FXPARTNER ortak kodu ile özel avantajlara erişilebilir.",
    pros: [
      "Kendi geliştirdiği Marketsx web platformu",
      "FXPARTNER ortak kodu ile özel avantajlar",
      "MT4/MT5 ve mobil uygulama desteği",
      "Geniş enstrüman yelpazesi (forex, hisse, emtia, endeks)",
    ],
    cons: [
      "Tier-1 düzenleme kapsamı diğer brokerlara göre daha dar",
      "Bazı bölgelerde hizmet kısıtlaması olabilir",
    ],
    bestFor: "Kendi platformunu tercih eden çok yönlü yatırımcılar",
    accentNote: "En çok yönlü platform",
    categories: ["Çoklu Platform"],
    scoreCost: 3,
    scoreWithdrawal: 3,
  },
  {
    rank: 7,
    slug: "acy-global",
    name: "ACY Global",
    logo: "/brokers/acy-global.png",
    tagline: "2.200+ enstrüman, EA-dostu MT4/MT5 altyapısı",
    rating: 4.0,
    founded: 2014,
    minDeposit: "$50",
    maxLeverage: "1:500*",
    regulators: ["ASIC"],
    platforms: ["MT4", "MT5"],
    headquarters: "Avustralya",
    referralUrl: "https://bit.ly/acy-global",
    summary:
      "ACY Global, 2.200'den fazla enstrüman, EA-dostu MT4/MT5 altyapısı ve ücretsiz VPS desteğiyle otomatik (algoritmik) trade sistemlerine uygun bir seçenektir. Bu içerik kamuya açık kaynaklardan (ACY resmi regülasyon sayfası, WikiFX, Trustpilot, FxScouts, FXEmpire) derlenmiştir.",
    pros: [
      "2.200+ enstrüman ile geniş ürün yelpazesi",
      "EA (algoritmik) stratejilere uygun altyapı",
      "Ücretsiz VPS desteği",
      "ASIC düzenlemesi altında faaliyet",
    ],
    cons: [
      "FXPARTNER'e özel ortak kodu/bonus bulunmuyor",
      "Marka bilinirliği diğer köklü brokerlara göre daha sınırlı",
    ],
    bestFor: "Otomatik/algoritmik trading yapan yatırımcılar",
    accentNote: "En geniş enstrüman yelpazesi",
    categories: ["Algoritmik Trading"],
    scoreCost: 3,
    scoreWithdrawal: 3,
  },
  {
    rank: 8,
    slug: "fxpro",
    name: "FxPro",
    logo: "/brokers/fxpro.png",
    tagline: "MT4, MT5 ve FxPro App üzerinden işlem imkanı",
    rating: 3.5,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:2000*",
    regulators: ["FCA", "CySEC", "FSCA", "SCB (Bahamas)"],
    platforms: ["MT4", "MT5", "cTrader", "FxPro App"],
    headquarters: "Birleşik Krallık / Kıbrıs",
    referralUrl: "https://bit.ly/fxpro-turkiye",
    partnerCode: "2qhvb5Zx2",
    summary:
      "FxPro, FCA dahil üst düzey düzenleyici lisansları, geniş platform desteği (MT4, MT5, cTrader, FxPro App) ve bazı hesap tiplerinde 1:2000'e kadar yüksek kaldıraç seçenekleriyle köklü bir brokerdır.",
    pros: [
      "FCA dahil üst düzey düzenleyici lisanslar",
      "MT4/MT5/cTrader/FxPro App geniş platform desteği",
      "Bazı hesaplarda 1:2000'e kadar yüksek kaldıraç",
      "20 yılı aşkın sektör deneyimi",
    ],
    cons: [
      "Puanı diğer FXPARTNER partnerlerine göre daha düşük",
      "Bazı hesap tiplerinde komisyon yapısı karmaşık olabilir",
    ],
    bestFor: "Yüksek kaldıraç ve çoklu platform arayan deneyimli yatırımcılar",
    accentNote: "En yüksek kaldıraç seçeneği",
    categories: ["Yüksek Kaldıraç", "Kurumsal Güven"],
    scoreCost: 3,
    scoreWithdrawal: 3,
  },
];

export function getBrokerBySlug(slug: string): Broker | undefined {
  return brokers.find((b) => b.slug === slug);
}
