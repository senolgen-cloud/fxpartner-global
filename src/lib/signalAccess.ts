// Which /paketler tier a given instrument's live signal requires to view in
// full on the website. Matches the feature lists on /paketler: Starter says
// "Forex Sinyalleri", Pro adds "GOLD / XAUUSD Sinyalleri" + "Endeks
// Sinyalleri", VIP is positioned as the most comprehensive tier — so
// anything outside plain FX/metals/indices (crypto, energy) defaults to VIP.
//
// A viewer with no active package (viewerTier === null) has zero rank —
// every active signal is locked regardless of pair, full stop. Closed/
// historical signals are a separate concern entirely and are never gated
// by this module; see SignalsBoard's closedView/isClosed branches, which
// skip canViewSignal altogether so past performance stays public
// (real-results social proof) while only *live, actionable* signals are
// the paid product.
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
  return viewerTier ? TIER_RANK[viewerTier] : -1;
}

export function canViewSignal(viewerTier: PackageTier | null, pair: string): boolean {
  return viewerRank(viewerTier) >= TIER_RANK[requiredTierForPair(pair)];
}

// Strips actual entry/SL/TP/volume from an active signal the viewer isn't
// entitled to — the UI's "••••••" masking (SignalsBoard) is cosmetic on
// its own; a client-side lock never stopped anyone from reading the real
// numbers straight out of the network response. Closed/historical signals
// are never masked (past performance is public). Server-only in practice
// (called from signals/page.tsx and /api/signals), but kept in this
// client-safe module since it's pure policy, not a DB call.
export function maskLockedActiveSignal<
  T extends {
    pair: string;
    status: string;
    entry: string;
    target1: string | null;
    target2: string | null;
    stop: string | null;
    volume: string | null;
  },
>(signal: T, viewerTier: PackageTier | null): T {
  if (signal.status !== "active" || canViewSignal(viewerTier, signal.pair)) return signal;
  return { ...signal, entry: "", target1: null, target2: null, stop: null, volume: null };
}
