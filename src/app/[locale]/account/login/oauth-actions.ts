"use server";

import { signIn } from "@/auth";

// A server action rather than a client-side signIn() call, so the OAuth
// redirect is issued by the server and the button still works with
// JavaScript disabled.
export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = String(formData.get("callbackUrl") || "/account");
  await signIn("google", { redirectTo: callbackUrl });
}
