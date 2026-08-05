import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { db } from "@/db";
import { users, vipSubscriptions, type VipSubscriptionStatus } from "@/db/schema";
import { eq } from "drizzle-orm";

// Stripe's source of truth for subscription state — Checkout only tells us
// a session completed, the subscription object itself carries price/status/
// metadata, so checkout.session.completed re-fetches it rather than trusting
// fields off the session.
async function upsertSubscription(
  userId: string,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const status = mapStatus(subscription.status);
  const discountAccountId = subscription.metadata?.discountAccountId || null;
  const periodEndSeconds = subscription.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null;

  await db
    .insert(vipSubscriptions)
    .values({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status,
      discountAccountId,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: vipSubscriptions.userId,
      set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status,
        discountAccountId,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  await syncIsVipCache(userId);
}

// users.isVip is a cached read-only-for-UI flag, kept in lockstep with the
// authoritative vipSubscriptions row here — nothing else should write it.
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

function mapStatus(stripeStatus: Stripe.Subscription.Status): VipSubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "incomplete";
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // Signature verification needs the exact raw bytes Stripe signed — must
  // read as text before any JSON parsing touches the request body.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (!userId || !subscriptionId || !customerId) break;

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        await upsertSubscription(userId, customerId, subscription);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        if (!userId) break;
        await upsertSubscription(userId, customerId, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db
          .update(vipSubscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(vipSubscriptions.stripeSubscriptionId, subscription.id));
        const userId = subscription.metadata?.userId;
        if (userId) await syncIsVipCache(userId);
        break;
      }

      case "invoice.payment_failed": {
        // Access is intentionally NOT revoked here — kept through
        // currentPeriodEnd (Stripe's own retry/dunning window). Only the
        // subsequent subscription.updated/deleted event, if the
        // subscription actually lapses, revokes access.
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : invoice.parent?.subscription_details?.subscription?.id;
        if (!subscriptionId) break;
        await db
          .update(vipSubscriptions)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(vipSubscriptions.stripeSubscriptionId, subscriptionId));
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
