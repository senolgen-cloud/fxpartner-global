"use server";

import { signIn } from "@/auth";

export type SimpleSignInState = { ok: boolean; error?: string };

// Returning-member login — email only, no profile re-entry. Distinct from
// submitSignIn (actions.ts), which collects name/phone/broker for brand
// new members at /account/register. Before this split, every sign-in
// (even a returning member's) required refilling the full registration
// form just to get a magic link, which is exactly the kind of friction a
// separate "Giriş Yap" flow should avoid.
export async function submitLogin(
  _prevState: SimpleSignInState,
  formData: FormData
): Promise<SimpleSignInState> {
  const email = String(formData.get("email") || "").trim();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Lütfen geçerli bir e-posta adresi girin." };
  }

  await signIn("resend", { email, redirectTo: "/account" });
  return { ok: true };
}
