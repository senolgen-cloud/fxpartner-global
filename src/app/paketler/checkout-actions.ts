"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { getTierPriceId, TIER_PRICE_USD, type PackageTier } from "@/lib/vip";
import { createInvoice } from "@/lib/nowpayments";
import { db } from "@/db";
import { nowpaymentsOrders } from "@/db/schema";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
}

export async function createPackageCheckoutSession(tier: PackageTier) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect(`/account/login?callbackUrl=/paketler`);
  }

  const priceId = getTierPriceId(tier);

  const checkout = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: session.user.id,
    subscription_data: {
      metadata: { userId: session.user.id, tier },
    },
    success_url: `${siteUrl()}/paketler?checkout=success`,
    cancel_url: `${siteUrl()}/paketler?checkout=cancelled`,
  });

  if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
  redirect(checkout.url);
}

// Crypto alternative to the Stripe checkout above. NOWPayments has no
// recurring-billing concept, so this creates one order/invoice for a single
// period; the IPN webhook (/api/webhooks/nowpayments) grants access once
// the payment actually confirms on-chain.
export async function createNowPaymentsCheckout(tier: PackageTier) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/account/login?callbackUrl=/paketler`);
  }

  const [order] = await db
    .insert(nowpaymentsOrders)
    .values({ userId: session.user.id, tier })
    .returning({ id: nowpaymentsOrders.id });

  const invoice = await createInvoice({
    orderId: order.id,
    amountUsd: TIER_PRICE_USD[tier],
    description: `FXPARTNER ${tier} paketi`,
    successUrl: `${siteUrl()}/paketler?checkout=success`,
    cancelUrl: `${siteUrl()}/paketler?checkout=cancelled`,
  });

  redirect(invoice.invoice_url);
}
