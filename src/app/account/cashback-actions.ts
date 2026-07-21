"use server";

import { db } from "@/db";
import { cashbackAccounts } from "@/db/schema";
import { auth } from "@/auth";
import { cashbackPrograms } from "@/data/cashback";
import { getBrokerBySlug } from "@/data/brokers";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const NOTIFY_EMAIL = process.env.COMPLAINT_NOTIFY_EMAIL || "senolgen@gmail.com";

export type LinkAccountState = { ok: boolean; error?: string };

export async function linkCashbackAccount(
  _prevState: LinkAccountState,
  formData: FormData
): Promise<LinkAccountState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Please sign in first." };
  }

  const brokerSlug = String(formData.get("brokerSlug") || "").trim();
  const accountNumber = String(formData.get("accountNumber") || "").trim();

  if (!cashbackPrograms.some((p) => p.brokerSlug === brokerSlug)) {
    return { ok: false, error: "Please select a valid broker." };
  }
  if (!accountNumber || accountNumber.length < 3) {
    return { ok: false, error: "Please enter a valid account number." };
  }

  await db.insert(cashbackAccounts).values({
    userId: session.user.id,
    brokerSlug,
    accountNumber,
    fullName: session.user.name || session.user.email || "FXPARTNER member",
    email: session.user.email || "",
  });

  const brokerName = getBrokerBySlug(brokerSlug)?.name || brokerSlug;
  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New cashback account link: ${brokerName}`,
    html: `
      <p><strong>User:</strong> ${session.user.email}</p>
      <p><strong>Broker:</strong> ${brokerName}</p>
      <p><strong>Account number:</strong> ${accountNumber}</p>
      <p>Verify this against your IB/partner dashboard, then mark it verified in the admin panel.</p>
    `,
  });

  revalidatePath("/account");
  return { ok: true };
}
