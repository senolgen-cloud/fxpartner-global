"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PERIOD_PRICE_USD, isBillingPeriod, type BillingPeriod, type PackageTier } from "@/lib/vip";
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
//
// Forms bind `tier` and, on /paketler, `period`; a form that binds only the
// tier (the /account upgrade button) gets its FormData in the second slot,
// so anything that is not a period we sell means monthly. A server action
// is a public endpoint all the same — never trust the argument.
export async function createNowPaymentsCheckout(
  tier: PackageTier,
  periodArg: BillingPeriod | FormData = "monthly"
) {
  const period: BillingPeriod = isBillingPeriod(periodArg) ? periodArg : "monthly";

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/account/login?callbackUrl=/paketler`);
  }

  const [order] = await db
    .insert(nowpaymentsOrders)
    .values({ userId: session.user.id, tier, period })
    .returning({ id: nowpaymentsOrders.id });

  const invoice = await createInvoice({
    orderId: order.id,
    amountUsd: PERIOD_PRICE_USD[period][tier],
    description: `FXPARTNER ${tier} paketi (${period === "quarterly" ? "3 ay" : "1 ay"})`,
    successUrl: `${siteUrl()}/paketler?checkout=success`,
    cancelUrl: `${siteUrl()}/paketler?checkout=cancelled`,
  });

  redirect(invoice.invoice_url);
}
