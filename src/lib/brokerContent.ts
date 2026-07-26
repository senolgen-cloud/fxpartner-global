import { Broker, TIER1_REGULATORS } from "@/data/brokers";

const PLATFORM_BLURBS: [needle: string, blurb: string][] = [
  [
    "mt4",
    "MetaTrader 4 — the industry's most widely used retail platform, valued for broker-agnostic expert advisors and indicators",
  ],
  [
    "mt5",
    "MetaTrader 5 — MetaTrader's newer platform, with more timeframes, order types, and a built-in economic calendar",
  ],
  [
    "ctrader",
    "cTrader — favored by ECN-focused and algorithmic traders for its Level II pricing and native cAlgo automation",
  ],
  [
    "tradingview",
    "TradingView — wiring live execution directly into one of the most widely used independent charting tools",
  ],
  [
    "webtrader",
    "a browser-based WebTrader that needs no download",
  ],
];

// Joins ["A"] -> "A", ["A","B"] -> "A and B", ["A","B","C"] -> "A, B, and C".
function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Lowercases the first letter unless the string leads with an acronym run
// (e.g. "VIP perks..." or "FXPARTNER-exclusive..." should stay as-is,
// not become "vIP perks..." / "fXPARTNER-exclusive...").
function lowerFirst(s: string): string {
  return /^[A-Z]{2,}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

function platformBlurb(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [needle, blurb] of PLATFORM_BLURBS) {
    if (key.includes(needle)) return blurb;
  }
  return `a proprietary ${name}`;
}

export function platformParagraph(broker: Broker): string {
  const blurbs = broker.platforms.map(platformBlurb);
  if (blurbs.length === 1) {
    return `${broker.name} trades through ${blurbs[0]}.`;
  }
  return `${broker.name} supports ${broker.platforms.length} platforms: ${joinList(blurbs)}.`;
}

export function regulationParagraph(broker: Broker): string {
  const tier1 = broker.regulators.filter((r) => TIER1_REGULATORS.has(r));
  const other = broker.regulators.filter((r) => !TIER1_REGULATORS.has(r));
  const list = joinList(broker.regulators);

  if (tier1.length > 0 && other.length > 0) {
    return `${broker.name} holds ${broker.regulators.length} regulatory license${broker.regulators.length > 1 ? "s" : ""}: ${list}. ${joinList(tier1)} ${tier1.length > 1 ? "are Tier-1 authorities" : "is a Tier-1 authority"} — these require client-fund segregation and minimum capital reserves, and in some jurisdictions back a compensation scheme if the broker fails. The remaining license${other.length > 1 ? "s are" : " is"} offshore, which typically means lighter capital requirements and no investor compensation scheme behind them.`;
  }
  if (tier1.length > 0) {
    return `${broker.name} operates under ${broker.regulators.length} Tier-1 license${broker.regulators.length > 1 ? "s" : ""} — ${list} — the strongest regulatory tier, requiring client-fund segregation, minimum capital reserves, and in some jurisdictions a compensation scheme if the broker fails.`;
  }
  return `${broker.name} is licensed by ${list}. None of these are Tier-1 authorities (FCA, ASIC, CySEC, DFSA, or the Central Bank of Ireland) — offshore regulators typically carry lighter capital requirements and no investor compensation scheme, so it's worth weighing this against the strengths below before funding a live account.`;
}

export function verdictParagraph(broker: Broker): string {
  const strengths = broker.pros.slice(0, 2).map(lowerFirst);
  const tradeoff = broker.cons[0]
    ? ` Its main tradeoff is ${lowerFirst(broker.cons[0])}, worth weighing against the strengths above.`
    : "";
  return `For ${lowerFirst(broker.bestFor)}, ${broker.name} is a strong fit: ${joinList(strengths)}.${tradeoff} As with any broker, confirm current spreads, leverage, and regional availability on ${broker.name}'s official site before funding a live account.`;
}

export function brokerFaqs(broker: Broker): { q: string; a: string }[] {
  const n = broker.regulators.length;
  const tier1Count = broker.regulators.filter((r) => TIER1_REGULATORS.has(r)).length;
  const tier1Clause =
    tier1Count === 0
      ? "None of these are Tier-1 authorities"
      : tier1Count === n
        ? `All ${n} ${n > 1 ? "are" : "is"} Tier-1`
        : `${tier1Count} of ${n} ${tier1Count === 1 ? "is a Tier-1 authority" : "are Tier-1 authorities"}`;
  const faqs = [
    {
      q: `Is ${broker.name} regulated?`,
      a: `${broker.name} holds ${n} license${n > 1 ? "s" : ""} (${broker.regulators.join(", ")}). ${tier1Clause} — the FCA, ASIC, CySEC, DFSA, and the Central Bank of Ireland are the ones we treat as Tier-1.`,
    },
    {
      q: `What is the minimum deposit at ${broker.name}?`,
      a: `${broker.minDeposit}. Maximum leverage goes up to ${broker.maxLeverage}, though the exact figure depends on your account type and country of residence.`,
    },
    {
      q: `Which platforms does ${broker.name} support?`,
      a: `${broker.platforms.join(", ")}.`,
    },
  ];
  if (broker.promotion) {
    faqs.push({
      q: `Does ${broker.name} have an active promotion?`,
      a: `Yes — see the ${broker.promotion.title} campaign below, or check our Campaigns page for current offers across all partner brokers.`,
    });
  }
  return faqs;
}
