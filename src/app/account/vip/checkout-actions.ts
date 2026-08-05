"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { vipSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { getVipPriceId, hasVerifiedCashbackAccount } from "@/lib/vip";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
}

export async function createVipCheckoutSession() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/account/login?callbackUrl=/account/vip");
  }

  const { eligible, accountId } = await hasVerifiedCashbackAccount(session.user.id);
  const priceId = getVipPriceId(eligible);

  const checkout = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: session.user.id,
    subscription_data: {
      metadata: {
        userId: session.user.id,
        discountAccountId: accountId ?? "",
      },
    },
    success_url: `${siteUrl()}/account/vip?checkout=success`,
    cancel_url: `${siteUrl()}/account/vip?checkout=cancelled`,
  });

  if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
  redirect(checkout.url);
}

export async function createBillingPortalSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=/account/vip");

  const [row] = await db
    .select({ stripeCustomerId: vipSubscriptions.stripeCustomerId })
    .from(vipSubscriptions)
    .where(eq(vipSubscriptions.userId, session.user.id))
    .limit(1);

  if (!row?.stripeCustomerId) {
    throw new Error("No Stripe customer found for this account yet");
  }

  const portal = await getStripe().billingPortal.sessions.create({
    customer: row.stripeCustomerId,
    return_url: `${siteUrl()}/account/vip`,
  });

  redirect(portal.url);
}
