"use server";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { sendEmail } from "@/lib/email";

export type NewsletterFormState = {
  ok: boolean;
  error?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_EMAIL = process.env.COMPLAINT_NOTIFY_EMAIL || "senolgen@gmail.com";

export async function subscribeToNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const source = String(formData.get("source") || "").trim() || null;

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Lütfen geçerli bir e-posta adresi girin." };
  }

  await db.insert(newsletterSubscribers).values({ email, source }).onConflictDoNothing();

  try {
    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: "New newsletter subscriber",
      html: `<p><strong>Email:</strong> ${email}</p><p><strong>Source:</strong> ${source ?? "-"}</p>`,
    });
  } catch {
    // A failed admin-notification email must never block the actual
    // subscription — the row is already saved regardless.
  }

  return { ok: true };
}
