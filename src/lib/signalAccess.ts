// Which access level a given instrument's live signal requires to view in
// full on the website. Matches the tiers on /paketler:
//
//   free — plain FX majors/crosses. Fully public: no account, no payment.
//          These same levels go out openly on Telegram and X (see
//          PUBLISH_FREE_TIER_LEVELS in /api/trade-signal), so hiding them
//          behind a login here would only mean the site showed less than
//          the public channel — the one place a visitor arrives ready to
//          convert. The account now earns its keep on push alerts and
//          cashback, not on withholding what we already published.
//   pro  — GOLD / XAUUSD, silver, and index CFDs.
//   vip  — everything else: crypto, energy, and any other exotic symbol.
//
// A signed-OUT visitor (viewer === null) is therefore treated as "free":
// they see FX levels in full, and Pro/VIP instruments stay masked exactly
// as they do for a registered free user.
// Closed/historical signals are a separate concern entirely and are never
// gated by this module; see SignalsBoard's closedView/isClosed branches,
// which skip canViewSignal altogether so past performance stays public
// (real-results social proof) while only *live, actionable* signals are
// gated.
//
// Type-only import — lib/vip.ts pulls in db/drizzle at runtime, but this
// file is also used from the client-side SignalsBoard component, so only
// the (erased-at-compile-time) types cross that boundary.
import type { AccessTier, PackageTier } from "@/lib/vip";
export type { AccessTier, PackageTier };

export const TIER_RANK: Record<AccessTier, number> = { free: 0, pro: 1, vip: 2 };

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

export function requiredTierForPair(rawPair: string): AccessTier {
  const pair = rawPair.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (METAL_SYMBOLS.has(pair)) return "pro";
  if (INDEX_PREFIXES.some((p) => pair.startsWith(p))) return "pro";

  // A pure 6-letter FX pair made of two recognized currency codes.
  if (pair.length === 6) {
    const base = pair.slice(0, 3);
    const quote = pair.slice(3, 6);
    if (FX_CODES.has(base) && FX_CODES.has(quote)) return "free";
  }

  // Everything else — crypto (BTCUSD, ETHUSD), energy (OILCASH,
  // BRENTCASH), and any other exotic instrument — is VIP-only. Note this
  // catch-all is also what puts GOLD24-7 in VIP: it is a separate product
  // from spot GOLD, not a symbol-matching miss, and is meant to stay here.
  return "vip";
}

// null (signed out) ranks the same as "free" — a guest and a registered
// free user see exactly the same signals. Registration changes what you get
// *pushed*, not what you can read.
export function viewerRank(viewer: AccessTier | null): number {
  return TIER_RANK[viewer ?? "free"];
}

export function canViewSignal(viewer: AccessTier | null, pair: string): boolean {
  return viewerRank(viewer) >= TIER_RANK[requiredTierForPair(pair)];
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
>(signal: T, viewer: AccessTier | null): T {
  if (signal.status !== "active" || canViewSignal(viewer, signal.pair)) return signal;
  return { ...signal, entry: "", target1: null, target2: null, stop: null, volume: null };
}
