import { NextRequest, NextResponse } from "next/server";
import { verifyIpnSignature, NOWPAYMENTS_SUCCESS_STATUSES } from "@/lib/nowpayments";
import { db } from "@/db";
import { nowpaymentsOrders } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { PERIOD_DAYS } from "@/lib/vip";
import { grantAccess } from "@/lib/subscription";

// NOWPayments has no auto-renewing subscription — each confirmed payment
// grants exactly the period its order was created for (30 or 90 days),
// added on top of whatever the member still has left. The renewal cron
// (/api/cron/subscription-renewal) reminds them before it runs out.

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
  // must not extend the period a second time. The claim is a conditional
  // UPDATE rather than a read-then-write, because grants are additive now:
  // two callbacks for the same payment ("confirmed" then "finished") landing
  // together would otherwise both see an unfulfilled order and both add days.
  const [claimed] = await db
    .update(nowpaymentsOrders)
    .set({ fulfilledAt: new Date() })
    .where(and(eq(nowpaymentsOrders.id, order.id), isNull(nowpaymentsOrders.fulfilledAt)))
    .returning({ id: nowpaymentsOrders.id });
  if (!claimed) {
    return NextResponse.json({ received: true, alreadyFulfilled: true });
  }

  try {
    await grantAccess({
      userId: order.userId,
      tier: order.tier,
      days: PERIOD_DAYS[order.period] ?? PERIOD_DAYS.monthly,
      provider: "nowpayments",
      paymentId: String(payload.payment_id),
      discountAccountId: order.discountAccountId,
    });
  } catch (err) {
    // Release the claim so NOWPayments' retry can grant what this one could not.
    await db
      .update(nowpaymentsOrders)
      .set({ fulfilledAt: null })
      .where(eq(nowpaymentsOrders.id, order.id));
    throw err;
  }

  return NextResponse.json({ received: true });
}
