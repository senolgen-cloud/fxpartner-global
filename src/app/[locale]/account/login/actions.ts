"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { getBrokerBySlug } from "@/data/brokers";
import { getAttribution } from "@/lib/visitor";

export type SignInState = { ok: boolean; error?: string };

export async function submitSignIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const preferredBroker = String(formData.get("preferredBroker") || "").trim();

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: "Lütfen ad ve soyadınızı girin." };
  }
  if (!phone || phone.length < 5) {
    return { ok: false, error: "Lütfen geçerli bir telefon numarası girin." };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Lütfen geçerli bir e-posta adresi girin." };
  }
  if (preferredBroker && !getBrokerBySlug(preferredBroker)) {
    return { ok: false, error: "Lütfen geçerli bir aracı kurum seçin." };
  }

  // Save/refresh the profile before sending the magic link, so a brand
  // new sign-in already has a real name and phone number attached — the
  // Auth.js adapter reuses this row by email instead of creating a blank
  // one when the link is clicked.
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    await db
      .update(users)
      .set({
        name: fullName,
        phone,
        preferredBroker: preferredBroker || existing[0].preferredBroker,
      })
      .where(eq(users.email, email));
  } else {
    await db.insert(users).values({
      name: fullName,
      email,
      phone,
      preferredBroker: preferredBroker || null,
      ...(await getAttribution()),
    });
  }

  await signIn("resend", { email, redirectTo: "/account" });
  return { ok: true };
}
