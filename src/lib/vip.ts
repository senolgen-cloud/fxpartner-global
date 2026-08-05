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
