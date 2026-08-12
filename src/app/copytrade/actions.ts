"use server";

import { sendCopytradeInquiryNotification } from "@/lib/notify";

export type CopytradeInquiryFormState = {
  ok: boolean;
  error?: string;
};

export async function submitCopytradeInquiry(
  _prevState: CopytradeInquiryFormState,
  formData: FormData
): Promise<CopytradeInquiryFormState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const platform = String(formData.get("platform") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!fullName || !email || !phone || !country || !platform) {
    return { ok: false, error: "Please fill in every field." };
  }

  await sendCopytradeInquiryNotification({
    fullName,
    email,
    phone,
    country,
    platform,
    message,
  });

  return { ok: true };
}
