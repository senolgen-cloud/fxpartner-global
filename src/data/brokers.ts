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
  { slug: string; description: string }
> = {
  Beginners: {
    slug: "beginners",
    description:
      "Brokers suited to a first step into forex, with a low minimum deposit and a simple account-opening process.",
  },
  "Low Spread": {
    slug: "low-spread",
    description:
      "Brokers that prioritize trading cost, with near-raw spreads and a transparent commission structure.",
  },
  "High Leverage": {
    slug: "high-leverage",
    description:
      "Brokers offering higher leverage options, aimed at active and experienced traders.",
  },
  "Institutional Trust": {
    slug: "institutional-trust",
    description:
      "Institutional-scale brokers operating under multiple top-tier (Tier-1) regulatory authorities.",
  },
  "Multi-Platform": {
    slug: "multi-platform",
    description:
      "Brokers offering additional platform options beyond MT4/MT5, such as their own web, mobile, or cTrader.",
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
    label: "Regulation",
    description:
      "Calculated from the number of Tier-1 authorities and overall license diversity; the editorial team may update it for reasoned exceptions.",
  },
  {
    n: "02",
    key: "cost",
    label: "Cost",
    description:
      "Editorial assessment of spread, commission, and minimum-deposit transparency.",
  },
  {
    n: "03",
    key: "platform",
    label: "Platform",
    description:
      "Calculated from the number and variety of trading platforms offered.",
  },
  {
    n: "04",
    key: "withdrawal",
    label: "Withdrawals",
    description:
      "Based on verifiable withdrawal speed/transparency signals found in the review; a neutral score is assigned when no signal exists.",
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

export const brokers: Broker[] = [
  {
    rank: 1,
    slug: "xm",
    name: "XM Global",
    logo: "/brokers/xm.png",
    ogImage: "/brokers/xm-cover.jpg",
    adImage: "/ads/xm-banner.png",
    tagline: "Trade via MT4, MT5, and the XM App",
    rating: 4.8,
    founded: 2009,
    minDeposit: "$5",
    maxLeverage: "1:1000*",
    regulators: ["ASIC", "CySEC", "DFSA", "FSC (Belize)"],
    platforms: ["MT4", "MT5", "XM App"],
    headquarters: "Cyprus / Australia",
    referralUrl: "https://affs.click/gvaLg",
    partnerCode: "FXPARTNER",
    summary:
      "XM is the most-chosen broker in the FXPARTNER community, thanks to extensive educational material, regular live webinars, and a very low minimum deposit. Accounts opened with the FXPARTNER partner code get access to VIP perks.",
    pros: [
      "Low minimum deposit of $5",
      "VIP perks with the FXPARTNER partner code",
      "Multiple regulatory licenses (ASIC, CySEC)",
      "Negative balance protection",
      "24/7 withdrawals, averaging 1-2 minutes",
    ],
    cons: [
      "Limited raw-spread account options",
      "Leverage ratios vary by region",
    ],
    bestFor: "Beginners and education-focused investors",
    accentNote: "Most chosen",
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
        { name: "Micro", spread: "From 1.0 pips", commission: "None", minDeposit: "$5" },
        { name: "Standard", spread: "From 1.0 pips", commission: "None", minDeposit: "$5" },
        { name: "XM Ultra Low", spread: "From 0.6 pips", commission: "None", minDeposit: "$100" },
        { name: "Zero", spread: "From 0.0 pips", commission: "$3.50 per lot, per side", minDeposit: "$100" },
        { name: "Shares", spread: "Per-share commission, no leverage", commission: "Varies by share", minDeposit: "$5" },
      ],
      deposits:
        "Cards and e-wallets (Skrill, Neteller, WebMoney) are usually credited instantly; bank wire transfers take 1-3 business days. XM charges no deposit fee.",
      withdrawals:
        "Most withdrawal requests are processed within 24 hours — e-wallet payouts typically land the same day, while card and bank withdrawals take roughly 2-5 business days depending on the provider. XM charges no withdrawal fee, though your payment provider may apply its own.",
      support:
        "24/7 live chat, phone, and email support in 28+ languages, plus a self-serve help center.",
      education:
        "Daily live webinars in 23 languages, a Tradepedia video library, an interactive economic calendar, and the XM Traders Club loyalty program (Bronze through Elite tiers, earning XM Coins on closed positions).",
    },
  },
  {
    rank: 4,
    slug: "avatrade",
    name: "AvaTrade",
    logo: "/brokers/avatrade.jpg",
    ogImage: "/brokers/avatrade-cover.png",
    tagline: "Institutional trust, wide regulatory footprint",
    rating: 4.5,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:400*",
    regulators: ["Central Bank of Ireland", "ASIC", "FSCA", "ADGM"],
    platforms: ["MT4", "MT5", "AvaTradeGO", "WebTrader"],
    headquarters: "Ireland",
    referralUrl: "https://tracking.avapartner.com/yRwAAA",
    summary:
      "AvaTrade is an institutional-scale broker operating under more than 9 regulatory authorities worldwide, offering fixed-spread accounts and social/copy-trading infrastructure. Special bonus campaigns are available through FXPARTNER.",
    pros: [
      "Wide safety net with 9+ regulatory licenses",
      "FXPARTNER-exclusive bonus campaigns",
      "Fixed and variable spread options",
      "Its own mobile platform, AvaTradeGO",
    ],
    cons: [
      "Higher minimum deposit than XM",
      "Per-trade commission on some account types",
    ],
    bestFor: "Traders seeking institutional trust and copy trading",
    accentNote: "Most regulated",
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
    rank: 6,
    slug: "tickmill",
    name: "Tickmill",
    logo: "/brokers/tickmill.webp",
    ogImage: "/brokers/tickmill-cover.png",
    tagline: "MetaTrader platforms and low spreads",
    rating: 4.5,
    founded: 2014,
    minDeposit: "$100",
    maxLeverage: "1:500*",
    regulators: ["FCA", "CySEC", "FSA (Seychelles)", "Labuan FSA"],
    platforms: ["MT4", "MT5"],
    headquarters: "United Kingdom",
    referralUrl: "https://tickmill.link/4vvHCRK",
    partnerCode: "IB45254758",
    summary:
      "Tickmill appeals to cost-conscious investors with low-cost Pro accounts, welcome and margin bonuses, and top-tier regulatory backing that includes the FCA. Additional perks are available with the FXPARTNER VIP partner code.",
    pros: [
      "Low raw spreads + commission on Pro accounts",
      "Welcome and margin bonuses",
      "Top-tier regulatory licenses, including the FCA",
      "Fast and transparent deposit/withdrawal process",
    ],
    cons: [
      "Relatively high minimum deposit on the Classic account type",
      "Educational content isn't as extensive as XM's",
    ],
    bestFor: "Cost-conscious, active traders",
    accentNote: "Strongest bonus program",
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
    rank: 3,
    slug: "lite-finance",
    name: "Lite Finance",
    logo: "/brokers/litefinance-icon.png",
    ogImage: "/brokers/lite-finance-cover.png",
    adImage: "/ads/lite-finance-banner.png",
    tagline: "Selectable leverage up to 1:1000",
    rating: 4.5,
    founded: 2005,
    minDeposit: "$10",
    maxLeverage: "1:1000*",
    regulators: ["Offshore license"],
    platforms: ["MT4", "MT5", "LiteFinance WebTerminal"],
    headquarters: "Cyprus",
    referralUrl: "https://litefinance-tr.org/?uid=667827970",
    summary:
      "Lite Finance is popular with investors who want to start with a small amount of capital, thanks to cent accounts, high leverage options, and a low minimum deposit. FXPARTNER-exclusive bonuses and promotions are available.",
    pros: [
      "Open an account with as little as $10",
      "FXPARTNER-exclusive bonuses and promotions",
      "Cent account option for low-risk practice",
      "Simple and fast account-opening process",
    ],
    cons: [
      "Institutional-investor content isn't as extensive as XM/AvaTrade",
    ],
    bestFor: "Individual investors starting with small capital",
    accentNote: "Lowest barrier to entry",
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
      tag: "Active Campaign",
      title: "Refer a Friend, Earn $50",
      intro:
        "Lite Finance's refer-a-friend campaign is live for FXPARTNER clients: invite a friend, and you both get rewarded.",
      steps: [
        "Verify your own account and deposit at least $100.",
        "Generate your personal referral link and share it with a friend.",
        "Your friend signs up through your link and, within 7 days, deposits $250+ and applies the promo code to claim a 100% deposit bonus.",
        "Once your friend completes at least 1 lot of trading, $50 is credited to your account.",
      ],
      note: "Campaign terms apply and are subject to change; Lite Finance reserves the right to cancel rewards for terms violations. Confirm current conditions on Lite Finance's official site before participating.",
      contactEmail: "turkiye@litefinance.com",
    },
  },
  {
    rank: 7,
    slug: "exness",
    name: "EXNESS",
    logo: "/brokers/exness.png",
    ogImage: "/brokers/exness-cover.png",
    tagline: "Near-zero spreads and instant withdrawals",
    rating: 4.3,
    founded: 2008,
    minDeposit: "$10",
    maxLeverage: "Unlimited*",
    regulators: ["FCA", "CySEC", "FSCA", "FSC (Mauritius)"],
    platforms: ["MT4", "MT5", "Exness Terminal"],
    headquarters: "Cyprus",
    referralUrl: "https://one.exnessonelink.com/a/nt8xpejsow",
    partnerCode: "nt8xpejsow",
    summary:
      "Exness stands out among active traders for its instant withdrawal times, near-zero spread options, and flexible leverage that can go up to unlimited. Accounts opened with the FXPARTNER partner code get access to special perks.",
    pros: [
      "Instant/automated withdrawal processing",
      "Near-unlimited leverage on some account types",
      "Low entry barrier with a $10 minimum deposit",
      "Access to FXPARTNER perks",
    ],
    cons: [
      "Very high leverage is risky for inexperienced investors",
      "The variety of account types can be confusing at first glance",
    ],
    bestFor: "Experienced traders with high trading volume",
    accentNote: "Fastest withdrawal emphasis",
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
    rank: 11,
    slug: "markets-com",
    name: "markets.com",
    logo: "/brokers/markets-com.png",
    tagline: "Web, mobile, MT4, and MT5 platform options",
    rating: 4.0,
    founded: 2008,
    minDeposit: "$100",
    maxLeverage: "1:300*",
    regulators: ["CySEC", "FSC (BVI)"],
    platforms: ["Marketsx (Web)", "Mobile", "MT4", "MT5"],
    headquarters: "Cyprus / BVI",
    referralUrl: "https://refer.markets.com/2R72MI",
    partnerCode: "2R72MI",
    summary:
      "markets.com is a well-established broker combining its own Marketsx platform with web, mobile, and MetaTrader options in one place. Special perks are available with the FXPARTNER partner code.",
    pros: [
      "Its own Marketsx web platform",
      "Special perks with the FXPARTNER partner code",
      "MT4/MT5 and mobile app support",
      "Wide instrument range (forex, stocks, commodities, indices)",
    ],
    cons: [
      "Narrower Tier-1 regulatory coverage than other brokers",
      "Service may be restricted in some regions",
    ],
    bestFor: "Versatile investors who prefer a proprietary platform",
    accentNote: "Most versatile platform",
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
    rank: 2,
    slug: "fxpro",
    name: "FxPro",
    logo: "/brokers/fxpro.png",
    adImage: "/ads/fxpro-banner.png",
    adImageWidth: 1536,
    adImageHeight: 1024,
    tagline: "Trade via MT4, MT5, and the FxPro App",
    rating: 4.6,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:2000*",
    regulators: ["FCA", "CySEC", "FSCA", "SCB (Bahamas)"],
    platforms: ["MT4", "MT5", "cTrader", "FxPro App"],
    headquarters: "United Kingdom / Cyprus",
    referralUrl: "https://redirect-fxpro.com/tr/partner/2qhvb5Zx2",
    partnerCode: "2qhvb5Zx2",
    summary:
      "FxPro is a well-established broker with top-tier regulatory licenses including the FCA, broad platform support (MT4, MT5, cTrader, FxPro App), and leverage up to 1:2000 on some account types.",
    pros: [
      "Top-tier regulatory licenses, including the FCA",
      "Broad platform support across MT4/MT5/cTrader/FxPro App",
      "Leverage up to 1:2000 on some accounts",
      "Over 20 years of industry experience",
    ],
    cons: [
      "Commission structure can be complex on some account types",
    ],
    bestFor: "Experienced investors seeking high leverage and multiple platforms",
    accentNote: "Top-tier regulated, high leverage",
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
      tag: "New Account Offer",
      title: "100% Welcome Bonus",
      intro:
        "FxPro is running a 100% welcome bonus for new accounts opened through the FXPARTNER referral link — a strong head start for first-time deposits.",
      steps: [
        "Open a new FxPro account through the FXPARTNER referral link.",
        "Make a qualifying first deposit.",
        "Confirm the bonus is applied to your account — exact rate and eligibility vary by account type and region.",
      ],
      note: "Bonus terms and conditions apply and may change without notice; confirm current eligibility on FxPro's official site before funding a live account. Trading involves risk of loss.",
    },
  },
  {
    rank: 12,
    slug: "versus-trade",
    name: "Versus Trade",
    logo: "/brokers/versus-trade.jpg",
    tagline: "High-leverage CFD trading on MetaTrader 5",
    rating: 3.0,
    founded: 2024,
    minDeposit: "$10",
    maxLeverage: "1:2000*",
    regulators: ["FSC (Mauritius)"],
    platforms: ["MT5"],
    headquarters: "Saint Lucia",
    referralUrl: "https://one.versustrade.link/links/go/48280?pid=98691",
    summary:
      "Versus Trade is a next-generation CFD broker founded in 2024, notable for its MetaTrader 5 infrastructure and its own 'Versus Pairs' product. It operates under a Mauritius FSC license; accounts can be opened with the FXPARTNER partner code.",
    pros: [
      "Low minimum deposit of $10",
      "High leverage up to 1:2000",
      "Fast ECN/STP order execution on MetaTrader 5",
      "Unique 'Versus Pairs' trading product",
    ],
    cons: [
      "Founded in 2024, short operating history",
      "Only an offshore (Mauritius FSC) license, no Tier-1 regulation",
      "Some user reviews report complaints about withdrawal/profit cancellations",
      "Only offers MT5, no MT4 support",
    ],
    bestFor: "Experienced, risk-aware investors seeking high leverage",
    accentNote: "Newest-generation platform",
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
    rank: 9,
    slug: "thinkmarkets",
    name: "ThinkMarkets",
    logo: "/brokers/thinkmarkets.jpg",
    tagline: "4,000+ instruments via MT4, MT5, and ThinkTrader",
    rating: 4.4,
    founded: 2010,
    minDeposit: "$0",
    maxLeverage: "1:500*",
    regulators: ["FCA", "ASIC", "CySEC", "FSCA"],
    platforms: ["MT4", "MT5", "ThinkTrader"],
    headquarters: "London / Melbourne",
    referralUrl:
      "https://www.welcome-partner.thinkmarkets.com/?cid=0&pid=290469&type=1&redirecturl=https://portal.thinkmarkets.com/account/individual",
    summary:
      "ThinkMarkets is a well-established broker with strong multi-regulatory licensing including the FCA, ASIC, and CySEC, a $0 minimum deposit on the Standard account, and access to more than 4,000 instruments through its own ThinkTrader platform. Accounts can be opened with the FXPARTNER partner code.",
    pros: [
      "Strong multi-regulatory licensing including FCA, ASIC, and CySEC",
      "$0 minimum deposit on the Standard account",
      "Wide product range with 4,000+ instruments",
      "Cloud-based alerts and custom indicators in ThinkTrader",
    ],
    cons: [
      "The Standard/ThinkZero/ThinkTrader account options can be confusing for beginners",
      "No cent/micro account option; a $20 monthly inactivity fee may apply",
    ],
    bestFor: "Experienced investors seeking strong regulation and a wide instrument range",
    accentNote: "Widest instrument range",
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
    rank: 10,
    slug: "easymarkets",
    name: "easyMarkets",
    logo: "/brokers/easymarkets-logo.jpg",
    tagline: "Fixed spreads and guaranteed risk-management tools",
    rating: 4.2,
    founded: 2001,
    minDeposit: "$25",
    maxLeverage: "1:2000*",
    regulators: ["CySEC", "ASIC", "FSA (Seychelles)", "FSC (BVI)", "FSCA"],
    platforms: ["MT4", "MT5", "easyMarkets App"],
    headquarters: "Limassol, Cyprus",
    referralUrl: "https://lnd.easy-markets.com/int/en/refer-a-friend/?ref_id=8433E3",
    summary:
      "easyMarkets is a well-established broker operating since 2001, holding 5 regulatory licenses including CySEC and ASIC. It offers guaranteed stop-loss and guaranteed negative balance protection, both rare in the industry. Accounts can be opened with the FXPARTNER partner code.",
    pros: [
      "Operating since 2001, 20+ years of industry experience",
      "5 regulatory licenses, including CySEC and ASIC",
      "Guaranteed Stop-Loss and guaranteed negative balance protection",
      "Low minimum deposit of $25",
    ],
    cons: [
      "The lowest spreads require a $2,000-$10,000 minimum deposit on Premium/VIP accounts",
      "No automated (EA) trading or third-party plugin support on its own platform",
    ],
    bestFor: "Beginners seeking fixed spreads and guaranteed risk-management tools",
    accentNote: "Safest risk-management tools",
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
    rank: 5,
    slug: "ic-markets",
    name: "IC Markets",
    logo: "/brokers/ic-markets.png",
    ogImage: "/brokers/ic-markets-cover.png",
    tagline: "Raw ECN spreads and TradingView integration",
    rating: 4.7,
    founded: 2007,
    minDeposit: "$200",
    maxLeverage: "1:500*",
    regulators: ["ASIC", "CySEC", "FSA (Seychelles)"],
    platforms: ["MT4", "MT5", "cTrader", "TradingView"],
    headquarters: "Sydney, Australia",
    referralUrl: "https://ic.com/?camp=69888",
    summary:
      "IC Markets (rebranded as IC) is a well-established broker operating since 2007, widely regarded as an industry leader in raw ECN spreads, with strong multi-regulatory licensing including ASIC and CySEC. Accounts can be opened with the FXPARTNER partner code.",
    pros: [
      "Operating since 2007, an industry leader in raw ECN spreads",
      "Strong multi-regulatory licensing including ASIC, CySEC, and FSA",
      "Broad platform support across MT4/MT5/cTrader/TradingView",
      "4.8/5 rating from 55,000+ independent customer reviews",
    ],
    cons: [
      "The $200 minimum deposit is high compared to low-barrier brokers",
      "Fined a total of €250,000 by CySEC in 2024 for leverage-limit and cost-transparency violations",
    ],
    bestFor: "Experienced/algorithmic investors seeking raw spreads and institutional-grade execution",
    accentNote: "Lowest raw spreads",
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
    rank: 13,
    slug: "lhfx",
    name: "LHFX",
    logo: "/brokers/lhfx.png",
    tagline: "Low-barrier MT5 trading with free deposits/withdrawals",
    rating: 2.8,
    founded: 2020,
    minDeposit: "$10",
    maxLeverage: "1:500*",
    regulators: ["FSC (Mauritius)", "FSCA"],
    platforms: ["MT5"],
    headquarters: "Port Louis, Mauritius",
    referralUrl: "https://lhfx.com/signup?ref=1543",
    summary:
      "LHFX (formerly LonghornFX) is a CFD broker rebranded in 2025, holding only offshore licenses (FSC Mauritius and FSCA). Independent reviews praise the ease of deposits/withdrawals, but also report complaints about slippage and withdrawal delays; we recommend weighing these risks before opening an account.",
    pros: [
      "Low minimum deposit of $10",
      "No extra fees on deposits/withdrawals",
      "Allows scalping, hedging, and EA (algorithmic) trading",
    ],
    cons: [
      "Only offshore (FSC Mauritius + FSCA) licenses, no Tier-1 regulation",
      "Rebranded from LonghornFX to LHFX in 2025; a short and mixed corporate history",
      "Independent reviews report allegations of slippage/order manipulation, withdrawal delays, and complaints about bonus advertising",
    ],
    bestFor: "Risk-aware investors seeking a low barrier to entry",
    accentNote: "Free deposits/withdrawals",
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
    rank: 14,
    slug: "exclusive-markets",
    name: "Exclusive Markets",
    logo: "/brokers/exclusive-markets.svg",
    tagline: "High-leverage offshore CFD trading via MT4/MT5",
    rating: 2.0,
    founded: 2017,
    minDeposit: "From $10*",
    maxLeverage: "1:4000*",
    regulators: ["FSA (Seychelles)", "FSCA"],
    platforms: ["MT4", "MT5"],
    headquarters: "Mahé, Seychelles",
    referralUrl: "http://www.exclusivemarkets.com/register?ib=12214908",
    summary:
      "Exclusive Markets is a CFD broker founded in 2017, holding only offshore licenses (FSA Seychelles and FSCA). Independent review sources note a low trust score and recurring withdrawal complaints; we recommend carefully weighing these risks before opening an account.",
    pros: [
      "High leverage up to 1:4000",
      "Wide product range with over 5,000 instruments",
      "MT4/MT5 support",
    ],
    cons: [
      "Only offshore (FSA Seychelles + FSCA) licenses, no Tier-1 regulation",
      "An independent on-site investigation could not verify a physical presence at the listed Cyprus/Seychelles addresses",
      "Independent review sites report a very low trust score and recurring withdrawal/frozen-balance complaints",
    ],
    bestFor: "Experienced investors who fully accept the risk and seek high leverage",
    accentNote: "High leverage option",
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
    rank: 15,
    slug: "tradingpro",
    name: "TradingPRO",
    logo: "/brokers/tradingpro.png",
    tagline: "Multi-asset CFD trading via MT4, MT5, and cTrader",
    rating: 1.8,
    founded: 2017,
    minDeposit: "$1",
    maxLeverage: "1:2000*",
    regulators: ["FSCA", "FSC (Mauritius)"],
    platforms: ["MT4", "MT5", "cTrader"],
    headquarters: "Saint Vincent and the Grenadines / Mauritius",
    referralUrl: "https://secure.trading-pro.app/links/go/22409",
    partnerCode: "FXPARTNER",
    summary:
      "TradingPRO is a CFD broker offering forex, indices, commodities, and crypto trading with leverage up to 1:2000 and a $1 minimum deposit. It holds offshore licenses (FSCA South Africa, FSC Mauritius) but no Tier-1 regulation, and was listed as an unauthorized firm on the UK FCA's warning list in mid-2025.",
    pros: [
      "Very low minimum deposit of $1",
      "High leverage up to 1:2000",
      "MT4, MT5, and cTrader platform support",
      "Wide instrument range including forex, indices, commodities, and crypto CFDs",
    ],
    cons: [
      "Only offshore (FSCA + FSC Mauritius) licenses, no Tier-1 regulation",
      "Listed as an unauthorized firm on the UK FCA warning list (June 2025)",
      "Independent review sites report a very low trust score with an explicit 'stay away' warning, plus multiple documented withdrawal delay/rejection complaints",
    ],
    bestFor: "Experienced, risk-aware traders who fully accept the risk and want a very low entry threshold",
    accentNote: "Lowest minimum deposit",
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
    rank: 8,
    slug: "fxt",
    name: "FXT",
    logo: "/brokers/fxt.svg",
    tagline: "ASIC-regulated multi-platform trading via MT4, MT5, and the FXT App",
    rating: 4.3,
    founded: 2014,
    minDeposit: "$50",
    maxLeverage: "1:2000*",
    regulators: ["ASIC", "VFSC (Vanuatu)"],
    platforms: ["MT4", "MT5", "WebTrader", "FXT App"],
    headquarters: "Australia",
    referralUrl: "https://my.fxtrading.com/new_api/prom/a/Qu3nwT2Y",
    partnerCode: "FXPARTNER",
    summary:
      "FXT (FXTrading.com) is a broker operating since 2014 under a Market Making license from Australia's ASIC alongside an offshore VFSC (Vanuatu) license. It offers five account types, from Standard to Raw Spread, with leverage up to 1:2000 depending on jurisdiction. Accounts can be opened with the FXPARTNER partner code.",
    pros: [
      "Tier-1 ASIC (Australia) regulation alongside an offshore VFSC license",
      "Operating since 2014, with a stronger independent trust score than most offshore-only brokers",
      "Five account types, including Zero and Raw Spread options",
      "MT4, MT5, WebTrader, and a proprietary FXT app",
    ],
    cons: [
      "Leverage is capped lower for ASIC-regulated (Australian) clients than for the offshore entity",
      "Not available to residents of the US, Canada (Ontario), New Zealand, and a few other jurisdictions",
      "Independent reviewers note clone/impersonator sites using the FXT name — verify you're on the official domain before depositing",
    ],
    bestFor: "Traders who want real Tier-1 oversight without giving up high-leverage offshore options",
    accentNote: "Strongest regulatory track record",
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
].sort((a, b) => a.rank - b.rank);

export function getBrokerBySlug(slug: string): Broker | undefined {
  return brokers.find((b) => b.slug === slug);
}

// Brokers currently running paid ad placements (BrokerAdBanner). Kept as an
// explicit slug list rather than a `sponsored` field on Broker so turning a
// campaign on/off doesn't require touching the broker's editorial data.
export const SPONSORED_BROKER_SLUGS = ["xm", "fxpro", "lite-finance"];

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
