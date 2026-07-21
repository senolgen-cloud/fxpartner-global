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
  },
  {
    rank: 2,
    slug: "avatrade",
    name: "AvaTrade",
    logo: "/brokers/avatrade.jpg",
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
    scoreOverride: 9.2,
  },
  {
    rank: 5,
    slug: "tickmill",
    name: "Tickmill",
    logo: "/brokers/tickmill.webp",
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
  },
  {
    rank: 3,
    slug: "lite-finance",
    name: "Lite Finance",
    logo: "/brokers/lite-finance.png",
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
  },
  {
    rank: 6,
    slug: "exness",
    name: "EXNESS",
    logo: "/brokers/exness.png",
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
  },
  {
    rank: 10,
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
  },
  {
    rank: 8,
    slug: "fxpro",
    name: "FxPro",
    logo: "/brokers/fxpro.png",
    tagline: "Trade via MT4, MT5, and the FxPro App",
    rating: 3.5,
    founded: 2006,
    minDeposit: "$100",
    maxLeverage: "1:2000*",
    regulators: ["FCA", "CySEC", "FSCA", "SCB (Bahamas)"],
    platforms: ["MT4", "MT5", "cTrader", "FxPro App"],
    headquarters: "United Kingdom / Cyprus",
    referralUrl: "https://bit.ly/fxpro-turkiye",
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
      "Scores lower than other FXPARTNER partners",
      "Commission structure can be complex on some account types",
    ],
    bestFor: "Experienced investors seeking high leverage and multiple platforms",
    accentNote: "Highest leverage option",
    categories: ["High Leverage", "Institutional Trust"],
    scoreCost: 3,
    scoreWithdrawal: 3,
  },
  {
    rank: 11,
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
  },
  {
    rank: 7,
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
  },
  {
    rank: 9,
    slug: "easymarkets",
    name: "easyMarkets",
    logo: "/brokers/easymarkets.png",
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
  },
  {
    rank: 4,
    slug: "ic-markets",
    name: "IC Markets",
    logo: "/brokers/ic-markets.png",
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
      "4.8/5 rating from 55,000+ reviews on Trustpilot",
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
  },
  {
    rank: 12,
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
  },
  {
    rank: 13,
    slug: "exclusive-markets",
    name: "Exclusive Markets",
    logo: "/brokers/exclusive-markets.svg",
    tagline: "High-leverage offshore CFD trading via MT4/MT5",
    rating: 2.0,
    founded: 2011,
    minDeposit: "$200",
    maxLeverage: "1:2000*",
    regulators: ["FSA (Seychelles)", "FSCA"],
    platforms: ["MT4", "MT5"],
    headquarters: "Mahé, Seychelles",
    referralUrl: "http://www.exclusivemarkets.com/register?ib=12214908",
    summary:
      "Exclusive Markets is a CFD broker founded in 2011, holding only offshore licenses (FSA Seychelles and FSCA). Independent review sources note a low trust score and recurring withdrawal complaints; we recommend carefully weighing these risks before opening an account.",
    pros: [
      "High leverage up to 1:2000",
      "Wide product range with over 5,000 instruments",
      "MT4/MT5 support",
    ],
    cons: [
      "Only offshore (FSA Seychelles + FSCA) licenses, no Tier-1 regulation",
      "WikiFX's on-site investigation could not verify a physical presence at the listed Cyprus/Seychelles addresses",
      "Independent review sites report a low trust score (WikiFX 2.38/10; ForexBrokerz 1.50/5) and recurring withdrawal/frozen-balance complaints",
    ],
    bestFor: "Experienced investors who fully accept the risk and seek high leverage",
    accentNote: "High leverage option",
    categories: ["High Leverage"],
    scoreCost: 3,
    scoreWithdrawal: 1,
  },
].sort((a, b) => a.rank - b.rank);

export function getBrokerBySlug(slug: string): Broker | undefined {
  return brokers.find((b) => b.slug === slug);
}
