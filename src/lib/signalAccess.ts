// Which /paketler tier a given instrument's live signal requires to view in
// full on the website. Matches the feature lists on /paketler: Starter says
// "Forex Sinyalleri", Pro adds "GOLD / XAUUSD Sinyalleri" + "Endeks
// Sinyalleri", VIP is positioned as the most comprehensive tier — so
// anything outside plain FX/metals/indices (crypto, energy) defaults to VIP.
//
// Anonymous/signed-out visitors are treated as Starter-level for web
// visibility — Starter's real differentiators are the Telegram VIP channel,
// trade notifications, and guided support, not exclusive website content,
// so the site keeps showing forex-pair signals publicly (same as before
// this tiering existed) while Pro/VIP unlock the rest on-site.
//
// Type-only import — lib/vip.ts pulls in db/drizzle at runtime, but this
// file is also used from the client-side SignalsBoard component, so only
// the (erased-at-compile-time) type crosses that boundary.
import type { PackageTier } from "@/lib/vip";
export type { PackageTier };

export const TIER_RANK: Record<PackageTier, number> = { starter: 0, pro: 1, vip: 2 };

const METAL_SYMBOLS = new Set(["GOLD", "XAUUSD", "SILVER", "XAGUSD"]);

const INDEX_PREFIXES = [
  "US100",
  "US30",
  "US500",
  "GER40",
  "FRA40",
  "UK100",
  "JPN225",
  "HK50",
  "AUS200",
  "EU50",
  "ESP35",
  "NAS100",
];

const FX_CODES = new Set(["EUR", "USD", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "TRY"]);

export function requiredTierForPair(rawPair: string): PackageTier {
  const pair = rawPair.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (METAL_SYMBOLS.has(pair)) return "pro";
  if (INDEX_PREFIXES.some((p) => pair.startsWith(p))) return "pro";

  // A pure 6-letter FX pair made of two recognized currency codes.
  if (pair.length === 6) {
    const base = pair.slice(0, 3);
    const quote = pair.slice(3, 6);
    if (FX_CODES.has(base) && FX_CODES.has(quote)) return "starter";
  }

  // Everything else — crypto (BTCUSD, ETHUSD), energy (OILCASH,
  // BRENTCASH), and any other exotic instrument — is VIP-only.
  return "vip";
}

export function viewerRank(viewerTier: PackageTier | null): number {
  return TIER_RANK[viewerTier ?? "starter"];
}

export function canViewSignal(viewerTier: PackageTier | null, pair: string): boolean {
  return viewerRank(viewerTier) >= TIER_RANK[requiredTierForPair(pair)];
}
