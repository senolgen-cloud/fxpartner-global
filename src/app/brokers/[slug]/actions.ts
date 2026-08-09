"use server";

import { db } from "@/db";
import { comments } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type CommentFormState = { ok: boolean; error?: string };

export async function submitComment(
  brokerSlug: string,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  // Honeypot: a real visitor never sees or fills this field (hidden via
  // CSS in CommentForm); a bot filling every input in the form will.
  if (String(formData.get("website") || "").trim()) {
    return { ok: true };
  }

  const session = await auth();
  const body = String(formData.get("body") || "").trim();
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw ? Number(ratingRaw) : null;
  const guestName = String(formData.get("guestName") || "").trim();

  if (!session?.user?.id && !guestName) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!body || body.length < 5) {
    return { ok: false, error: "Please write a bit more before submitting." };
  }

  await db.insert(comments).values({
    brokerSlug,
    userId: session?.user?.id ?? null,
    guestName: session?.user?.id ? null : guestName.slice(0, 60),
    body,
    rating: rating && rating >= 1 && rating <= 5 ? rating : null,
  });

  revalidatePath(`/brokers/${brokerSlug}`);
  return { ok: true };
}
