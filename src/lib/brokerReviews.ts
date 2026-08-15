import { db } from "@/db";
import { comments } from "@/db/schema";
import { isNotNull } from "drizzle-orm";

export interface BrokerReviewStats {
  ratingValue: number;
  ratingCount: number;
}

// Real aggregate per broker, computed from actual rated comments — same
// logic as the per-broker aggregate on /brokers/[slug], just grouped across
// every broker in one query for list views (homepage rankings, category
// pages) instead of running one query per card.
export async function getBrokerReviewStats(): Promise<Record<string, BrokerReviewStats>> {
  const rated = await db
    .select({ brokerSlug: comments.brokerSlug, rating: comments.rating })
    .from(comments)
    .where(isNotNull(comments.rating));

  const bySlug = new Map<string, number[]>();
  for (const row of rated) {
    if (row.rating == null) continue;
    const list = bySlug.get(row.brokerSlug) ?? [];
    list.push(row.rating);
    bySlug.set(row.brokerSlug, list);
  }

  const stats: Record<string, BrokerReviewStats> = {};
  for (const [slug, ratings] of bySlug) {
    stats[slug] = {
      ratingValue: Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10,
      ratingCount: ratings.length,
    };
  }
  return stats;
}
