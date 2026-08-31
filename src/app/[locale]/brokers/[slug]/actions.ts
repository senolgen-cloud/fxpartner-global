"use server";

import { db } from "@/db";
import { comments } from "@/db/schema";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cachedReads";

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

  // Structured fields. All optional — the overall verdict plus a score is
  // still a complete review, and demanding six answers to leave one would
  // cost more reviews than the extra detail is worth.
  const optionalText = (key: string, max: number) => {
    const v = String(formData.get(key) || "").trim();
    return v ? v.slice(0, max) : null;
  };
  const axisScore = (key: string) => {
    const n = Number(formData.get(key));
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
  };
  // Only values the form actually offers are stored, so a crafted post
  // cannot write an arbitrary string into a field the page renders.
  const experienceRaw = String(formData.get("experience") || "").trim();
  const experience = ["<1", "1-3", "3-5", "5+"].includes(experienceRaw) ? experienceRaw : null;

  await db.insert(comments).values({
    brokerSlug,
    userId: session?.user?.id ?? null,
    guestName: session?.user?.id ? null : guestName.slice(0, 60),
    body,
    rating: rating && rating >= 1 && rating <= 5 ? rating : null,
    title: optionalText("title", 120),
    experience,
    liked: optionalText("liked", 2000),
    improved: optionalText("improved", 2000),
    ratingPlatform: axisScore("ratingPlatform"),
    ratingPricing: axisScore("ratingPricing"),
    ratingService: axisScore("ratingService"),
    ratingWithdrawal: axisScore("ratingWithdrawal"),
  });

  revalidatePath(`/brokers/${brokerSlug}`);
  // revalidatePath alone does not reach the shared comment read — that is a
  // tagged cache, and it also feeds the rating aggregate on /brokerlar and
  // the home ranking, which are not this path. See lib/cachedReads.ts.
  revalidateTag(CACHE_TAGS.brokerComments, "max");
  return { ok: true };
}
