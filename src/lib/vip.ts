import { db } from "@/db";
import { cashbackAccounts, vipSubscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function isActiveVipSubscriber(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: vipSubscriptions.id })
    .from(vipSubscriptions)
    .where(and(eq(vipSubscriptions.userId, userId), eq(vipSubscriptions.status, "active")))
    .limit(1);
  return Boolean(row);
}

// The discount is earned by having at least one verified cashback account
// (real trading account opened with a partner broker) — same signal the
// cashback program itself already uses, see src/app/admin/cashback.
export async function hasVerifiedCashbackAccount(
  userId: string
): Promise<{ eligible: boolean; accountId: string | null }> {
  const [row] = await db
    .select({ id: cashbackAccounts.id })
    .from(cashbackAccounts)
    .where(and(eq(cashbackAccounts.userId, userId), eq(cashbackAccounts.status, "verified")))
    .limit(1);
  return { eligible: Boolean(row), accountId: row?.id ?? null };
}

export function getVipPriceId(eligible: boolean): string {
  const priceId = eligible
    ? process.env.STRIPE_VIP_PRICE_ID_DISCOUNTED
    : process.env.STRIPE_VIP_PRICE_ID_FULL;
  if (!priceId) {
    throw new Error(
      eligible
        ? "STRIPE_VIP_PRICE_ID_DISCOUNTED is not set"
        : "STRIPE_VIP_PRICE_ID_FULL is not set"
    );
  }
  return priceId;
}

// The /paketler pricing page's three membership tiers — each maps to its
// own real Stripe recurring Price, set as an env var (created in the Stripe
// Dashboard; nothing here invents a price ID). Distinct from getVipPriceId
// above, which is the older single-tier (full/discounted) VIP price used by
// /account/vip — that flow is left untouched.
export const PACKAGE_TIERS = ["starter", "pro", "vip"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

const TIER_ENV_VAR: Record<PackageTier, string> = {
  starter: "STRIPE_PRICE_STARTER",
  pro: "STRIPE_PRICE_PRO",
  vip: "STRIPE_PRICE_VIP",
};

export function getTierPriceId(tier: PackageTier): string {
  const envVar = TIER_ENV_VAR[tier];
  const priceId = process.env[envVar];
  if (!priceId) throw new Error(`${envVar} is not set`);
  return priceId;
}

// Reverse lookup (Stripe price ID -> which tier it belongs to) for display
// purposes, e.g. showing "Pro" on the account page for an active subscriber.
export function tierFromPriceId(priceId: string): PackageTier | null {
  for (const tier of PACKAGE_TIERS) {
    if (process.env[TIER_ENV_VAR[tier]] === priceId) return tier;
  }
  return null;
}
