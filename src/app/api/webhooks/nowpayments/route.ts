import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature, NOWPAYMENTS_SUCCESS_STATUSES } from "@/lib/nowpayments";
import { db } from "@/db";
import { users, vipSubscriptions, nowpaymentsOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

// NOWPayments has no auto-renewing subscription — this grants exactly one
// 30-day period of access per confirmed payment. A future cron (not built
// yet) would need to prompt subscribers to pay again before it lapses.
const PERIOD_DAYS = 30;

// users.isVip is a cached read-only-for-UI flag, kept in lockstep with the
// authoritative vipSubscriptions row — nothing else should write it.
async function syncIsVipCache(userId: string) {
  const [row] = await db
    .select({ status: vipSubscriptions.status })
    .from(vipSubscriptions)
    .where(eq(vipSubscriptions.userId, userId))
    .limit(1);
  await db
    .update(users)
    .set({ isVip: row?.status === "active" })
    .where(eq(users.id, userId));
}

export async function POST(req: NextRequest) {
  // Signature verification needs the exact raw bytes NOWPayments signed —
  // must read as text before any JSON parsing touches the body.
  const rawBody = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");

  if (!verifyIpnSignature(rawBody, signature)) {
    console.error("NOWPayments IPN signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    payment_id: string | number;
    payment_status: string;
    order_id: string;
  };

  if (!NOWPAYMENTS_SUCCESS_STATUSES.has(payload.payment_status)) {
    // Pending/partially-paid/expired — nothing to grant yet, and we still
    // return 200 so NOWPayments doesn't keep retrying a status we've simply
    // noted and are waiting on.
    return NextResponse.json({ received: true, ignored: payload.payment_status });
  }

  const order = await db.query.nowpaymentsOrders.findFirst({
    where: eq(nowpaymentsOrders.id, payload.order_id),
  });
  if (!order) {
    console.error("NOWPayments IPN referenced an unknown order_id:", payload.order_id);
    return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  }

  // Idempotency: a resent IPN callback for an order we already fulfilled
  // must not extend the period a second time.
  if (order.fulfilledAt) {
    return NextResponse.json({ received: true, alreadyFulfilled: true });
  }

  const currentPeriodEnd = new Date(Date.now() + PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // A webhook request carries NOWPayments' cookies, not the buyer's, so
  // getAttribution() is useless here — the subscription inherits the
  // first-touch source already recorded on the buyer's user row instead.
  // Deliberately absent from the onConflictDoUpdate set below: a renewal
  // must not rewrite what the first purchase recorded.
  const [buyer] = await db
    .select({
      source: users.source,
      campaign: users.campaign,
      landingPath: users.landingPath,
    })
    .from(users)
    .where(eq(users.id, order.userId))
    .limit(1);

  await db
    .insert(vipSubscriptions)
    .values({
      userId: order.userId,
      provider: "nowpayments",
      tier: order.tier,
      nowpaymentsPaymentId: String(payload.payment_id),
      status: "active",
      discountAccountId: order.discountAccountId,
      currentPeriodEnd,
      source: buyer?.source ?? null,
      campaign: buyer?.campaign ?? null,
      landingPath: buyer?.landingPath ?? null,
    })
    .onConflictDoUpdate({
      target: vipSubscriptions.userId,
      set: {
        provider: "nowpayments",
        tier: order.tier,
        nowpaymentsPaymentId: String(payload.payment_id),
        status: "active",
        discountAccountId: order.discountAccountId,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
    });

  await db
    .update(nowpaymentsOrders)
    .set({ fulfilledAt: new Date() })
    .where(eq(nowpaymentsOrders.id, order.id));

  await syncIsVipCache(order.userId);

  return NextResponse.json({ received: true });
}
