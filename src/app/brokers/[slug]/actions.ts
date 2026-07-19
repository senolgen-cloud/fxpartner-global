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
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Please sign in to leave a comment." };
  }

  const body = String(formData.get("body") || "").trim();
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw ? Number(ratingRaw) : null;

  if (!body || body.length < 5) {
    return { ok: false, error: "Please write a bit more before submitting." };
  }

  await db.insert(comments).values({
    brokerSlug,
    userId: session.user.id,
    body,
    rating: rating && rating >= 1 && rating <= 5 ? rating : null,
  });

  revalidatePath(`/brokers/${brokerSlug}`);
  return { ok: true };
}
