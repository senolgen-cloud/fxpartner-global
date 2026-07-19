"use server";

import { db } from "@/db";
import { complaints } from "@/db/schema";
import { getBrokerBySlug, brokers } from "@/data/brokers";
import { auth } from "@/auth";
import { sendComplaintNotification } from "@/lib/notify";

export type ComplaintFormState = {
  ok: boolean;
  error?: string;
};

export async function submitComplaint(
  _prevState: ComplaintFormState,
  formData: FormData
): Promise<ComplaintFormState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const brokerSlug = String(formData.get("brokerSlug") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!fullName || !phone || !email || !brokerSlug || !description) {
    return { ok: false, error: "Please fill in every field." };
  }
  if (description.length < 20) {
    return { ok: false, error: "Please describe the issue in a bit more detail." };
  }

  const broker = getBrokerBySlug(brokerSlug);
  const brokerName = broker?.name || brokers.find((b) => b.slug === brokerSlug)?.name || brokerSlug;

  const session = await auth();

  await db.insert(complaints).values({
    userId: session?.user?.id ?? null,
    fullName,
    phone,
    email,
    brokerSlug,
    brokerName,
    description,
  });

  await sendComplaintNotification({ fullName, phone, email, brokerName, description });

  return { ok: true };
}
