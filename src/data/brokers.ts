export interface Broker {
  rank: number;
  slug: string;
  name: string;
  // Can stay empty until a real logo file is added; the card falls back
  // to a monogram made from the broker name's initials in that case.
  logo?: string;
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
  // The Regulation axis is derived from the regulators list by default.
  // This field only exists for cases where the editorial team makes a
  // reasoned exception and overrides the formula.
  scoreRegulationOverride?: number;
  // The composite Index score is the average of the four axes by
  // default. This field only exists for a reasoned editorial exception
  // that overrides the formula.
  scoreOverride?: number;
  // Optional real license number per regulator (only the ones we've
  // independently verified — a regulator can appear in `regulators`
  // without a matching entry here if its number hasn't been confirmed).
  // Rendered as a trust badge on the review page.
  licenseNumbers?: Partial<Record<string, string>>;
  // An optional time-limited campaign (e.g. refer-a-friend), rendered as
  // a highlighted banner on the broker's review page. Distinct from the
  // standing referralUrl/partnerCode, which is always active.
  promotion?: {
    tag: string;
    title: string;
    intro: string;
    steps: string[];
    note: string;
    contactEmail?: string;
    // Optional designed creative for this campaign (e.g. a stats/announcement
    // banner), shown above the campaign copy on /campaigns. Falls back to the
    // broker logo + text layout when omitted, same as adImage does for
    // BrokerAdBanner.
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
    // Optional campaign-specific CTA that overrides referralUrl for this
    // promotion's primary button — e.g. an existing-client panel login link
    // instead of the standard new-account referral link.
    ctaUrl?: string;
    ctaLabel?: string;
  };
  // Optional designed social-share preview image for this broker's review
  // page, overriding the auto-generated opengraph-image for that route.
  ogImage?: string;
  // Optional designed creative for BrokerAdBanner. When set, the ad banner
  // renders this image (linked to referralUrl) instead of the default
  // logo/tagline/CTA card layout. Width/height are the creative's real
  // pixel dimensions (needed so Next/Image computes the right aspect
  // ratio) — default to the 16:9 in-house template's size when omitted.
  adImage?: string;
  adImageWidth?: number;
  adImageHeight?: number;
  // Optional hand-written FAQ entries appended after the auto-generated
  // ones from brokerFaqs() (src/lib/brokerContent.ts). Unlike the rest of
  // this file, these render in whatever language they're written in — the
  // site's Turkish is otherwise served through the client-side Google
  // Translate widget, which AI/search crawlers reading static HTML never
  // see. Use this field to answer specific, real-world phrased questions
  // (e.g. Turkish queries about this broker) directly in their own
  // language so crawlers can actually find and cite the answer.
  extraFaqs?: { q: string; a: string }[];
  // Optional, researched deep-dive detail beyond the standard fields above.
  // Only populated for brokers we've written a full account-type/deposit/
  // withdrawal breakdown for — the page simply omits this section when absent.
  deepDive?: {
    accountTypes: { name: string; spread: string; commission: string; minDeposit: string }[];
    deposits: string;
    withdrawals: string;
    support: string;
    education: string;
  };
}

export const brokerCategories = [
  "Beginners",
  "Low Spread",
  "High Leverage",
  "Institutional Trust",
  "Multi-Platform",
] as const;

export type BrokerCategory = (typeof brokerCategories)[number];

export const categoryInfo: Record<
  BrokerCategory,
  { slug: string; label: string; description: string }
> = {
  Beginners: {
    slug: "beginners",
    label: "Yeni Başlayanlar",
    description:
      "Düşük minimum yatırım ve basit hesap açma süreciyle forex'e ilk adım için uygun brokerlar.",
  },
  "Low Spread": {
    slug: "low-spread",
    label: "Düşük Spread",
    description:
      "Ham spreade yakın fiyatlar ve şeffaf komisyon yapısıyla işlem maliyetine öncelik veren brokerlar.",
  },
  "High Leverage": {
    slug: "high-leverage",
    label: "Yüksek Kaldıraç",
    description:
      "Aktif ve deneyimli yatırımcılara yönelik, daha yüksek kaldıraç seçenekleri sunan brokerlar.",
  },
  "Institutional Trust": {
    slug: "institutional-trust",
    label: "Kurumsal Güven",
    description:
      "Birden fazla üst düzey (Tier-1) regülasyon otoritesi altında faaliyet gösteren, kurumsal ölçekli brokerlar.",
  },
  "Multi-Platform": {
    slug: "multi-platform",
    label: "Çoklu Platform",
    description:
      "MT4/MT5'in ötesinde kendi web, mobil veya cTrader gibi ek platform seçenekleri sunan brokerlar.",
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

// --- FXPARTNER Index ---
// A four-axis scoring system that maps directly to the 01-04 steps in the
// "How to choose a broker" guide. The Platform axis is computed
// deterministically from the broker's own data. The Regulation axis is
// derived from the regulators list by default, but can be overridden via
// scoreRegulationOverride when the editorial team makes a reasoned
// exception. The Cost and Withdrawal axes are editorial judgments based
// on verifiable signals in the review (pros/cons/summary). Brokers with
// no signal get a neutral score (3/5).
export const scoreAxes = [
  {
    n: "01",
    key: "regulation",
    label: "Regülasyon",
    description:
      "Tier-1 otorite sayısı ve genel lisans çeşitliliğinden hesaplanır; editör ekibi gerekçeli istisnalar için güncelleyebilir.",
  },
  {
    n: "02",
    key: "cost",
    label: "Maliyet",
    description:
      "Spread, komisyon ve minimum yatırım şeffaflığının editoryal değerlendirmesi.",
  },
  {
    n: "03",
    key: "platform",
    label: "Platform",
    description:
      "Sunulan işlem platformlarının sayısı ve çeşitliliğinden hesaplanır.",
  },
  {
    n: "04",
    key: "withdrawal",
    label: "Para Çekme",
    description:
      "İncelemede bulunan doğrulanabilir para çekme hızı/şeffaflık sinyallerine dayanır; sinyal yoksa nötr bir puan atanır.",
  },
] as const;

export type ScoreAxisKey = (typeof scoreAxes)[number]["key"];

export const TIER1_REGULATORS = new Set([
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
  const regulation = broker.scoreRegulationOverride ?? computeRegulationScore(broker);
  const cost = broker.scoreCost;
  const platform = computePlatformScore(broker);
  const withdrawal = broker.scoreWithdrawal;
  const computed =
    Math.round(((regulation + cost + platform + withdrawal) / 4) * 2 * 10) /
    10;
  const composite = broker.scoreOverride ?? computed;
  return { regulation, cost, platform, withdrawal, composite };
}

export type RiskLevel = "low" | "medium" | "high";

// Derived, not editorial — a simple read of the same composite Index score
// already shown elsewhere on the page, just labeled for quick scanning.
export function getRiskLevel(broker: Broker): RiskLevel {
  const { composite } = getBrokerScores(broker);
  if (composite >= 8) return "low";
  if (composite >= 6) return "medium";
  return "high";
}

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Düşük Risk",
  medium: "Orta Risk",
  high: "Yüksek Risk",
};

export const brokers: Broker[] = [
  {
    rank: 1,
    slug: "xm",
    name: "XM Global",
    logo: "/brokers/xm.png",
    ogImage: "/brokers/xm-cover.jpg",
    adImage: "/campaigns/xm-100bonus-reklam.png",
    adImageWidth: 1672,
    adImageHeight: 941,
    tagline: "MT4, MT5 ve XM App üzerinden işlem yapın",
    rating: 4.8,
    founded: 2009,
    minDeposit: "$5",
    maxLeverage: "1:1000*",
    regulators: ["ASIC", "CySEC", "DFSA", "FSC (Belize)"],
    licenseNumbers: { ASIC: "443670", CySEC: "120/10", DFSA: "F003484" },
    platforms: ["MT4", "MT5", "XM App"],
    headquarters: "Kıbrıs / Avustralya",
    referralUrl: "https://affs.click/gvaLg",
    partnerCode: "FXPARTNER",
    summary:
      "XM, kapsamlı eğitim materyalleri, düzenli canlı webinarlar ve son derece düşük minimum yatırım tutarı sayesinde FXPARTNER topluluğunda en çok tercih edilen brokerdır. FXPARTNER ortak kodu ile açılan hesaplar VIP ayrıcalıklarına erişim kazanır.",
    pros: [
      "5 dolar gibi düşük minimum yatırım tutarı",
      "FXPARTNER ortak kodu ile VIP ayrıcalıklar",
      "Birden fazla düzenleyici lisans (ASIC, CySEC)",
      "Negatif bakiye koruması",
      "Ortalama 1-2 dakikada 7/24 para çekme",
    ],
    cons: [
      "Sınırlı raw-spread hesap seçenekleri",
      "Kaldıraç oranları bölgeye göre değişir",
    ],
    bestFor: "Yeni başlayanlar ve eğitime önem veren yatırımcılar",
    accentNote: "En çok tercih edilen",
    categories: ["Beginners"],
    scoreCost: 5,
    scoreWithdrawal: 5,
    extraFaqs: [
      {
        q: "XM Global güvenilir mi?",
        a: "XM Global, ASIC (Avustralya), CySEC (Kıbrıs) ve DFSA (Dubai) gibi tier-1 düzenleyiciler dahil 4 farklı lisansa sahiptir; bu düzenleyiciler müşteri fonlarının şirket fonlarından ayrı tutulmasını ve asgari sermaye şartlarını zorunlu kılar. 2009'dan beri faaliyette olan XM, negatif bakiye koruması sunar ve FXPARTNER topluluğunda en çok tercih edilen broker konumundadır. Yine de her broker gibi, yatırım yapmadan önce güncel lisans durumunu ve kendi ülkenizdeki erişilebilirliği XM'in resmi sitesinden teyit etmenizi öneririz.",
      },
      {
        q: "XM Global'den nasıl para çekilir?",
        a: "XM Global'de para çekme talepleri genellikle 24 saat içinde işleme alınır — e-cüzdan (Skrill, Neteller, WebMoney) çekimleri çoğunlukla aynı gün hesabınıza geçer, kart ve banka havalesi çekimleri ise sağlayıcıya bağlı olarak yaklaşık 2-5 iş günü sürebilir. XM, çekim işlemlerinden herhangi bir ücret almaz; olası gecikmeler genellikle ödeme sağlayıcısının kendi işlem sürelerinden kaynaklanır. Çekim, yalnızca hesap doğrulaması (KYC) tamamlanmış hesaplarda ve genellikle paranın yatırıldığı yönteme yapılabilir.",
      },
    ],
    deepDive: {
      accountTypes: [
        { name: "Micro", spread: "1.0 pipten itibaren", commission: "Yok", minDeposit: "$5" },
        { name: "Standard", spread: "1.0 pipten itibaren", commission: "Yok", minDeposit: "$5" },
        { name: "XM Ultra Low", spread: "0.6 pipten itibaren", commission: "Yok", minDeposit: "$100" },
        { name: "Zero", spread: "0.0 pipten itibaren", commission: "Lot başına, taraf başına $3.50", minDeposit: "$100" },
        { name: "Shares", spread: "Hisse başına komisyon, kaldıraç yok", commission: "Hisseye göre değişir", minDeposit: "$5" },
      ],
      deposits:
        "Kart ve e-cüzdan (Skrill, Neteller, WebMoney) yatırımları genellikle anında hesaba geçer; banka havaleleri 1-3 iş günü sürer. XM, yatırımlardan herhangi bir ücret almaz.",
      withdrawals:
        "Çekim taleplerinin çoğu 24 saat içinde işleme alınır — e-cüzdan ödemeleri genellikle aynı gün ulaşırken, kart ve banka çekimleri sağlayıcıya bağlı olarak yaklaşık 2-5 iş günü sürer. XM çekim ücreti almaz, ancak ödeme sağlayıcınız kendi ücretini uygulayabilir.",
      support:
        "28'den fazla dilde 7/24 canlı destek, telefon ve e-posta desteğinin yanı sıra kendi kendine hizmet veren bir yardım merkezi.",
      education:
        "23 dilde günlük canlı webinarlar, Tradepedia video kütüphanesi, interaktif ekonomik takvim ve XM Traders Club sadakat programı (Bronz'dan Elite'e kadar seviyeler, kapanan pozisyonlarda XM Coin kazanımı).",
    },
    promotion: {
      tag: "Aktif Kampanya",
      title: "XM Nakit İadesi Kampanyası — Şimdiye Kadar 17.369$ Ödendi",
      intro:
        "Aynı işlemler, aynı piyasa — ama neden nakit iadesi olmasın? XM Global'de FXPARTNER ortak kodu ile işlem yapan yatırımcılar bugüne kadar toplam 17.369$ nakit iadesi aldı. XM hesabın zaten varsa, avantajdan yararlanmak için mevcut hesabını kapatmana ya da işlemlerini değiştirmen gerekmiyor.",
      steps: [
        "FXPARTNER ortak kodu ile EK HESAP aç.",
        "İşlemlerine bu hesap üzerinden devam et.",
        "Hepsi bu — yaptığın işlemlerden nakit iadesi almaya başla.",
      ],
      note: "Kampanya koşulları değişebilir; güncel şartları katılmadan önce XM'in resmi sitesinden teyit edin. Yatırım yapmak risk içerir, sermayeniz risk altında olabilir.",
      image: "/campaigns/XM-nakit-iadesi-fxpartner.png",
      imageWidth: 1672,
      imageHeight: 941,
      ctaUrl: "https://bit.ly/xm-panel",
      ctaLabel: "XM Üye Paneline Giriş Yap",
    },
  },
  {
    rank: 4,
    slug: "bybit",
    name: "Bybit",
    logo: "/brokers/bybit logo.png",
    tagline: "MT5 üzerinden forex, kripto ve CFD işlemleri",
    rating: 4.5,
    founded: 2018,
    minDeposit: "$0",
    maxLeverage: "1:500",
    regulators: ["AFSA (Kazakistan)", "VARA (Dubai, ön lisans)", "MiCAR / FMA (Avusturya)"],
    platforms: ["MT5", "TradingView"],
    headquarters: "Dubai, BAE",
    referralUrl: "https://www.bybit.com/invite?ref=BVOJ8VL",
    summary:
      "Bybit, kripto borsası kökenli global bir platform olarak MetaTrader 5 üzerinden forex, kripto ve CFD işlemlerine erişim sunuyor. 400'den fazla enstrüman, 1:500'e varan kaldıraç ve EUR/USD'de ortalama 0,1 pip gibi düşük spread seçenekleriyle öne çıkıyor. FXPARTNER bağlantısıyla hesap açan kullanıcılar referral avantajlarından yararlanır.",
    pros: [
      "400'den fazla enstrümanla geniş forex/kripto/CFD yelpazesi",
      "EUR/USD'de ortalama 0,1 pip gibi düşük spread",
      "MT5 hesap açılışında minimum yatırım şartı yok",
      "1:500'e varan kaldıraç",
    ],
    cons: [
      "XM/AvaTrade gibi FCA, ASIC veya CySEC lisansı yok — regülasyonu AFSA (Kazakistan), VARA (Dubai, ön lisans) ve MiCAR (Avusturya) ile sınırlı",
      "CFD/MT5 ürünü 2024'te eklendi — forex tarafında XM kadar uzun bir geçmişi yok",
      "MT5 hesabına yalnızca USDT ile yatırım yapılabiliyor",
    ],
    bestFor: "Kripto ve forex'i tek platformda işlem yapmak isteyen yatırımcılar",
    accentNote: "Kripto + forex tek platformda",
    categories: ["Low Spread", "High Leverage"],
    scoreCost: 4,
    scoreWithdrawal: 3,
  },
  {
    rank: 5,
    slug: "avatrade",
    name: "AvaTrade",
    logo: "/brokers/avatrade.jpg",
    ogImage: "/brokers/avatrade-cover.png",
    adImage: "/campaigns/avatrade-reklam1.png",
    adImageWidth: 1672,
    adImageHeight: 941,
    tagline: "Kurumsal güven, geniş regülasyon kapsamı",
    rating: 4.5,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:400*",
    regulators: ["Central Bank of Ireland", "ASIC", "FSCA", "ADGM"],
    licenseNumbers: { ASIC: "406684", ADGM: "190018", FSCA: "45984" },
    platforms: ["MT4", "MT5", "AvaTradeGO", "WebTrader"],
    headquarters: "İrlanda",
    referralUrl: "https://tracking.avapartner.com/yRwAAA",
    summary:
      "AvaTrade, dünya çapında 9'dan fazla düzenleyici otorite altında faaliyet gösteren, kurumsal ölçekte bir brokerdır; sabit spread hesapları ve sosyal/kopya işlem altyapısı sunar. FXPARTNER üzerinden özel bonus kampanyalarına erişilebilir.",
    pros: [
      "9'dan fazla düzenleyici lisansla geniş güvenlik ağı",
      "FXPARTNER'a özel bonus kampanyaları",
      "Sabit ve değişken spread seçenekleri",
      "Kendi mobil platformu AvaTradeGO",
    ],
    cons: [
      "XM'e göre daha yüksek minimum yatırım",
      "Bazı hesap türlerinde işlem başına komisyon",
    ],
    bestFor: "Kurumsal güven ve kopya işlem arayan yatırımcılar",
    accentNote: "En çok düzenlenen",
    categories: ["Institutional Trust", "Multi-Platform"],
    scoreCost: 3,
    scoreWithdrawal: 3,
    scoreOverride: 9.0,
    extraFaqs: [
      {
        q: "AvaTrade güvenilir mi?",
        a: "AvaTrade, İrlanda Merkez Bankası ve ASIC dahil 9'dan fazla düzenleyici otorite altında faaliyet gösteren, kurumsal ölçekte bir brokerdır — incelediğimiz brokerler arasında en geniş düzenleyici kapsamına sahip olanlardan biridir. 2006'dan beri faaliyette olması ve sabit spread hesap seçenekleri sunması, kurumsal güven arayan yatırımcılar için tercih edilme nedenidir. Yine de güncel lisans durumunu ve bölgenizdeki erişilebilirliği AvaTrade'in resmi sitesinden teyit edin.",
      },
      {
        q: "AvaTrade'den nasıl para çekilir?",
        a: "AvaTrade, MT4, MT5, kendi AvaTradeGO uygulaması ve WebTrader üzerinden işlem sunar; çekim talepleri, düzenlenmiş bir broker olarak tabi olduğu yükümlülükler çerçevesinde işleme alınır. Bazı hesap türlerinde işlem başına komisyon uygulanabildiğinden, çekim öncesi net maliyeti ve süreyi hesap türünüze göre AvaTrade'in resmi sitesinden teyit etmenizi öneririz.",
      },
    ],
  },
  {
    rank: 7,
    slug: "tickmill",
    name: "Tickmill",
    logo: "/brokers/tickmill.webp",
    ogImage: "/brokers/tickmill-cover.png",
    tagline: "MetaTrader platformları ve düşük spreadler",
    rating: 4.5,
    founded: 2014,
    minDeposit: "$100",
    maxLeverage: "1:500*",
    regulators: ["FCA", "CySEC", "FSA (Seychelles)", "Labuan FSA"],
    licenseNumbers: { FCA: "717270", CySEC: "278/15", "Labuan FSA": "MB/18/0028" },
    platforms: ["MT4", "MT5"],
    headquarters: "Birleşik Krallık",
    referralUrl: "https://tickmill.link/4vvHCRK",
    partnerCode: "IB45254758",
    summary:
      "Tickmill, düşük maliyetli Pro hesapları, hoş geldin ve margin bonusları ile FCA dahil üst düzey düzenleyici desteğiyle maliyet odaklı yatırımcılara hitap eder. FXPARTNER VIP ortak kodu ile ek ayrıcalıklara erişilebilir.",
    pros: [
      "Pro hesaplarda düşük raw spread + komisyon",
      "Hoş geldin ve margin bonusları",
      "FCA dahil üst düzey düzenleyici lisanslar",
      "Hızlı ve şeffaf yatırma/çekme süreci",
    ],
    cons: [
      "Classic hesap türünde nispeten yüksek minimum yatırım",
      "Eğitim içeriği XM kadar kapsamlı değil",
    ],
    bestFor: "Maliyet odaklı, aktif yatırımcılar",
    accentNote: "En güçlü bonus programı",
    categories: ["Low Spread", "Institutional Trust"],
    scoreCost: 5,
    scoreWithdrawal: 4,
    extraFaqs: [
      {
        q: "Tickmill güvenilir mi?",
        a: "Tickmill, İngiltere'nin FCA'sı ve CySEC dahil düzenleyici lisanslara sahiptir; bu ikisi tier-1 otoritedir. 2014'ten beri faaliyette olan Tickmill, düşük maliyetli Pro hesapları ve hoş geldin/margin bonuslarıyla bilinir. Güncel lisans durumunu ve bölgenizdeki erişilebilirliği Tickmill'in resmi sitesinden teyit edin.",
      },
      {
        q: "Tickmill'den nasıl para çekilir?",
        a: "Tickmill, hızlı ve şeffaf bir yatırma/çekme süreci sunduğunu belirtir; FCA ve CySEC gibi düzenleyiciler altında faaliyet gösterdiği için çekim taleplerini gereksiz gecikme olmadan işleme alma yükümlülüğü altındadır. Kesin süreler hesap türüne göre değişebileceğinden güncel bilgiyi resmi siteden teyit edin.",
      },
    ],
  },
  {
    rank: 2,
    slug: "lite-finance",
    name: "Lite Finance",
    logo: "/brokers/litefinance-icon.png",
    ogImage: "/brokers/lite-finance-cover.png",
    adImage: "/campaigns/litefinance-reklam-1.png",
    adImageWidth: 1672,
    adImageHeight: 941,
    tagline: "1:1000'e kadar seçilebilir kaldıraç",
    rating: 4.5,
    founded: 2005,
    minDeposit: "$10",
    maxLeverage: "1:1000*",
    regulators: ["Offshore license"],
    platforms: ["MT4", "MT5", "LiteFinance WebTerminal"],
    headquarters: "Kıbrıs",
    referralUrl: "https://litefinance-tr.org/?uid=667827970",
    summary:
      "Lite Finance, cent hesaplar, yüksek kaldıraç seçenekleri ve düşük minimum yatırım tutarı sayesinde küçük bir sermayeyle başlamak isteyen yatırımcılar arasında popülerdir. FXPARTNER'a özel bonus ve promosyonlara erişilebilir.",
    pros: [
      "10 dolar gibi düşük bir tutarla hesap açma",
      "FXPARTNER'a özel bonus ve promosyonlar",
      "Düşük riskli pratik için cent hesap seçeneği",
      "Basit ve hızlı hesap açma süreci",
    ],
    cons: [
      "Kurumsal yatırımcı içeriği XM/AvaTrade kadar kapsamlı değil",
    ],
    bestFor: "Küçük sermayeyle başlayan bireysel yatırımcılar",
    accentNote: "En düşük giriş bariyeri",
    categories: ["Beginners"],
    scoreCost: 4,
    scoreWithdrawal: 3,
    scoreRegulationOverride: 3,
    scoreOverride: 9.1,
    extraFaqs: [
      {
        q: "Lite Finance güvenilir mi?",
        a: "Lite Finance, 2005'ten beri faaliyette olan ve düşük başlangıç bariyeriyle (10 dolar gibi düşük bir minimum yatırımla) bilinen bir brokerdir. Düzenleme durumu offshore bir lisansa dayanır — FCA, ASIC veya CySEC gibi tier-1 bir otorite altında değildir; bu, düşük başlangıç maliyeti sunarken düzenleyici koruma açısından daha zayıf bir güvenlik ağı anlamına gelir. Lite Finance'in Türkiye'ye özel bir destek hattı (turkiye@litefinance.com) bulunur. Hesap açmadan önce güncel lisans durumunu brokerin resmi sitesinden teyit etmenizi öneririz.",
      },
      {
        q: "Lite Finance'ten nasıl para çekilir?",
        a: "Lite Finance, MT4, MT5 ve kendi WebTerminal platformu üzerinden işlem yapılmasına imkan tanır; çekim talepleri genellikle hesap doğrulaması tamamlandıktan sonra, yatırılan yönteme işlenir. Offshore bir lisansa dayandığı için, çekim süreleri ve olası ücretler konusunda tier-1 düzenlenmiş brokerlere kıyasla daha az standart bir çerçeve söz konusu olabilir — güncel çekim süre ve koşullarını hesap açmadan önce Lite Finance'in resmi sitesinden veya Türkçe destek hattından teyit edin.",
      },
    ],
    promotion: {
      tag: "Aktif Kampanya",
      title: "Arkadaşını Davet Et, 50$ Kazan",
      intro:
        "Lite Finance'in arkadaşını davet et kampanyası FXPARTNER müşterileri için aktif: bir arkadaşını davet et, ikiniz de ödüllendirilin.",
      steps: [
        "Kendi hesabını doğrula ve en az 100$ yatır.",
        "Kişisel referans linkini oluştur ve bir arkadaşınla paylaş.",
        "Arkadaşın senin linkin üzerinden kaydolsun ve 7 gün içinde 250$+ yatırıp promosyon kodunu uygulayarak %100 yatırım bonusu talep etsin.",
        "Arkadaşın en az 1 lot işlem tamamladığında, hesabına 50$ yatırılır.",
      ],
      note: "Kampanya koşulları geçerlidir ve değişikliğe tabidir; Lite Finance, koşul ihlallerinde ödülleri iptal etme hakkını saklı tutar. Katılmadan önce güncel koşulları Lite Finance'in resmi sitesinden teyit edin.",
      contactEmail: "turkiye@litefinance.com",
    },
  },
  {
    rank: 8,
    slug: "exness",
    name: "EXNESS",
    logo: "/brokers/exness.png",
    ogImage: "/brokers/exness-cover.png",
    tagline: "Sıfıra yakın spreadler ve anında para çekme",
    rating: 4.3,
    founded: 2008,
    minDeposit: "$10",
    maxLeverage: "Unlimited*",
    regulators: ["FCA", "CySEC", "FSCA", "FSC (Mauritius)"],
    licenseNumbers: { FCA: "730729", CySEC: "178/12", FSCA: "51024" },
    platforms: ["MT4", "MT5", "Exness Terminal"],
    headquarters: "Kıbrıs",
    referralUrl: "https://one.exnessonelink.com/a/nt8xpejsow",
    partnerCode: "nt8xpejsow",
    summary:
      "Exness, anlık çekim süreleri, sıfıra yakın spread seçenekleri ve sınırsıza kadar çıkabilen esnek kaldıracı sayesinde aktif yatırımcılar arasında öne çıkar. FXPARTNER ortak kodu ile açılan hesaplar özel ayrıcalıklara erişir.",
    pros: [
      "Anlık/otomatik çekim işlemesi",
      "Bazı hesap türlerinde neredeyse sınırsız kaldıraç",
      "10 dolarlık minimum yatırımla düşük giriş bariyeri",
      "FXPARTNER ayrıcalıklarına erişim",
    ],
    cons: [
      "Çok yüksek kaldıraç deneyimsiz yatırımcılar için risklidir",
      "Hesap türü çeşitliliği ilk bakışta kafa karıştırıcı olabilir",
    ],
    bestFor: "Yüksek işlem hacmine sahip deneyimli yatırımcılar",
    accentNote: "En hızlı çekim vurgusu",
    categories: ["High Leverage", "Low Spread"],
    scoreCost: 5,
    scoreWithdrawal: 5,
    scoreOverride: 8.2,
    extraFaqs: [
      {
        q: "Exness güvenilir mi?",
        a: "Exness, İngiltere'nin FCA'sı ve CySEC dahil 4 düzenleyici lisansına sahiptir; FCA ve CySEC tier-1 otoritedir. 2008'den beri faaliyette olan Exness, aktif traderlar arasında anlık çekim süreleri ve düşük spread seçenekleriyle tanınır. Yüksek/sınırsız kaldıraç seçenekleri deneyimsiz yatırımcılar için risklidir — güncel lisans durumunu resmi siteden teyit edin.",
      },
      {
        q: "Exness'ten nasıl para çekilir?",
        a: "Exness, çekim işlemlerini anlık/otomatik olarak işlediğini belirtir — bu, brokerin öne çıkan özelliklerinden biridir. Hesap türü çeşitliliği ilk bakışta kafa karıştırıcı olabileceğinden, çekim yöntemi ve süresiyle ilgili güncel detayları hesap açmadan önce Exness'in resmi sitesinden teyit etmenizi öneririz.",
      },
    ],
  },
  {
    rank: 12,
    slug: "markets-com",
    name: "markets.com",
    logo: "/brokers/markets-com.png",
    tagline: "Web, mobil, MT4 ve MT5 platform seçenekleri",
    rating: 4.0,
    founded: 2008,
    minDeposit: "$100",
    maxLeverage: "1:300*",
    regulators: ["CySEC", "FSC (BVI)"],
    licenseNumbers: { CySEC: "092/08", "FSC (BVI)": "SIBA/L/14/1067" },
    platforms: ["Marketsx (Web)", "Mobile", "MT4", "MT5"],
    headquarters: "Kıbrıs / BVI",
    referralUrl: "https://refer.markets.com/2R72MI",
    partnerCode: "2R72MI",
    summary:
      "markets.com, kendi Marketsx platformunu web, mobil ve MetaTrader seçenekleriyle tek bir noktada birleştiren köklü bir brokerdır. FXPARTNER ortak kodu ile özel ayrıcalıklara erişilebilir.",
    pros: [
      "Kendi Marketsx web platformu",
      "FXPARTNER ortak kodu ile özel ayrıcalıklar",
      "MT4/MT5 ve mobil uygulama desteği",
      "Geniş enstrüman yelpazesi (forex, hisse senedi, emtia, endeks)",
    ],
    cons: [
      "Diğer brokerlere kıyasla daha dar tier-1 düzenleyici kapsamı",
      "Bazı bölgelerde hizmet kısıtlı olabilir",
    ],
    bestFor: "Kendi platformunu tercih eden çok yönlü yatırımcılar",
    accentNote: "En çok yönlü platform",
    categories: ["Multi-Platform"],
    scoreCost: 3,
    scoreWithdrawal: 3,
    extraFaqs: [
      {
        q: "markets.com güvenilir mi?",
        a: "markets.com, CySEC (tier-1) ve FSC (BVI, offshore) altında lisanslıdır — diğer incelediğimiz brokerlere kıyasla daha dar bir tier-1 düzenleyici kapsamına sahiptir ve hizmet bazı bölgelerde kısıtlı olabilir. 2008'den beri faaliyette olan marka, kendi Marketsx platformunu MT4/MT5 ile birleştirir. Bölgenizdeki erişilebilirliği ve güncel lisans durumunu resmi siteden teyit edin.",
      },
      {
        q: "markets.com'dan nasıl para çekilir?",
        a: "markets.com, Marketsx web platformu, mobil uygulama ve MT4/MT5 üzerinden hesap yönetimine izin verir. Çekim yöntemi ve süresi hesap türü ve bölgeye göre değişebileceğinden, güncel bilgiyi markets.com'un resmi sitesinden teyit etmenizi öneririz.",
      },
    ],
  },
  {
    rank: 3,
    slug: "fxpro",
    name: "FxPro",
    logo: "/brokers/fxpro.png",
    adImage: "/campaigns/fxpro-100bonus-reklam.png",
    adImageWidth: 1672,
    adImageHeight: 941,
    tagline: "MT4, MT5 ve FxPro App üzerinden işlem yapın",
    rating: 4.6,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:2000*",
    regulators: ["FCA", "CySEC", "FSCA", "SCB (Bahamas)"],
    licenseNumbers: { FCA: "509956", CySEC: "078/07", FSCA: "45052", "SCB (Bahamas)": "SIA-F184" },
    platforms: ["MT4", "MT5", "cTrader", "FxPro App"],
    headquarters: "Birleşik Krallık / Kıbrıs",
    referralUrl: "https://redirect-fxpro.com/tr/partner/ipw6XC8L",
    partnerCode: "ipw6XC8L",
    summary:
      "FxPro, FCA dahil üst düzey düzenleyici lisanslara, geniş platform desteğine (MT4, MT5, cTrader, FxPro App) ve bazı hesap türlerinde 1:2000'e varan kaldıraca sahip köklü bir brokerdır.",
    pros: [
      "FCA dahil üst düzey düzenleyici lisanslar",
      "MT4/MT5/cTrader/FxPro App genelinde geniş platform desteği",
      "Bazı hesaplarda 1:2000'e varan kaldıraç",
      "20 yılı aşkın sektör deneyimi",
    ],
    cons: [
      "Bazı hesap türlerinde komisyon yapısı karmaşık olabilir",
    ],
    bestFor: "Yüksek kaldıraç ve çoklu platform arayan deneyimli yatırımcılar",
    accentNote: "Üst düzey düzenlenmiş, yüksek kaldıraç",
    categories: ["High Leverage", "Institutional Trust"],
    scoreCost: 3,
    scoreWithdrawal: 3,
    scoreOverride: 9.3,
    extraFaqs: [
      {
        q: "FxPro güvenilir mi?",
        a: "FxPro, İngiltere'nin FCA'sı dahil 4 farklı düzenleyici lisansına (FCA, CySEC, FSCA, SCB Bahamas) sahiptir; FCA, en sıkı denetim ve müşteri fonu ayrıştırma şartlarını arayan tier-1 otoritelerden biridir. 2006'dan beri faaliyette olan FxPro, 20 yılı aşkın sektör geçmişine sahiptir. Yine de her broker gibi, güncel lisans durumunu ve Türkiye'den erişilebilirliğini FxPro'nun resmi sitesinden teyit etmenizi öneririz.",
      },
      {
        q: "FxPro'dan nasıl para çekilir?",
        a: "FxPro, FCA ve CySEC gibi düzenleyiciler altında faaliyet gösterdiği için, müşteri talep ettiğinde çekim işlemlerini gereksiz gecikme olmadan işleme alma yükümlülüğü altındadır. Kesin çekim süreleri ve yöntemleri (e-cüzdan, kart, banka havalesi) hesap türüne ve bölgeye göre değişebileceğinden, güncel bilgiyi FxPro'nun resmi sitesinden veya müşteri destek ekibinden teyit etmenizi öneririz.",
      },
    ],
    promotion: {
      tag: "Yeni Hesap Fırsatı",
      title: "%100 Hoş Geldin Bonusu",
      intro:
        "FxPro, FXPARTNER referans linki üzerinden açılan yeni hesaplar için %100 hoş geldin bonusu sunuyor — ilk yatırımlar için güçlü bir başlangıç.",
      steps: [
        "FXPARTNER referans linki üzerinden yeni bir FxPro hesabı aç.",
        "Uygun bir ilk yatırım yap.",
        "Bonusun hesabına uygulandığını teyit et — kesin oran ve uygunluk hesap türüne ve bölgeye göre değişir.",
      ],
      note: "Bonus şart ve koşulları geçerlidir ve önceden haber verilmeksizin değişebilir; canlı hesabına para yatırmadan önce güncel uygunluğu FxPro'nun resmi sitesinden teyit edin. İşlem yapmak zarar riski içerir.",
    },
  },
  {
    rank: 13,
    slug: "versus-trade",
    name: "Versus Trade",
    logo: "/brokers/versus-trade.jpg",
    tagline: "MetaTrader 5 üzerinde yüksek kaldıraçlı CFD işlemleri",
    rating: 3.0,
    founded: 2024,
    minDeposit: "$10",
    maxLeverage: "1:2000*",
    regulators: ["FSC (Mauritius)"],
    platforms: ["MT5"],
    headquarters: "Saint Lucia",
    referralUrl: "https://one.versustrade.link/links/go/48280?pid=98691",
    summary:
      "Versus Trade, 2024'te kurulan, MetaTrader 5 altyapısı ve kendi 'Versus Pairs' ürünüyle dikkat çeken yeni nesil bir CFD brokerıdır. Mauritius FSC lisansı altında faaliyet gösterir; hesaplar FXPARTNER ortak kodu ile açılabilir.",
    pros: [
      "10 dolarlık düşük minimum yatırım",
      "1:2000'e varan yüksek kaldıraç",
      "MetaTrader 5'te hızlı ECN/STP emir gerçekleştirme",
      "Benzersiz 'Versus Pairs' işlem ürünü",
    ],
    cons: [
      "2024'te kurulan, kısa bir faaliyet geçmişi",
      "Yalnızca offshore (Mauritius FSC) lisans, tier-1 düzenleme yok",
      "Bazı kullanıcı yorumları çekim/kâr iptali şikayetleri bildiriyor",
      "Yalnızca MT5 sunuyor, MT4 desteği yok",
    ],
    bestFor: "Yüksek kaldıraç arayan, riskin farkında deneyimli yatırımcılar",
    accentNote: "En yeni nesil platform",
    categories: ["High Leverage"],
    scoreCost: 3,
    scoreWithdrawal: 2,
    scoreOverride: 5.2,
    extraFaqs: [
      {
        q: "Versus Trade güvenilir mi?",
        a: "Versus Trade, 2024'te kurulan, kısa bir faaliyet geçmişine sahip ve yalnızca offshore bir lisansa (Mauritius FSC) dayanan bir brokerdır — FCA, ASIC veya CySEC gibi tier-1 bir düzenleyici altında değildir. Bazı kullanıcı yorumları çekim ve kâr iptali ile ilgili şikayetler bildirmektedir. Yüksek kaldıraç (1:2000'e kadar) ve kısa kurumsal geçmiş, dikkatli değerlendirilmesi gereken risk faktörleridir.",
      },
      {
        q: "Versus Trade'den nasıl para çekilir?",
        a: "Versus Trade yalnızca MT5 üzerinden işlem sunar. Bazı kullanıcı yorumlarında çekim taleplerinin reddedilmesi veya kâr iptaliyle ilgili şikayetler bildirilmiştir — hesap açmadan önce bu geri bildirimleri bağımsız inceleme kaynaklarında araştırmanızı ve küçük bir tutarla test etmenizi öneririz.",
      },
    ],
  },
  {
    rank: 10,
    slug: "thinkmarkets",
    name: "ThinkMarkets",
    logo: "/brokers/thinkmarkets.jpg",
    tagline: "MT4, MT5 ve ThinkTrader üzerinden 4.000+ enstrüman",
    rating: 4.4,
    founded: 2010,
    minDeposit: "$0",
    maxLeverage: "1:500*",
    regulators: ["FCA", "ASIC", "CySEC", "FSCA"],
    licenseNumbers: { ASIC: "424700", FCA: "629628", CySEC: "215/13", FSCA: "49835" },
    platforms: ["MT4", "MT5", "ThinkTrader"],
    headquarters: "London / Melbourne",
    referralUrl:
      "https://www.welcome-partner.thinkmarkets.com/?cid=0&pid=290469&type=1&redirecturl=https://portal.thinkmarkets.com/account/individual",
    summary:
      "ThinkMarkets; FCA, ASIC ve CySEC dahil güçlü çoklu düzenleyici lisansa, Standard hesapta 0 dolar minimum yatırıma ve kendi ThinkTrader platformu üzerinden 4.000'den fazla enstrümana erişime sahip köklü bir brokerdır. Hesaplar FXPARTNER ortak kodu ile açılabilir.",
    pros: [
      "FCA, ASIC ve CySEC dahil güçlü çoklu düzenleyici lisans",
      "Standard hesapta 0 dolar minimum yatırım",
      "4.000'den fazla enstrümanla geniş ürün yelpazesi",
      "ThinkTrader'da bulut tabanlı uyarılar ve özel göstergeler",
    ],
    cons: [
      "Standard/ThinkZero/ThinkTrader hesap seçenekleri yeni başlayanlar için kafa karıştırıcı olabilir",
      "Cent/mikro hesap seçeneği yok; aylık 20 dolarlık hareketsizlik ücreti uygulanabilir",
    ],
    bestFor: "Güçlü düzenleme ve geniş enstrüman yelpazesi arayan deneyimli yatırımcılar",
    accentNote: "En geniş enstrüman yelpazesi",
    categories: ["Institutional Trust", "Multi-Platform"],
    scoreCost: 4,
    scoreWithdrawal: 3,
    extraFaqs: [
      {
        q: "ThinkMarkets güvenilir mi?",
        a: "ThinkMarkets, FCA, ASIC ve CySEC dahil güçlü çoklu düzenleyici lisansa sahiptir — üçü de tier-1 otoritedir. 2010'dan beri faaliyette olan ThinkMarkets, Standard hesapta 0 dolar minimum yatırım ve kendi ThinkTrader platformuyla öne çıkar. Güncel lisans durumunu ve bölgenizdeki erişilebilirliği resmi siteden teyit edin.",
      },
      {
        q: "ThinkMarkets'ten nasıl para çekilir?",
        a: "ThinkMarkets, FCA/ASIC/CySEC gibi düzenleyiciler altında faaliyet gösterdiği için çekim taleplerini gereksiz gecikme olmadan işleme alma yükümlülüğü altındadır. Cent/mikro hesap seçeneği yoktur ve aylık 20 dolarlık bir hareketsizlik ücreti uygulanabilir — çekim öncesi güncel şart ve süreleri resmi siteden teyit edin.",
      },
    ],
  },
  {
    rank: 11,
    slug: "easymarkets",
    name: "easyMarkets",
    logo: "/brokers/easymarkets-logo.jpg",
    tagline: "Sabit spreadler ve garantili risk yönetimi araçları",
    rating: 4.2,
    founded: 2001,
    minDeposit: "$25",
    maxLeverage: "1:2000*",
    regulators: ["CySEC", "ASIC", "FSA (Seychelles)", "FSC (BVI)", "FSCA"],
    platforms: ["MT4", "MT5", "easyMarkets App"],
    headquarters: "Limasol, Kıbrıs",
    referralUrl: "https://lnd.easy-markets.com/int/en/refer-a-friend/?ref_id=8433E3",
    summary:
      "easyMarkets, 2001'den beri faaliyette olan ve CySEC ile ASIC dahil 5 düzenleyici lisansına sahip köklü bir brokerdır. Sektörde nadir görülen garanti stop-loss ve garanti negatif bakiye koruması sunar. Hesaplar FXPARTNER ortak kodu ile açılabilir.",
    pros: [
      "2001'den beri faaliyette, 20 yılı aşkın sektör deneyimi",
      "CySEC ve ASIC dahil 5 düzenleyici lisans",
      "Garanti Stop-Loss ve garanti negatif bakiye koruması",
      "25 dolarlık düşük minimum yatırım",
    ],
    cons: [
      "En düşük spread'ler için Premium/VIP hesaplarda 2.000-10.000 dolar minimum yatırım gerekir",
      "Kendi platformunda otomatik (EA) işlem veya üçüncü taraf eklenti desteği yok",
    ],
    bestFor: "Sabit spread ve garanti risk yönetimi araçları arayan yeni başlayanlar",
    accentNote: "En güvenli risk yönetimi araçları",
    categories: ["Beginners", "Institutional Trust"],
    scoreCost: 3,
    scoreWithdrawal: 3,
    extraFaqs: [
      {
        q: "easyMarkets güvenilir mi?",
        a: "easyMarkets, CySEC ve ASIC dahil 5 düzenleyici lisansına sahiptir; ikisi de tier-1 otoritedir. 2001'den beri faaliyette olması, sektördeki en uzun geçmişe sahip brokerlerden biri yapar. Garanti stop-loss ve garanti negatif bakiye koruması gibi sektörde nadir görülen risk yönetimi araçları sunar. Güncel lisans durumunu resmi siteden teyit edin.",
      },
      {
        q: "easyMarkets'ten nasıl para çekilir?",
        a: "easyMarkets, düzenlenmiş bir broker olarak çekim taleplerini gereksiz gecikme olmadan işleme alma yükümlülüğü altındadır. En düşük spread'lere erişim için Premium/VIP hesaplarda 2.000-10.000 dolar minimum yatırım gerektiğini unutmayın — çekim süre ve yöntemlerini hesap türünüze göre resmi siteden teyit edin.",
      },
    ],
  },
  {
    rank: 6,
    slug: "ic-markets",
    name: "IC Markets",
    logo: "/brokers/ic-markets.png",
    ogImage: "/brokers/ic-markets-cover.png",
    tagline: "Ham ECN spreadler ve TradingView entegrasyonu",
    rating: 4.7,
    founded: 2007,
    minDeposit: "$200",
    maxLeverage: "1:500*",
    regulators: ["ASIC", "CySEC", "FSA (Seychelles)"],
    licenseNumbers: { ASIC: "335692", CySEC: "362/18", "FSA (Seychelles)": "SD018" },
    platforms: ["MT4", "MT5", "cTrader", "TradingView"],
    headquarters: "Sydney, Avustralya",
    referralUrl: "https://ic.com/?camp=69888",
    summary:
      "IC Markets (IC olarak yeniden markalandı), 2007'den beri faaliyette olan, raw ECN spread'lerde sektör lideri olarak kabul edilen ve ASIC ile CySEC dahil güçlü çoklu düzenleyici lisansa sahip köklü bir brokerdır. Hesaplar FXPARTNER ortak kodu ile açılabilir.",
    pros: [
      "2007'den beri faaliyette, raw ECN spread'lerde sektör lideri",
      "ASIC, CySEC ve FSA dahil güçlü çoklu düzenleyici lisans",
      "MT4/MT5/cTrader/TradingView genelinde geniş platform desteği",
      "55.000'den fazla bağımsız müşteri yorumundan 4.8/5 puan",
    ],
    cons: [
      "200 dolarlık minimum yatırım, düşük bariyerli brokerlere kıyasla yüksek",
      "2024'te kaldıraç limiti ve maliyet şeffaflığı ihlalleri nedeniyle CySEC tarafından toplam 250.000 Euro cezaya çarptırıldı",
    ],
    bestFor: "Raw spread ve kurumsal düzeyde gerçekleştirme arayan deneyimli/algoritmik yatırımcılar",
    accentNote: "En düşük raw spread'ler",
    categories: ["Low Spread", "Institutional Trust"],
    scoreCost: 5,
    scoreWithdrawal: 4,
    extraFaqs: [
      {
        q: "IC Markets güvenilir mi?",
        a: "IC Markets, 2007'den beri faaliyette olan ve ASIC, CySEC ile FSA (Seyşeller) altında lisanslı bir brokerdır — ASIC ve CySEC tier-1 otoritelerdir. Şeffaflık adına belirtmek gerekir: IC Markets, 2024'te CySEC tarafından kaldıraç limiti ve maliyet şeffaflığı ihlalleri nedeniyle toplam 250.000 Euro para cezasına çarptırılmıştır — bu, düzenleyicinin aktif denetim yaptığının bir göstergesi olsa da, hesap açmadan önce bilinmesi gereken bir husustur. Güncel lisans ve uyum durumunu IC Markets'in resmi sitesinden teyit edin.",
      },
      {
        q: "IC Markets'ten nasıl para çekilir?",
        a: "IC Markets, MT4, MT5, cTrader ve TradingView entegrasyonu üzerinden işlem sunar; 55.000'den fazla bağımsız müşteri yorumunda 4.8/5 puana sahiptir, bu da genel kullanıcı memnuniyetine dair bir sinyaldir. Çekim süreleri ve yöntemleri hesap türüne göre değişebileceğinden, güncel bilgiyi IC Markets'in resmi sitesinden teyit etmenizi öneririz.",
      },
    ],
  },
  {
    rank: 14,
    slug: "lhfx",
    name: "LHFX",
    logo: "/brokers/lhfx.png",
    tagline: "Düşük giriş bariyerli MT5 işlemleri, ücretsiz yatırma/çekme",
    rating: 2.8,
    founded: 2020,
    minDeposit: "$10",
    maxLeverage: "1:500*",
    regulators: ["FSC (Mauritius)", "FSCA"],
    platforms: ["MT5"],
    headquarters: "Port Louis, Morityus",
    referralUrl: "https://lhfx.com/signup?ref=1543",
    summary:
      "LHFX (eski adıyla LonghornFX), 2025'te yeniden markalanan, yalnızca offshore lisanslara (FSC Mauritius ve FSCA) sahip bir CFD brokerıdır. Bağımsız incelemeler yatırma/çekme kolaylığını olumlu bulsa da slippage ve çekim gecikmeleriyle ilgili şikayetler de bildirilmektedir; hesap açmadan önce bu riskleri değerlendirmenizi öneririz.",
    pros: [
      "10 dolarlık düşük minimum yatırım",
      "Yatırma/çekme işlemlerinde ekstra ücret yok",
      "Scalping, hedging ve EA (algoritmik) işleme izin verir",
    ],
    cons: [
      "Yalnızca offshore (FSC Mauritius + FSCA) lisanslar, tier-1 düzenleme yok",
      "2025'te LonghornFX'ten LHFX'e yeniden markalandı; kısa ve karışık bir kurumsal geçmiş",
      "Bağımsız incelemeler slippage/emir manipülasyonu iddiaları, çekim gecikmeleri ve bonus reklamcılığıyla ilgili şikayetler bildiriyor",
    ],
    bestFor: "Düşük giriş bariyeri arayan, riskin farkında yatırımcılar",
    accentNote: "Ücretsiz yatırma/çekme",
    categories: [],
    scoreCost: 3,
    scoreWithdrawal: 2,
    extraFaqs: [
      {
        q: "LHFX güvenilir mi?",
        a: "LHFX (2025'te LonghornFX'ten yeniden markalandı), yalnızca offshore lisanslara (FSC Mauritius ve FSCA) sahiptir — FCA, ASIC veya CySEC gibi bir tier-1 otorite altında değildir. Bağımsız incelemeler yatırma/çekme kolaylığını olumlu bulsa da, slippage ve çekim gecikmeleriyle ilgili şikayetler de bildirilmektedir. Hesap açmadan önce bu riskleri dikkatle değerlendirmenizi öneririz.",
      },
      {
        q: "LHFX'ten nasıl para çekilir?",
        a: "LHFX, yatırma/çekme işlemlerinde ekstra ücret almadığını belirtir. Ancak bağımsız inceleme kaynakları çekim gecikmeleri ve bonus reklamcılığıyla ilgili şikayetler bildirmektedir — offshore-only lisans yapısı göz önüne alındığında, çekim öncesi güncel kullanıcı deneyimlerini bağımsız kaynaklardan araştırmanızı öneririz.",
      },
    ],
  },
  {
    rank: 15,
    slug: "exclusive-markets",
    name: "Exclusive Markets",
    logo: "/brokers/exclusive-markets.svg",
    tagline: "MT4/MT5 üzerinden yüksek kaldıraçlı offshore CFD işlemleri",
    rating: 2.0,
    founded: 2017,
    minDeposit: "From $10*",
    maxLeverage: "1:4000*",
    regulators: ["FSA (Seychelles)", "FSCA"],
    platforms: ["MT4", "MT5"],
    headquarters: "Mahé, Seyşeller",
    referralUrl: "http://www.exclusivemarkets.com/register?ib=12214908",
    summary:
      "Exclusive Markets, 2017'de kurulan, yalnızca offshore lisanslara (FSA Seyşeller ve FSCA) sahip bir CFD brokerıdır. Bağımsız inceleme kaynakları düşük bir güven skoru ve tekrar eden çekim şikayetleri bildirmektedir; hesap açmadan önce bu riskleri dikkatle değerlendirmenizi öneririz.",
    pros: [
      "1:4000'e varan yüksek kaldıraç",
      "5.000'den fazla enstrümanla geniş ürün yelpazesi",
      "MT4/MT5 desteği",
    ],
    cons: [
      "Yalnızca offshore (FSA Seyşeller + FSCA) lisanslar, tier-1 düzenleme yok",
      "Bağımsız bir saha araştırması, ilan edilen Kıbrıs/Seyşeller adreslerinde fiziksel bir varlık doğrulayamadı",
      "Bağımsız inceleme siteleri çok düşük bir güven skoru ve tekrar eden çekim/donmuş bakiye şikayetleri bildiriyor",
    ],
    bestFor: "Riski tamamen kabul eden, yüksek kaldıraç arayan deneyimli yatırımcılar",
    accentNote: "Yüksek kaldıraç seçeneği",
    categories: ["High Leverage"],
    scoreCost: 3,
    scoreWithdrawal: 1,
    extraFaqs: [
      {
        q: "Exclusive Markets güvenilir mi?",
        a: "Hayır, dikkatli olunması gereken bir brokerdır: Exclusive Markets yalnızca offshore lisanslara (FSA Seyşeller ve FSCA) sahiptir, tier-1 bir düzenleyici altında değildir. Bağımsız inceleme kaynakları çok düşük bir güven skoru ve tekrar eden çekim/donmuş bakiye şikayetleri bildirmektedir; ayrıca bağımsız bir saha araştırması, ilan edilen Kıbrıs/Seyşeller adreslerinde fiziksel bir varlık doğrulayamamıştır. Bu riskleri hesap açmadan önce dikkatle değerlendirmenizi öneririz.",
      },
      {
        q: "Exclusive Markets'ten nasıl para çekilir?",
        a: "Bağımsız inceleme sitelerinde Exclusive Markets için tekrar eden çekim ve donmuş bakiye şikayetleri bildirilmektedir — bu, brokerin çekim güvenilirliği açısından en düşük puan aldığımız kategorilerden biridir. Hesap açmayı düşünüyorsanız, küçük bir tutarla başlamanızı ve bir çekim talebinin gerçekten sorunsuz işlendiğini kendiniz test etmenizi öneririz.",
      },
    ],
  },
  {
    rank: 16,
    slug: "tradingpro",
    name: "TradingPRO",
    logo: "/brokers/tradingpro.png",
    tagline: "MT4, MT5 ve cTrader üzerinden çoklu varlık CFD işlemleri",
    rating: 1.8,
    founded: 2017,
    minDeposit: "$1",
    maxLeverage: "1:2000*",
    regulators: ["FSCA", "FSC (Mauritius)"],
    platforms: ["MT4", "MT5", "cTrader"],
    headquarters: "Saint Vincent ve Grenadinler / Morityus",
    referralUrl: "https://secure.trading-pro.app/links/go/22409",
    partnerCode: "FXPARTNER",
    summary:
      "TradingPRO, 1:2000'e varan kaldıraç ve 1 dolarlık minimum yatırımla forex, endeks, emtia ve kripto işlemi sunan bir CFD brokerıdır. Offshore lisanslara (FSCA Güney Afrika, FSC Mauritius) sahiptir ancak tier-1 düzenlemesi yoktur ve 2025 ortasında İngiltere FCA'sının yetkisiz firma uyarı listesine alınmıştır.",
    pros: [
      "1 dolarlık çok düşük minimum yatırım",
      "1:2000'e varan yüksek kaldıraç",
      "MT4, MT5 ve cTrader platform desteği",
      "Forex, endeks, emtia ve kripto CFD'leri dahil geniş enstrüman yelpazesi",
    ],
    cons: [
      "Yalnızca offshore (FSCA + FSC Mauritius) lisanslar, tier-1 düzenleme yok",
      "İngiltere FCA yetkisiz firma uyarı listesinde yer alıyor (Haziran 2025)",
      "Bağımsız inceleme siteleri açık bir 'uzak durun' uyarısıyla birlikte çok düşük güven skoru ve belgelenmiş birden fazla çekim gecikmesi/reddi şikayeti bildiriyor",
    ],
    bestFor: "Riski tamamen kabul eden, çok düşük giriş eşiği isteyen deneyimli, riskin farkında yatırımcılar",
    accentNote: "En düşük minimum yatırım",
    categories: ["High Leverage"],
    scoreCost: 3,
    scoreWithdrawal: 1,
    scoreRegulationOverride: 1,
    scoreOverride: 3.8,
    extraFaqs: [
      {
        q: "TradingPRO güvenilir mi?",
        a: "Hayır — TradingPRO, incelediğimiz brokerler arasında en düşük güven puanına sahip olanlardan biridir. Yalnızca offshore lisanslara (FSCA ve FSC Mauritius) sahiptir ve Haziran 2025'te İngiltere'nin FCA'sı tarafından yetkisiz firma uyarı listesine alınmıştır. Bağımsız inceleme siteleri açıkça \"uzak durun\" uyarısıyla birlikte çok düşük bir güven skoru ve belgelenmiş çekim gecikmesi/reddi şikayetleri bildirmektedir. Hesap açmadan önce bu uyarıları ciddiye almanızı öneririz.",
      },
      {
        q: "TradingPRO'dan nasıl para çekilir?",
        a: "Bağımsız inceleme kaynakları TradingPRO için birden fazla belgelenmiş çekim gecikmesi/reddi şikayeti bildirmektedir, üstelik firma İngiltere FCA'sının yetkisiz firma uyarı listesinde yer almaktadır. Bu sinyaller göz önüne alındığında, TradingPRO'ya para yatırmadan önce güncel düzenleyici durumunu ve bağımsız kullanıcı deneyimlerini dikkatle araştırmanızı öneririz.",
      },
    ],
  },
  {
    rank: 9,
    slug: "fxt",
    name: "FXT",
    logo: "/brokers/fxt.svg",
    tagline: "MT4, MT5 ve FXT App üzerinden ASIC regüleli çoklu platform işlemleri",
    rating: 4.3,
    founded: 2014,
    minDeposit: "$50",
    maxLeverage: "1:2000*",
    regulators: ["ASIC", "VFSC (Vanuatu)"],
    platforms: ["MT4", "MT5", "WebTrader", "FXT App"],
    headquarters: "Avustralya",
    referralUrl: "https://my.fxtrading.com/new_api/prom/a/Qu3nwT2Y",
    partnerCode: "FXPARTNER",
    summary:
      "FXT (FXTrading.com), 2014'ten beri Avustralya'nın ASIC'inden bir Market Making lisansı ve offshore bir VFSC (Vanuatu) lisansı altında faaliyet gösteren bir brokerdır. Yargı bölgesine göre 1:2000'e varan kaldıraçla Standard'dan Raw Spread'e kadar beş hesap türü sunar. Hesaplar FXPARTNER ortak kodu ile açılabilir.",
    pros: [
      "Offshore VFSC lisansının yanında tier-1 ASIC (Avustralya) düzenlemesi",
      "2014'ten beri faaliyette, çoğu offshore-only brokere kıyasla daha güçlü bağımsız güven skoru",
      "Zero ve Raw Spread seçenekleri dahil beş hesap türü",
      "MT4, MT5, WebTrader ve kendi FXT uygulaması",
    ],
    cons: [
      "ASIC düzenlemesi altındaki (Avustralyalı) müşteriler için kaldıraç, offshore kuruluşa kıyasla daha düşük bir tavana sahip",
      "ABD, Kanada (Ontario), Yeni Zelanda ve birkaç diğer yargı bölgesi sakinlerine sunulmuyor",
      "Bağımsız incelemeciler FXT adını kullanan sahte/taklit siteler tespit etmiştir — para yatırmadan önce resmi domain üzerinde olduğunuzu doğrulayın",
    ],
    bestFor: "Yüksek kaldıraçlı offshore seçeneklerden vazgeçmeden gerçek tier-1 denetim isteyen yatırımcılar",
    accentNote: "En güçlü düzenleyici geçmiş",
    categories: ["Institutional Trust", "Multi-Platform"],
    scoreCost: 4,
    scoreWithdrawal: 4,
    extraFaqs: [
      {
        q: "FXT güvenilir mi?",
        a: "FXT (FXTrading.com), Avustralya'nın ASIC'i altında bir Market Making lisansına ve offshore bir VFSC (Vanuatu) lisansına sahiptir; ASIC tier-1 bir otoritedir. 2014'ten beri faaliyette olan FXT, offshore-only brokerlere kıyasla daha güçlü bir bağımsız güven skoruna sahiptir. Önemli bir uyarı: bağımsız incelemeciler FXT adını kullanan sahte/taklit siteler tespit etmiştir — para yatırmadan önce resmi domain üzerinde olduğunuzu mutlaka doğrulayın.",
      },
      {
        q: "FXT'den nasıl para çekilir?",
        a: "FXT, MT4, MT5, WebTrader ve kendi FXT uygulaması üzerinden hesap yönetimine izin verir. ASIC düzenlemesi altındaki müşteriler için kaldıraç, offshore kuruluşa kıyasla daha düşük bir tavana sahiptir. Çekim süre ve yöntemlerini hesap türünüze göre resmi FXT sitesinden (taklit sitelere dikkat ederek) teyit edin.",
      },
    ],
  },
  {
    rank: 17,
    slug: "4xc",
    name: "4XC",
    tagline: "MT4/MT5 üzerinden rekabetçi spreadler ve kopya ticaret araçları",
    rating: 3.2,
    founded: 2018,
    minDeposit: "$50",
    maxLeverage: "1:500*",
    regulators: ["FSC (Cook Islands)"],
    platforms: ["MT4", "MT5", "WebTrader"],
    headquarters: "Rarotonga, Cook Adaları",
    referralUrl: "http://live.4xc.com/signup/hMuEQRm2",
    summary:
      "4XC (4xCube), 2018'den beri Cook Adaları Finansal Denetim Komisyonu (FSC) lisansı altında faaliyet gösteren bir offshore brokerdır. MT4/MT5 üzerinden rekabetçi spreadler ve HokoCloud kopya ticaret araçları sunar, ancak FCA/CySEC/ASIC gibi tier-1 bir denetime sahip değildir ve bağımsız incelemelerde karışık çekim deneyimleri bildirilmektedir.",
    pros: [
      "Standard hesapta rekabetçi spreadler (EUR/USD için ~0.7 pip bildirilmiştir)",
      "MT4 ve MT5 üzerinden geniş enstrüman ve platform desteği",
      "HokoCloud kopya ticaret altyapısı",
      "Yeni başlayanlar için eğitim içerikleri",
    ],
    cons: [
      "Yalnızca offshore Cook Adaları (FSC) lisansına sahip — FCA, CySEC veya ASIC gibi tier-1 bir denetim yok",
      "Bağımsız incelemelerde bazı kullanıcılar çekimlerde gecikme veya ek belge talebi bildirmiştir",
      "Kredi kartı yatırımlarında %3, Perfect Money'de %6 gibi yüksek işlem ücretleri",
      "VIP hesap için minimum yatırım $10.000 gibi yüksek bir eşiğe sahiptir",
    ],
    bestFor: "Kopya ticaret araçlarına ilgi duyan, offshore lisans riskini kabul eden deneyimli yatırımcılar",
    accentNote: "Kopya ticaret odaklı offshore broker",
    categories: ["High Leverage"],
    scoreCost: 3,
    scoreWithdrawal: 2,
    extraFaqs: [
      {
        q: "4XC güvenilir mi?",
        a: "4XC, yalnızca Cook Adaları Finansal Denetim Komisyonu'nun (FSC) offshore lisansına sahiptir — FCA, CySEC veya ASIC gibi tier-1 bir düzenleyici otoritenin gözetimi altında değildir. Bu lisans türü, yatırımcı tazminat fonu gibi güçlü koruma mekanizmaları içermez. Bağımsız inceleme siteleri 4XC için düşük-orta düzeyde bir güven skoru bildirmektedir; hesap açmadan önce güncel düzenleyici durumu kendiniz de araştırmanızı öneririz.",
      },
      {
        q: "4XC'den para çekmek ne kadar sürer?",
        a: "Bağımsız incelemelere göre 4XC'de standart yöntemlerle çekimler anında ile 24 saat arasında işlenebilirken, kredi kartı çekimleri 7-10 iş gününü bulabilir. Bazı kullanıcılar gecikme veya ek belge talebi yaşandığını bildirmiştir. Yöntem bazlı ücretler ve güncel işlem süreleri için resmi 4XC sitesini kontrol edin.",
      },
    ],
  },
].sort((a, b) => a.rank - b.rank);

export function getBrokerBySlug(slug: string): Broker | undefined {
  return brokers.find((b) => b.slug === slug);
}

// Brokers currently running paid ad placements (BrokerAdBanner). Kept as an
// explicit slug list rather than a `sponsored` field on Broker so turning a
// campaign on/off doesn't require touching the broker's editorial data.
export const SPONSORED_BROKER_SLUGS = ["xm", "fxpro", "lite-finance", "avatrade", "bybit"];

// Deterministically picks one of the sponsored brokers for a given page,
// varying by `seed` (e.g. the page's own slug) so different pages don't all
// show the same ad, while a given page still renders the same ad on every
// request/reload. `excludeSlug` keeps a broker's own review page from
// advertising itself.
export function getSponsoredBroker(seed: string, excludeSlug?: string): Broker {
  const pool = brokers.filter(
    (b) => SPONSORED_BROKER_SLUGS.includes(b.slug) && b.slug !== excludeSlug
  );
  const candidates = pool.length > 0 ? pool : brokers.filter((b) => SPONSORED_BROKER_SLUGS.includes(b.slug));
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return candidates[hash % candidates.length];
}

// Same pool as getSponsoredBroker, but the whole list (order varied by
// `seed` via a rotation offset) instead of one fixed pick — for ad slots
// that cycle through sponsors client-side (see RotatingBrokerAd) rather
// than showing the same one broker on every visit.
export function getSponsoredBrokerPool(seed: string, excludeSlug?: string): Broker[] {
  const pool = brokers.filter(
    (b) => SPONSORED_BROKER_SLUGS.includes(b.slug) && b.slug !== excludeSlug
  );
  const candidates = pool.length > 0 ? pool : brokers.filter((b) => SPONSORED_BROKER_SLUGS.includes(b.slug));
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const offset = hash % candidates.length;
  return [...candidates.slice(offset), ...candidates.slice(0, offset)];
}
