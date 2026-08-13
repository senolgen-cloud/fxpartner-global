// A broad, searchable broker directory — distinct from src/data/brokers.ts
// (our deeply-reviewed, ranked partner list). This file exists so a user
// can type almost any broker name and get an honest, sourced verdict, even
// for brokers we don't have a full review or partnership with.
//
// verdict meanings:
//   "verified"  — holds real Tier-1 and/or multi-jurisdiction regulation,
//                 no major regulator warnings found at time of research.
//   "caution"   — legitimate/operating, but with a real reason to dig
//                 deeper: offshore-only licensing, a regulator red flag,
//                 relinquished licenses, or notable complaint patterns.
//   "high-risk" — named on an official regulator warning/unauthorized-firm
//                 list, or a documented scam/clone pattern. This is a
//                 signal to research further, not a legal finding of fraud.
//
// Every entry here is grounded in real research (regulator warning lists,
// and independent broker-review sources) gathered 2026-07-31 — never fabricated.
// Regulator warning lists change weekly; source/date is noted so this can
// be refreshed later rather than treated as permanently authoritative.

export type LookupVerdict = "verified" | "caution" | "high-risk";

export interface LookupBroker {
  name: string;
  verdict: LookupVerdict;
  regulators?: string[];
  note: string;
  source: string;
  // Slug in src/data/brokers.ts, if this broker also has a full FXPARTNER review.
  relatedSlug?: string;
}

export const lookupBrokers: LookupBroker[] = [
  // --- Already fully reviewed on FXPARTNER (see /brokers/[slug]) ---
  {
    name: "XM Global",
    verdict: "verified",
    regulators: ["ASIC", "CySEC", "DFSA", "FSC (Belize)"],
    note: "FXPARTNER's most-chosen partner broker; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "xm",
  },
  {
    name: "AvaTrade",
    verdict: "verified",
    regulators: ["Central Bank of Ireland", "ASIC", "FSCA", "ADGM"],
    note: "Institutional-scale broker with a wide regulatory footprint; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "avatrade",
  },
  {
    name: "Lite Finance",
    verdict: "verified",
    regulators: ["Offshore license"],
    note: "Popular low-barrier-to-entry broker; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "lite-finance",
  },
  {
    name: "IC Markets",
    verdict: "verified",
    regulators: ["ASIC", "CySEC", "FSA (Seychelles)"],
    note: "Raw ECN spreads, strong multi-regulatory licensing; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "ic-markets",
  },
  {
    name: "Tickmill",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "FSA (Seychelles)", "Labuan FSA"],
    note: "Tier-1 FCA backing with cost-conscious Pro accounts; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "tickmill",
  },
  {
    name: "EXNESS",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "FSCA", "FSC (Mauritius)"],
    note: "Known for near-zero spreads and fast withdrawals; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "exness",
  },
  {
    name: "FXT (FXTrading.com)",
    verdict: "verified",
    regulators: ["ASIC", "VFSC (Vanuatu)"],
    note: "Tier-1 ASIC regulation alongside an offshore VFSC license; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "fxt",
  },
  {
    name: "ThinkMarkets",
    verdict: "verified",
    regulators: ["FCA", "ASIC", "CySEC", "FSCA"],
    note: "Wide instrument range with strong multi-regulatory licensing; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "thinkmarkets",
  },
  {
    name: "FxPro",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "FSCA", "SCB (Bahamas)"],
    note: "Top-tier FCA license with broad platform support; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "fxpro",
  },
  {
    name: "easyMarkets",
    verdict: "verified",
    regulators: ["CySEC", "ASIC", "FSA (Seychelles)", "FSC (BVI)", "FSCA"],
    note: "5 regulatory licenses plus guaranteed stop-loss tools; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "easymarkets",
  },
  {
    name: "markets.com",
    verdict: "verified",
    regulators: ["CySEC", "FSC (BVI)"],
    note: "Combines its own platform with MetaTrader options; full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "markets-com",
  },
  {
    name: "Versus Trade",
    verdict: "caution",
    regulators: ["FSC (Mauritius)"],
    note: "Founded 2024, offshore-only licensing so far; young track record. Full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "versus-trade",
  },
  {
    name: "LHFX (formerly LonghornFX)",
    verdict: "caution",
    regulators: ["FSC (Mauritius)", "FSCA"],
    note: "Offshore-only licensing; independent reviews report slippage/withdrawal-delay complaints. Full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "lhfx",
  },
  {
    name: "Exclusive Markets",
    verdict: "caution",
    regulators: ["FSA (Seychelles)", "FSCA"],
    note: "Offshore-only licensing; low independent trust score and recurring withdrawal complaints. Full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "exclusive-markets",
  },
  {
    name: "TradingPRO",
    verdict: "caution",
    regulators: ["FSCA", "FSC (Mauritius)"],
    note: "No Tier-1 regulation; was listed on the UK FCA's unauthorized-firm warning list in mid-2025. Full review available.",
    source: "FXPARTNER editorial review",
    relatedSlug: "tradingpro",
  },

  // --- Additional well-known global brokers (not FXPARTNER partners) ---
  {
    name: "IG",
    verdict: "verified",
    regulators: ["FCA", "ASIC", "MAS", "BaFin"],
    note: "One of the longest-established CFD/forex brokers, listed on the London Stock Exchange.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "OANDA",
    verdict: "verified",
    regulators: ["CFTC/NFA", "FCA", "ASIC", "MAS"],
    note: "Long-running multi-jurisdiction broker, widely cited among top regulated brokers for 2026.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Interactive Brokers",
    verdict: "verified",
    regulators: ["SEC/FINRA", "FCA", "ASIC", "MAS"],
    note: "Large publicly traded global brokerage with broad market access.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Pepperstone",
    verdict: "verified",
    regulators: ["FCA", "ASIC", "CySEC", "DFSA"],
    note: "Global ECN broker known for low-latency execution.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "FOREX.com",
    verdict: "verified",
    regulators: ["CFTC/NFA", "FCA", "ASIC"],
    note: "StoneX-owned broker, one of the most established US-regulated forex brands.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "FP Markets",
    verdict: "verified",
    regulators: ["ASIC", "CySEC", "FSCA", "FSA (Seychelles)", "CMA (Kenya)"],
    note: "Multi-jurisdiction ECN broker with a wide regulatory spread.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Plus500",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "ASIC", "MAS"],
    note: "Publicly listed CFD provider holding 7 Tier-1 and 4 Tier-2 licenses — one of the broadest regulatory footprints in the industry.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "eToro",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "ASIC"],
    note: "Social/copy-trading platform holding 4 Tier-1 and 1 Tier-2 license.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Swissquote",
    verdict: "verified",
    regulators: ["FINMA", "FCA", "CSSF (Luxembourg)", "DFSA"],
    note: "Swiss banking-license holder — bank-grade regulatory standing, one of the strongest profiles reviewed.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Vantage Markets",
    verdict: "verified",
    regulators: ["ASIC", "FCA", "FSCA", "VFSC (Vanuatu)"],
    note: "Dual-Tier-1 regulated (ASIC + FCA) via separate legal entities, operating since 2009.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "HFM (HF Markets / HotForex)",
    verdict: "caution",
    regulators: ["FCA", "FSCA"],
    note: "Holds real FCA and FSCA licenses, but has been red-flagged by Malaysia's Securities Commission, Bank Negara Malaysia, and Ukraine's NSSMC — check which entity your account falls under.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Admirals (Admiral Markets)",
    verdict: "caution",
    regulators: ["FCA", "CySEC"],
    note: "Historically well-regulated, but reported to be restructuring and relinquishing its Estonian investment-firm license — worth checking current entity/license before funding.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "FBS",
    verdict: "caution",
    regulators: ["FSC (Belize)", "CySEC (EU clients only)"],
    note: "EU clients get real CySEC protection, but most international clients sit under the offshore FSC Belize entity, a license type known for lighter enforcement.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Octa (OctaFX)",
    verdict: "caution",
    regulators: ["CySEC", "FSCA", "MISA (Comoros)"],
    note: "Holds a real CySEC market-making license, but only clients onboarded under that specific Cyprus entity get EU protection; independent reviews note a mid-range trust score and withdrawal-related complaints.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },
  {
    name: "Deriv",
    verdict: "caution",
    regulators: ["MFSA (Malta, EU clients only)"],
    note: "EU/Malaysian clients get a real Tier-1 MFSA license, but most retail clients elsewhere are onboarded under Deriv (SVG) LLC in St. Vincent & the Grenadines, which has no financial regulator at all.",
    source: "Independent regulator/broker-review research, 2026-07-31",
  },

  // --- Named on official regulator unauthorized-firm warning lists ---
  {
    name: "TridentFX",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "Axis Advisory Trade",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "BlockassetsBridge",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "Cryptex Markets",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "Mercer Advisor Management",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "CoinFinity",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "Staple Markets",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "Bornemx Market",
    verdict: "high-risk",
    note: "Named on the UK FCA's warning list as not authorised to provide financial services in the UK.",
    source: "UK FCA warning list, July 2026",
  },
  {
    name: "Konvexium",
    verdict: "high-risk",
    note: "Flagged by Germany's BaFin for operating without the required license.",
    source: "German BaFin warning, July 2026",
  },
  {
    name: "Nordvet",
    verdict: "high-risk",
    note: "Flagged by Germany's BaFin for operating without the required license.",
    source: "German BaFin warning, July 2026",
  },
  {
    name: "Tcinos Group",
    verdict: "high-risk",
    note: "Flagged by Germany's BaFin for operating without the required license.",
    source: "German BaFin warning, July 2026",
  },
  {
    name: "Primepocket Trades",
    verdict: "high-risk",
    note: "Flagged by Germany's BaFin for operating without the required license.",
    source: "German BaFin warning, July 2026",
  },
  {
    name: "Trilessyum",
    verdict: "high-risk",
    note: "Flagged by Italy's CONSOB for offering trading services without proper authorisation.",
    source: "Italian CONSOB warning, July 2026",
  },
  {
    name: "Gold Grain Capital",
    verdict: "high-risk",
    note: "Flagged by Italy's CONSOB for offering trading services without proper authorisation.",
    source: "Italian CONSOB warning, July 2026",
  },
  {
    name: "Future Investment",
    verdict: "high-risk",
    note: "Flagged by Italy's CONSOB for offering trading services without proper authorisation.",
    source: "Italian CONSOB warning, July 2026",
  },
  {
    name: "Vault Capital Growth",
    verdict: "high-risk",
    note: "Flagged by Switzerland's FINMA for operating without a license.",
    source: "Swiss FINMA warning, July 2026",
  },
  {
    name: "Quantara Markets",
    verdict: "high-risk",
    note: "Not listed under any regulatory authority found during review.",
    source: "Regulator blacklist roundup, July 2026",
  },
  {
    name: "Global Apex Markets",
    verdict: "high-risk",
    note: "Not listed under any regulatory authority found during review.",
    source: "Regulator blacklist roundup, July 2026",
  },
  {
    name: "Golden Bar Trading",
    verdict: "high-risk",
    note: "Not listed under any regulatory authority found during review.",
    source: "Regulator blacklist roundup, July 2026",
  },
  {
    name: "titanledger.io",
    verdict: "high-risk",
    note: "CySEC confirmed this site is not authorized to provide investment services in Cyprus/EU.",
    source: "CySEC warning, April 2026",
  },
  {
    name: "connectfinancials.com",
    verdict: "high-risk",
    note: "CySEC confirmed this site is not authorized to provide investment services in Cyprus/EU.",
    source: "CySEC warning, April 2026",
  },
  {
    name: "meridian-experts.com",
    verdict: "high-risk",
    note: "Operates as a lead-generation/onboarding funnel collecting personal details; named in CySEC's non-approved list.",
    source: "CySEC warning, April 2026",
  },
  {
    name: "Finxara",
    verdict: "high-risk",
    note: "Claims FCA/ASIC/CySEC regulation, but CySEC directly confirmed finxara.com is not licensed under its framework — a clear false-regulation red flag.",
    source: "CySEC warning, April 2026",
  },
  {
    name: "getleveraged.com",
    verdict: "high-risk",
    note: "CySEC confirmed this site is not authorized to provide investment services in Cyprus/EU.",
    source: "CySEC warning, April 2026",
  },

  // --- Flagged by independent trust-score/complaint sources ---
  {
    name: "ORCA MARKETS",
    verdict: "high-risk",
    note: "Saint Lucia-based; independent reviews report app malfunctions preventing trades and complaints about fund losses and failed deposits.",
    source: "Independent complaint-review sources, 2026",
  },
  {
    name: "LOYAL PRIMUS",
    verdict: "high-risk",
    note: "Users report account deactivation after withdrawal attempts and cancelled withdrawal requests citing 'suspicious activity'.",
    source: "Independent complaint-review sources, 2026",
  },
  {
    name: "WAYONE CAPITAL",
    verdict: "high-risk",
    note: "Saint Lucia-based; allegations of non-compliant fund-withdrawal practices and delayed releases with recurring excuses.",
    source: "Independent complaint-review sources, 2026",
  },
  {
    name: "TNFL FX Global Limited",
    verdict: "high-risk",
    note: "UK-headquartered but lacks the FCA authorization required to legally offer forex services there.",
    source: "Independent complaint-review sources, 2026",
  },
  {
    name: "Fusion Trade",
    verdict: "high-risk",
    note: "The UK FCA issued a public warning that this firm is unregulated and operating without a proper license.",
    source: "UK FCA warning, 2023 (still unresolved as of 2026)",
  },
  {
    name: "Primarkets",
    verdict: "high-risk",
    note: "Independent trust-score aggregators rate this firm at 1.34/10, among the lowest of any broker reviewed.",
    source: "Independent trust-score aggregator, 2026",
  },

  // --- Common "guaranteed return" scam pattern, some impersonating real brokers ---
  {
    name: "AffluenceFX",
    verdict: "high-risk",
    note: "Advertises unrealistic guaranteed daily win rates; unregulated and on the FCA warning list.",
    source: "UK FCA warning list, 2026",
  },
  {
    name: "CoingateForexPro",
    verdict: "high-risk",
    note: "Claims to 'guarantee profit' with unrealistic weekly returns; unregulated and on the US CFTC watchlist.",
    source: "US CFTC watchlist, 2026",
  },
  {
    name: "Forex Capital Gain",
    verdict: "high-risk",
    note: "Falsely claims CFTC regulation while actually appearing on the CFTC's RED (Registration Deficient) list — a false-regulation red flag.",
    source: "US CFTC RED list, 2026",
  },
  {
    name: "Octa Stocks FX",
    verdict: "high-risk",
    note: "Promises guaranteed daily returns and appears to be a clone/impersonator of the real, CySEC-regulated Octa — verify you're on the official octa.com domain.",
    source: "UK FCA warning list, 2026",
  },
  {
    name: "Trade360",
    verdict: "high-risk",
    note: "The original entity renounced its regulatory licenses and ceased operating in 2023; the domain is now defunct, but cloned versions are used in phishing campaigns — do not trust any site using this name.",
    source: "Regulator history + phishing-clone reports, 2026",
  },

  // --- Unregulated but not confirmed fraudulent — extra caution advised ---
  {
    name: "LQDFX",
    verdict: "caution",
    note: "Not regulated by any recognized authority found during review.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "FxGlory",
    verdict: "caution",
    note: "Not regulated; also offers binary options, a product category with a high scam rate industry-wide.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "Coinexx",
    verdict: "caution",
    note: "Not regulated by any recognized authority found during review.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "LMFX",
    verdict: "caution",
    note: "Not regulated by any recognized authority found during review.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "NordFX",
    verdict: "caution",
    note: "Operates under offshore-only registration rather than a recognized Tier-1/Tier-2 regulator.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "FreshForex",
    verdict: "caution",
    note: "Not regulated by any recognized authority found during review.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "EagleFX",
    verdict: "caution",
    note: "Not regulated by any recognized authority found during review; also offers crypto trading alongside forex.",
    source: "Independent broker-review sources, 2026",
  },

  // --- Turkey's domestically SPK-licensed retail forex brokerages ---
  // These hold Turkey's "Geniş Yetkili Aracı Kurum" (Broad-Authority
  // Brokerage) license from the SPK, specifically covering kaldıraçlı
  // (leveraged) FX/CFD trading for Turkish residents — the domestic
  // counterpart to the offshore-regulated brokers above. Cross-checked
  // against each firm's own regulatory disclosures and independent press
  // coverage, 2026-08-01. Note: Turkish law caps retail leverage at 1:10
  // and requires a 50,000 TL minimum margin, both well below what
  // internationally-regulated brokers can typically offer.
  {
    name: "GCM Yatırım (GCM Forex)",
    verdict: "verified",
    regulators: ["SPK (Turkey)"],
    note: "SPK-licensed Broad-Authority Brokerage (license G-039) operating since 2012, offering domestic leveraged FX/CFD trading under Turkish law's 1:10 leverage cap.",
    source: "Company regulatory disclosures + independent press, 2026",
  },
  {
    name: "İntegral Yatırım Menkul Değerler (İntegral Forex)",
    verdict: "verified",
    regulators: ["SPK (Turkey)"],
    note: "SPK-licensed for leveraged FX trading; was Turkey's largest forex broker by volume in 2012-2013. Operates under Ulukartal Holding.",
    source: "Company regulatory disclosures + independent press, 2026",
  },
  {
    name: "ALB Menkul Değerler (ALB Forex)",
    verdict: "verified",
    regulators: ["SPK (Turkey)"],
    note: "SPK Broad-Authority Brokerage license (obtained 2015), part of the Albayrak Group, offering domestic leveraged FX trading.",
    source: "Company regulatory disclosures + independent press, 2026",
  },
  {
    name: "Ahlatcı Yatırım Menkul Değerler",
    verdict: "verified",
    regulators: ["SPK (Turkey)"],
    note: "SPK Broad-Authority Brokerage license (since October 2016), part of Ahlatcı Holding, offering domestic leveraged FX trading.",
    source: "Company regulatory disclosures, 2026",
  },
  {
    name: "İnfo Yatırım Menkul Değerler",
    verdict: "verified",
    regulators: ["SPK (Turkey)"],
    note: "SPK-licensed brokerage offering domestic leveraged FX trading under Turkish law's 1:10 leverage cap.",
    source: "Company regulatory disclosures, 2026",
  },
  {
    name: "Trive Yatırım (Trive FX)",
    verdict: "verified",
    regulators: ["SPK (Turkey)"],
    note: "SPK Broad-Authority Brokerage offering domestic leveraged FX/CFD trading alongside local stock and derivatives markets.",
    source: "Company regulatory disclosures, 2026",
  },

  // --- Turkey's Capital Markets Board (SPK) official access-blocking actions ---
  // SPK is Turkey's government financial regulator. Under Capital Markets Law
  // Art. 99/4, it orders Turkey's telecom authority (BTK) to block in-country
  // access to sites confirmed to be offering unlicensed leveraged trading to
  // Turkish residents. These are official enforcement decisions, not a
  // third party's opinion — the strongest sourcing tier in this file.
  // Gathered 2026-08-01 from SPK bulletins as reported by independent Turkish
  // financial outlets (Borsa Gündem, EkoTürk, Doviz.com), cross-checked
  // across multiple sources.
  {
    name: "tr-fxpro-group.org",
    verdict: "high-risk",
    note: "A clone site using a lookalike domain and FxPro's branding to target Turkish investors. Not affiliated with the real, CySEC/FCA-regulated FxPro in any way. Access-blocked by Turkey's SPK.",
    source: "Turkish SPK access-blocking bulletin 2024-57",
  },
  {
    name: "batr-tickmill.com",
    verdict: "high-risk",
    note: "A clone site using a lookalike domain and Tickmill's branding to target Turkish investors. Not affiliated with the real, FCA-regulated Tickmill in any way. Access-blocked by Turkey's SPK.",
    source: "Turkish SPK access-blocking bulletin 2024-57",
  },
  {
    name: "xmtrmarket.info",
    verdict: "high-risk",
    note: "A clone site using a lookalike domain and XM's branding to target Turkish investors. Not affiliated with the real XM Global in any way. Access-blocked by Turkey's SPK.",
    source: "Turkish SPK access-blocking bulletin 2024-57",
  },
  {
    name: "fxpro-trgroup.global",
    verdict: "high-risk",
    note: "A second clone site impersonating FxPro with a lookalike domain, targeting Turkish investors. Not affiliated with the real FxPro. Access-blocked by Turkey's SPK.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "qnbfinvesttr.com",
    verdict: "high-risk",
    note: "Uses QNB Finansinvest's name and branding, but independent review sources report no verifiable SPK license found for this domain. Not confirmed to be affiliated with the real, SPK-regulated QNB Yatırım Menkul Değerler. Verify directly on SPK's official brokerage database before trusting this site.",
    source: "Independent broker-review sources, 2026",
  },
  {
    name: "Borsa Klas Forex (borsaklasforex.com)",
    verdict: "high-risk",
    note: "Unlicensed platform offering leveraged trading to Turkish residents without SPK authorization.",
    source: "Turkish SPK access-blocking bulletin 2024-57",
  },
  {
    name: "KlasFX (klasfx275.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Winex Global (winexglobal7.com / winexglobal8.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Phase Global (phaseglobal7.com / phaseglobal8.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Felix Markets (felixmarketglobal.com / trfelixmarkets.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Fortex Capital Markets (fortexcapitalmarkets.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Volume Investment (volumeinvestment.net)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Algo Yatırım (algoyatirim.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Ventaro Ocean (ventarocean.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Ocean8FX (ocean8fx1.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "BGC-FX (bgc-fx.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Finlaba (finlaba.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "CryonFX (cryonfx5.com)",
    verdict: "high-risk",
    note: "Unlicensed leveraged-trading platform targeting Turkish residents; access-blocked by SPK for operating without authorization.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Dinamik Menkul Değerler",
    verdict: "high-risk",
    note: "Unlicensed capital-markets operator targeting Turkish residents (dinamikmenkuldegerler.com, dymenkul.com); a social-media account impersonating this firm was separately flagged too. Access-blocked by SPK.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Ata Menkul Trade (atamenkultrade.com)",
    verdict: "high-risk",
    note: "Unlicensed capital-markets operator targeting Turkish residents; access-blocked by SPK.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Galata Menkul (galatamenkul.org)",
    verdict: "high-risk",
    note: "Unlicensed capital-markets operator targeting Turkish residents; access-blocked by SPK.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Scuzdan (scuzdan.com)",
    verdict: "high-risk",
    note: "Unlicensed capital-markets operator targeting Turkish residents; access-blocked by SPK.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },
  {
    name: "Model Grup (modelmenkulportfoy.com)",
    verdict: "high-risk",
    note: "Unlicensed capital-markets operator targeting Turkish residents; access-blocked by SPK.",
    source: "Turkish SPK access-blocking bulletin, 2026",
  },

  // --- Additional well-known brokers, researched 2026-08-13 (batch prompted
  // by cross-referencing WintoFX's business directory — see
  // docs/wintofx-broker-coverage-plan.md for the source list and method).
  {
    name: "Axi",
    verdict: "verified",
    regulators: ["ASIC", "FCA", "FMA (New Zealand)", "CySEC", "DFSA"],
    note: "Multi-Tier-1 regulated (ASIC 318232, FCA 466201, FMA 518226, CySEC 433/23, DFSA F003742) with a clean compliance record; some international clients are onboarded to a lighter-regulated St. Vincent & the Grenadines entity instead.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "BDSwiss",
    verdict: "caution",
    regulators: ["FSA (Seychelles)", "FSC (Mauritius)"],
    note: "Restructured away from CySEC after a €100,000 fine for circumventing margin/risk-warning requirements; no longer holds an active Tier-1 license, now offshore-only.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Capital.com",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "ASIC"],
    note: "Multi-Tier-1 regulated (FCA 793714, CySEC 319/17, ASIC 513393) straight-through-processing broker.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "CMC Markets",
    verdict: "verified",
    regulators: ["FCA", "ASIC", "MAS", "BaFin"],
    note: "London Stock Exchange-listed, founded 1989; one of the broadest Tier-1 regulatory footprints reviewed (FCA, ASIC 238054, MAS, BaFin, plus FMA NZ and IIROC Canada).",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Equiti (Equiti Capital)",
    verdict: "verified",
    regulators: ["FCA", "FSRA (ADGM)", "FSA (Seychelles)", "CMA (Kenya)"],
    note: "FCA-regulated (528328) with FSCS protection; its UAE arm sits under ADGM's FSRA rather than the DFSA.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "FXCM (Stratos Markets / Stratos Trading)",
    verdict: "verified",
    regulators: ["FCA", "ASIC", "CySEC", "FSCA"],
    note: "Owned by Jefferies Financial Group; UK/AU entities trade as Stratos Markets Ltd / Stratos Trading Pty Ltd under long-standing FCA (217689) and ASIC (309763) licenses.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "FxOpen",
    verdict: "caution",
    regulators: ["FCA", "CySEC"],
    note: "Still FCA (579202) and CySEC regulated, but lost its ASIC license in 2024 after ASIC raised 'serious concerns' about its supervisory arrangements — Australian clients are no longer onboarded.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "FXTM (ForexTime)",
    verdict: "verified",
    regulators: ["FCA", "CySEC", "FSCA", "FSC (Mauritius)", "CMA (Kenya)"],
    note: "Multi-jurisdiction regulated (FCA 777911, CySEC 185/12, FSCA 46614, FSC Mauritius C113012295); ended retail EEA operations under its CySEC entity in 2021, professional clients only there now.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "GO Markets",
    verdict: "verified",
    regulators: ["ASIC", "CySEC", "FSCA", "FSA (Seychelles)"],
    note: "Operating since 2006; the original Australian entity holds a Tier-1 ASIC license (254963).",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "ICM Capital",
    verdict: "caution",
    regulators: ["FCA"],
    note: "ICM Capital Ltd itself retains FCA regulation (520965), but the similarly-named ICM.com surrendered its own separate FCA license in April 2026 — confirm exactly which entity/domain you're dealing with before funding an account.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Imperial Markets",
    verdict: "high-risk",
    note: "Unregulated Saint Lucia-registered entity; falsely claimed a BVI FSC license (No. 2024516) that the BVI Financial Services Commission explicitly denied ever issuing, in a public statement dated 15 June 2023.",
    source: "BVI FSC public statement, 15 June 2023 + independent broker-review research, 2026-08-13",
  },
  {
    name: "Infinox",
    verdict: "verified",
    regulators: ["FCA", "FSC (Mauritius)", "SCB (Bahamas)", "FSCA"],
    note: "FCA-regulated (501057); fined £99,200 in January 2025 for MiFIR transaction-reporting failures but otherwise solidly multi-jurisdiction licensed.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "IronFX",
    verdict: "caution",
    regulators: ["CySEC", "FCA", "ASIC", "FSCA"],
    note: "Multi-Tier-1 licensed (CySEC 125/10, FCA 585561, ASIC 417482, FSCA 45276) but has a history of CySEC fines/settlements (including a 2024 €100,000 settlement) and recurring withdrawal-delay complaints.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "JustMarkets",
    verdict: "caution",
    regulators: ["CySEC", "FSCA", "FSC (Mauritius)", "FSC (BVI)", "FSA (Seychelles)"],
    note: "Holds a real CySEC license among 5 regulators, but has a revoked Belize license in its history and independent reviews report user complaints about profit confiscation and withdrawal delays.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Libertex",
    verdict: "verified",
    regulators: ["CySEC"],
    note: "Operating since 1997 under Indication Investments Ltd (CySEC 164/12); a 2021 €160,000 CySEC fine was resolved.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "MultiBank Group",
    verdict: "verified",
    regulators: ["ASIC", "BaFin", "FMA (Austria)", "CySEC", "FSC (BVI)"],
    note: "Broad multi-continent regulatory footprint including two Tier-1 regulators (ASIC 416279, BaFin).",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Scope Markets",
    verdict: "caution",
    regulators: ["FSC (Belize)", "CySEC", "CMA (Kenya)", "FSC (Mauritius)", "FSA (Seychelles)", "FSCA"],
    note: "Holds 6 licenses including CySEC, but its primary/default regulator is the Tier-3 offshore FSC Belize (000274/325).",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "XTB",
    verdict: "verified",
    regulators: ["FCA", "KNF (Poland)", "CySEC", "DFSA", "FSCA", "IFSC (Belize)"],
    note: "Broad regulatory footprint anchored by Poland's KNF since 2005 and FCA (522157); KNF fined XTB PLN 20 million in 2026 over MiFID II/investor-protection breaches.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Dukascopy",
    verdict: "verified",
    regulators: ["FINMA (Swiss bank)", "JFSA"],
    note: "Swiss-bank-regulated (FINMA) with an additional Japan FSA market-making license — one of the strongest regulatory profiles reviewed.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Alpari (Alpari International)",
    verdict: "caution",
    regulators: ["FSC (Mauritius)"],
    note: "Tier-3 offshore-only regulation via Exinity Limited; no FSCS/ICF-equivalent compensation scheme if the broker becomes insolvent.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "InstaForex",
    verdict: "high-risk",
    note: "Its CySEC entity was fined and restricted, the FCA issued an unauthorized-firm warning, and it's named on Malaysia's BNM Financial Consumer Alert List; most global clients still route through a lighter-regulated offshore (BVI FSC) entity.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "RoboForex",
    verdict: "caution",
    regulators: ["FSC (Belize)"],
    note: "Tier-3 offshore-only regulation (FSC Belize 000138/32); no major public enforcement actions on record, but Belize's FSC offers minimal client-fund protection.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Pocket Option",
    verdict: "high-risk",
    note: "Not authorized by any major regulator; public warnings from the UK FCA, Italy's CONSOB (which ordered the site blocked), Spain's CNMV, the US CFTC, and Canada's ASC, plus an Israel Securities Authority criminal probe into binary-options activity.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
  {
    name: "Quadcode (Quotex)",
    verdict: "high-risk",
    note: "Unregulated; publicly warned by multiple regulators (Italy's CONSOB, Portugal's CMVM, Spain's CNMV, Pakistan's SECP, Ukraine's NSSMC, Australia's ASIC, New Zealand's FMA, Belgium's FSMA) with a recurring pattern of blocked withdrawals and accounts suspended after becoming profitable.",
    source: "Independent regulator/broker-review research, 2026-08-13",
  },
];

export function searchLookupBrokers(query: string): LookupBroker[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return lookupBrokers.filter((b) => b.name.toLowerCase().includes(q));
}
