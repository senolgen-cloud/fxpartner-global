"use server";

import { db } from "@/db";
import { cashbackLeads } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { getAttribution } from "@/lib/visitor";

const NOTIFY_EMAIL = process.env.COMPLAINT_NOTIFY_EMAIL || "senolgen@gmail.com";

export type CashbackLeadState = { ok: boolean; error?: string };

export async function submitCashbackLead(
  _prevState: CashbackLeadState,
  formData: FormData
): Promise<CashbackLeadState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: "Lütfen ad ve soyadınızı girin." };
  }
  if (!phone || phone.length < 7) {
    return { ok: false, error: "Lütfen geçerli bir telefon numarası girin." };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Lütfen geçerli bir e-posta adresi girin." };
  }

  await db
    .insert(cashbackLeads)
    .values({ fullName, phone, email, ...(await getAttribution()) });

  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New cashback interest: ${fullName}`,
    html: `
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>Follow up to help them pick a broker and set up cashback tracking.</p>
    `,
  });

  return { ok: true };
}
