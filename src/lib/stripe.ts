import Stripe from "stripe";

let client: Stripe | null = null;

// Lazy singleton, same shape as email.ts's getClient() — avoids throwing at
// module-import time (which would crash every route that imports this file,
// even ones that never call Stripe) if the key isn't set yet.
export function getStripe(): Stripe {
  if (!client) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(apiKey);
  }
  return client;
}
