"use server";

import { db } from "@/db";
import { partnerApplications } from "@/db/schema";
import { getBrokerBySlug } from "@/data/brokers";
import { auth } from "@/auth";
import { sendPartnerApplicationNotification } from "@/lib/notify";

export type PartnerApplicationFormState = {
  ok: boolean;
  error?: string;
};

export async function submitPartnerApplication(
  _prevState: PartnerApplicationFormState,
  formData: FormData
): Promise<PartnerApplicationFormState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const audienceType = String(formData.get("audienceType") || "").trim();
  const brokerSlug = String(formData.get("brokerSlug") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!fullName || !email || !phone || !country || !audienceType || !message) {
    return { ok: false, error: "Please fill in every field." };
  }
  if (message.length < 20) {
    return { ok: false, error: "Please tell us a bit more about your audience and plan." };
  }

  const broker = brokerSlug ? getBrokerBySlug(brokerSlug) : undefined;

  const session = await auth();

  await db.insert(partnerApplications).values({
    userId: session?.user?.id ?? null,
    fullName,
    email,
    phone,
    country,
    audienceType,
    brokerSlug: brokerSlug || null,
    message,
  });

  await sendPartnerApplicationNotification({
    fullName,
    email,
    phone,
    country,
    audienceType,
    brokerName: broker?.name,
    message,
  });

  return { ok: true };
}
