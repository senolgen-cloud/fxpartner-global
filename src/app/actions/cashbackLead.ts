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
  const consent = String(formData.get("consent") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: "Lütfen ad ve soyadınızı girin." };
  }
  // Optional, and validated only when given. A mandatory phone number on a
  // public lead form is the loudest "this is a funnel" signal a wary reader
  // meets, and the cashback setup works from an e-mail address. The column
  // is NOT NULL, so an omitted number is stored as an empty string rather
  // than requiring a migration to express "not given".
  if (phone && phone.length < 7) {
    return { ok: false, error: "Lütfen geçerli bir telefon numarası girin veya alanı boş bırakın." };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Lütfen geçerli bir e-posta adresi girin." };
  }
  // Checked here as well as in the form. The checkbox carries the KVKK
  // consent this record depends on, and a `required` attribute is a
  // client-side courtesy that any POST can skip — a lead stored without
  // consent is a lead we are not allowed to contact.
  if (!consent) {
    return { ok: false, error: "Devam etmek için bilgilerinizin işlenmesini onaylamanız gerekiyor." };
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
