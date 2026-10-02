import { db } from "@/db";
import { users, vipSubscriptions, type VipProvider } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type { PackageTier } from "@/lib/vip";

const DAY_MS = 24 * 60 * 60 * 1000;

// Days of access kept after currentPeriodEnd before a lapsed member drops to
// free. A crypto payment can sit unconfirmed on-chain for hours, and a
// member who paid on the last day should not lose the board while it does.
export const GRACE_DAYS = 2;

// The days a free month adds — the reward for a first verified cashback
// account (docs/ekim-2026-yukselis-plani.md, Hamle 2).
export const CASHBACK_TRIAL_DAYS = 30;

type SubscriptionLike = { status: string; currentPeriodEnd: Date | null };

// Whether a subscription row still grants its tier. A null end date is an
// open-ended grant (manual comp access); anything else lapses GRACE_DAYS
// after its end, whether or not the renewal cron has flipped its status yet.
export function isSubscriptionLive(sub: SubscriptionLike | null | undefined, now = new Date()): boolean {
  if (!sub || sub.status !== "active") return false;
  if (!sub.currentPeriodEnd) return true;
  return sub.currentPeriodEnd.getTime() + GRACE_DAYS * DAY_MS > now.getTime();
}

// users.isVip is a cached read-only-for-UI flag, kept in lockstep with the
// authoritative vipSubscriptions row — nothing else should write it.
export async function syncIsVipCache(userId: string) {
  const [row] = await db
    .select({ status: vipSubscriptions.status, currentPeriodEnd: vipSubscriptions.currentPeriodEnd })
    .from(vipSubscriptions)
    .where(eq(vipSubscriptions.userId, userId))
    .limit(1);
  await db.update(users).set({ isVip: isSubscriptionLive(row) }).where(eq(users.id, userId));
}

// Adds `days` of access to a member's single subscription row.
//
// Days are added to whatever is left, not counted from today: before this,
// paying a week early threw that week away, which is exactly the member we
// most want to renew early. A lapsed or missing row starts from now.
//
// `keepLiveTier` is for grants that are not a purchase (the free cashback
// month): a live VIP member who earns it gets 30 more VIP days, not a
// downgrade to Pro.
export async function grantAccess(params: {
  userId: string;
  tier: PackageTier;
  days: number;
  provider: VipProvider;
  paymentId?: string | null;
  discountAccountId?: string | null;
  keepLiveTier?: boolean;
}) {
  const now = new Date();
  const existing = await db.query.vipSubscriptions.findFirst({
    where: eq(vipSubscriptions.userId, params.userId),
  });
  const live = isSubscriptionLive(existing, now);

  const base =
    live && existing?.currentPeriodEnd && existing.currentPeriodEnd > now
      ? existing.currentPeriodEnd
      : now;
  const currentPeriodEnd = new Date(base.getTime() + params.days * DAY_MS);
  const tier = params.keepLiveTier && live && existing?.tier ? existing.tier : params.tier;

  // A webhook request carries NOWPayments' cookies, not the buyer's, so
  // getAttribution() is useless here — the subscription inherits the
  // first-touch source already recorded on the buyer's user row instead.
  // Deliberately absent from the onConflictDoUpdate set below: a renewal
  // must not rewrite what the first purchase recorded.
  const [buyer] = await db
    .select({ source: users.source, campaign: users.campaign, landingPath: users.landingPath })
    .from(users)
    .where(eq(users.id, params.userId))
    .limit(1);

  await db
    .insert(vipSubscriptions)
    .values({
      userId: params.userId,
      provider: params.provider,
      tier,
      nowpaymentsPaymentId: params.paymentId ?? null,
      status: "active",
      discountAccountId: params.discountAccountId ?? null,
      currentPeriodEnd,
      source: buyer?.source ?? null,
      campaign: buyer?.campaign ?? null,
      landingPath: buyer?.landingPath ?? null,
    })
    .onConflictDoUpdate({
      target: vipSubscriptions.userId,
      set: {
        tier,
        // A free month must not erase the record of the last real payment,
        // nor relabel a paying member as a manual grant.
        ...(params.paymentId ? { provider: params.provider, nowpaymentsPaymentId: params.paymentId } : {}),
        status: "active",
        ...(params.discountAccountId !== undefined ? { discountAccountId: params.discountAccountId } : {}),
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: now,
      },
    });

  await syncIsVipCache(params.userId);
  return { tier, currentPeriodEnd };
}

// The free Pro month for a member's first verified cashback account. Once
// per member, ever: the claim is a conditional UPDATE, so two verifications
// racing each other (or an admin toggling the same account twice) cannot
// both get through. Returns null when the month was already given.
export async function grantCashbackProTrial(userId: string) {
  const [claimed] = await db
    .update(users)
    .set({ proTrialGrantedAt: new Date() })
    .where(and(eq(users.id, userId), isNull(users.proTrialGrantedAt)))
    .returning({ id: users.id, email: users.email, name: users.name });
  if (!claimed) return null;

  const result = await grantAccess({
    userId,
    tier: "pro",
    days: CASHBACK_TRIAL_DAYS,
    provider: "manual",
    keepLiveTier: true,
  });
  return { ...result, email: claimed.email, name: claimed.name };
}
