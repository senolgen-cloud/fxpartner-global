import { db } from "@/db";
import { telegramPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

// DB-backed alternative to posted-store.ts (which requires Upstash) —
// for crons that don't need Redis's sorted-set/translation-adjacent
// features, just a simple "have we posted this key before" check.
export async function isAlreadyPostedToTelegram(key: string): Promise<boolean> {
  const row = await db.query.telegramPosts.findFirst({
    where: eq(telegramPosts.key, key),
  });
  return !!row;
}

export async function markPostedToTelegram(key: string): Promise<void> {
  await db.insert(telegramPosts).values({ key }).onConflictDoNothing();
}
