"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TIER_PRICE_USD, type PackageTier } from "@/lib/vip";
import { createInvoice } from "@/lib/nowpayments";
import { db } from "@/db";
import { nowpaymentsOrders } from "@/db/schema";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
}

// NOWPayments is the only checkout rail — Stripe doesn't support Turkey, so
// there is no card path to fall back to. NOWPayments has no recurring-billing
// concept either, so this creates one order/invoice for a single period; the
// IPN webhook (/api/webhooks/nowpayments) grants access once the payment
// actually confirms on-chain.
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
