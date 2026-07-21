"use server";

import { db } from "@/db";
import { cashbackAccounts } from "@/db/schema";
import { auth } from "@/auth";
import { getCashbackProgram } from "@/data/cashback";
import { getBrokerBySlug } from "@/data/brokers";
import { sendEmail } from "@/lib/email";

const NOTIFY_EMAIL = process.env.COMPLAINT_NOTIFY_EMAIL || "senolgen@gmail.com";

export type SetupState = { ok: boolean; error?: string };

export async function submitCashbackSetup(
  brokerSlug: string,
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  const program = getCashbackProgram(brokerSlug);
  const broker = getBrokerBySlug(brokerSlug);
  if (!program || !broker) {
    return { ok: false, error: "This broker isn't part of the cashback program." };
  }

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const accountNumber = String(formData.get("accountNumber") || "").trim();
  const marketingOptIn = formData.get("marketingOptIn") === "on";

  if (!fullName || fullName.length < 2) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!accountNumber || accountNumber.length < 3) {
    return { ok: false, error: "Please enter a valid trading account number." };
  }

  const session = await auth();

  await db.insert(cashbackAccounts).values({
    userId: session?.user?.id ?? null,
    brokerSlug,
    fullName,
    email,
    accountNumber,
    marketingOptIn,
  });

  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New cashback signup: ${broker.name}`,
    html: `
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Broker:</strong> ${broker.name}</p>
      <p><strong>Account number:</strong> ${accountNumber}</p>
      <p><strong>Marketing opt-in:</strong> ${marketingOptIn ? "Yes" : "No"}</p>
      <p><strong>Signed-in user:</strong> ${session?.user?.email ?? "Not signed in"}</p>
      <p>Verify this against your IB/partner dashboard, then mark it verified in the admin panel.</p>
    `,
  });

  return { ok: true };
}
