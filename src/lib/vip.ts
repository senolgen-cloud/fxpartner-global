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
// cashback program itself already uses, see src/app/admin/cashback. Kept
// available for the NOWPayments checkout to apply (vip_subscription and
// nowpayments_order both still carry discountAccountId); the old Stripe
// full/discounted Price pair it used to feed is gone.
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

// Two distinct ideas, deliberately separate types:
//
//   PackageTier — what someone can BUY on /paketler. Pro and VIP only.
//   AccessTier  — what someone HOLDS, and what a signal REQUIRES. Adds
//                 "free", which is granted by simply having an account and
//                 can never be purchased.
//
// The old paid "starter" tier is gone: it only ever covered plain FX pairs,
// which turned out to be ~16% of actual signal volume — too thin to charge
// $29 for. Those pairs are now the free tier, and the account it requires is
// the lead. A subscriber's purchased tier is stored on vip_subscription.tier
// (only ever "pro" or "vip"); "free" is never written there — it's what a
// signed-in user without a subscription row implicitly has.
export const PACKAGE_TIERS = ["pro", "vip"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

export const ACCESS_TIERS = ["free", "pro", "vip"] as const;
export type AccessTier = (typeof ACCESS_TIERS)[number];

// USD price per purchasable tier — matches the amounts shown on /paketler,
// and is what the NOWPayments checkout charges for one period.
export const TIER_PRICE_USD: Record<PackageTier, number> = {
  pro: 59,
  vip: 99,
};

// How long one payment buys. NOWPayments cannot charge a card every month,
// so a monthly member has to come back and pay again by hand — and many
// don't. The quarterly option takes three months up front for less than
// three monthly payments: the member saves, and the business gets paid for
// a quarter instead of hoping for two renewals.
export const BILLING_PERIODS = ["monthly", "quarterly"] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

export const PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  quarterly: 90,
};

// Full USD price for a tier over a period. Monthly is TIER_PRICE_USD itself,
// so the number on /paketler and the amount charged can never disagree.
export const PERIOD_PRICE_USD: Record<BillingPeriod, Record<PackageTier, number>> = {
  monthly: TIER_PRICE_USD,
  quarterly: { pro: 149, vip: 249 },
};

export function isBillingPeriod(value: unknown): value is BillingPeriod {
  return typeof value === "string" && (BILLING_PERIODS as readonly string[]).includes(value);
}
