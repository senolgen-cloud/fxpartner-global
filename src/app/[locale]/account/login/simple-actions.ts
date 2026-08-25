"use server";

import { signIn } from "@/auth";
import { defaultLocale, isLocale, localePath } from "@/lib/i18n";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  // Country is optional and arrives only from the register form. Saved
  // before the link is sent so a member who never comes back still leaves us
  // the one field that decides which brokers and signals apply to them.
  const country = String(formData.get("country") || "").trim();
  if (country) {
    await db
      .update(users)
      .set({ country })
      .where(eq(users.email, email))
      .catch(() => {
        // A brand new address has no row yet; the adapter creates it when the
        // link is used, and /account can ask again. Not worth failing sign-in.
      });
  }

  // Where the link lands. Without redirectTo, Auth.js falls back to the
  // Referer header (see next-auth/lib/actions), which is the login or
  // register page the form was posted from — so a member who clicked the
  // link in their mail was signed in and then handed straight back to the
  // form they had just filled in, looking like the sign-in had failed.
  const rawLocale = String(formData.get("locale") || "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  // redirect: false so the caller can render "check your inbox" in place
  // instead of bouncing to the stock Auth.js verify page.
  await signIn("resend", {
    email,
    redirect: false,
    redirectTo: localePath(locale, "/account"),
  });
  return { ok: true };
}
