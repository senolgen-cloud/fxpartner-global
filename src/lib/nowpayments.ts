import { createHmac } from "crypto";

const API_BASE = "https://api.nowpayments.io/v1";

function apiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error("NOWPAYMENTS_API_KEY is not set");
  return key;
}

export interface NowPaymentsInvoice {
  id: string;
  invoice_url: string;
}

// Creates a hosted invoice (NOWPayments' own checkout page — buyer picks
// their coin there) for a one-time payment. NOWPayments has no native
// recurring-subscription product comparable to Stripe's, so each VIP
// period is its own invoice tied back to our own order via order_id.
export async function createInvoice(params: {
  orderId: string;
  amountUsd: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<NowPaymentsInvoice> {
  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: params.amountUsd,
      price_currency: "usd",
      order_id: params.orderId,
      order_description: params.description,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`NOWPayments invoice creation failed: ${res.status} ${errText}`);
  }

  return res.json();
}

// NOWPayments' IPN payloads are signed by HMAC-SHA512 over the JSON body
// with keys sorted alphabetically (their requirement, not standard
// JSON.stringify order) — see https://documenter.getpostman.com/view/7907941/2s93JusNJt
// "Instant Payments Notifications" for the exact algorithm.
export function verifyIpnSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signatureHeader) return false;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }

  const sorted = sortKeysDeep(parsed);
  const expected = createHmac("sha512", secret).update(JSON.stringify(sorted)).digest("hex");
  return expected === signatureHeader;
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeysDeep(v)])
    );
  }
  return value;
}

// Statuses NOWPayments considers a completed, funds-received payment.
// "confirmed" and "finished" are both used depending on the coin/flow.
export const NOWPAYMENTS_SUCCESS_STATUSES = new Set(["confirmed", "finished"]);
