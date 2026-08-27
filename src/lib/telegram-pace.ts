import { db } from "@/db";
import { telegramPosts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// One channel post every four hours, owner-set on 2026-08-27.
//
// Enforced by elapsed time in the database rather than by the cron
// schedule, because the schedule cannot be trusted: GitHub Actions runs a
// "*/5" workflow roughly hourly, and across the last twenty scheduled runs
// of telegram-cron the real gap averaged 55 minutes and reached 226. Fixed
// four-hour slots would fire late, early, or not at all, and a channel
// paced by that would clump two posts inside twenty minutes and then go
// quiet all evening. The dispatcher may therefore run as often as it
// likes; this gate is what actually decides.
export const CHANNEL_PACE_MS = 4 * 60 * 60 * 1000;

// A dedicated marker row rather than MAX(posted_at) over the whole table.
// telegram_post also holds push-dedup keys (broker-review-share writes
// push:broker-digest:<date>), so the maximum is not the same thing as "when
// the channel last received a post", and inferring one from the other would
// silence a legitimate post whenever a push happened to be marked.
const PACE_KEY = "channel-dispatch:last";

export type PaceState = {
  lastPostedAt: Date | null;
  sinceMs: number | null;
  openInMs: number;
};

export async function getPaceState(now: Date = new Date()): Promise<PaceState> {
  const row = await db.query.telegramPosts.findFirst({
    where: eq(telegramPosts.key, PACE_KEY),
  });
  if (!row) return { lastPostedAt: null, sinceMs: null, openInMs: 0 };

  const sinceMs = now.getTime() - row.postedAt.getTime();
  return {
    lastPostedAt: row.postedAt,
    sinceMs,
    openInMs: Math.max(0, CHANNEL_PACE_MS - sinceMs),
  };
}

export async function markChannelPosted(now: Date = new Date()): Promise<void> {
  await db
    .insert(telegramPosts)
    .values({ key: PACE_KEY, postedAt: now })
    .onConflictDoUpdate({ target: telegramPosts.key, set: { postedAt: now } });
}

// The rotation. Five sources over six slots a day means the order drifts
// from one day to the next, so no source is permanently stuck with the
// 04:00 slot.
//
// Every one of these returns { posted: boolean } and declines on its own
// when it has nothing new — blog-share when the queue is drained,
// market-analysis-share when today's piece already went out, news-update
// when no fresh item cleared the relevance filter. The dispatcher walks
// past a decline to the next source, so a quiet source costs the channel a
// different post, never an empty slot.
export const ROTATION = [
  "blog-share",
  "market-analysis-share",
  "broker-review-share",
  "news-update",
  "active-signals-digest",
  "campaign-digest",
] as const;

export type RotationSource = (typeof ROTATION)[number];

// Slot index from the clock instead of stored state: floor(epoch / 4h)
// advances once per pace window on its own, needs no row to keep in sync
// with reality, and cannot drift if a run is missed.
export function slotIndex(now: Date = new Date()): number {
  return Math.floor(now.getTime() / CHANNEL_PACE_MS) % ROTATION.length;
}

// The rotation starting at this slot, so the caller can try the intended
// source first and fall through in a stable order.
export function sourcesFromSlot(now: Date = new Date()): RotationSource[] {
  const start = slotIndex(now);
  return ROTATION.map((_, i) => ROTATION[(start + i) % ROTATION.length]);
}

// Kept for the diagnostics endpoint: how many rows the dedup table holds,
// which is the quickest signal that a source has silently stopped marking.
export async function countPostedKeys(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(telegramPosts);
  return row?.n ?? 0;
}
