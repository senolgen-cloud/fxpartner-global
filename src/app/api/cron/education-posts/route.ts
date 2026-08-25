import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { educationPosts } from "@/db/schema";
import { educationTopics } from "@/lib/educationTopics";
import { generateEducationPost, slugifyEducation } from "@/lib/educationPost";
import { translateBulletin } from "@/lib/translateContent";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Haber & Editöryal Departmanı — see src/lib/departments.ts.
// PAUSED: workflow_dispatch only until compliance-brand signs off, per the
// rule that no automation goes from paused to active without that review.
// This one publishes generated prose under the site's name, which is
// squarely that department's business.
//
// Writes education posts from the fixed queue in lib/educationTopics.ts:
// earliest topic with no row yet, four per run by default.
//
// The queue is the point. Asked repeatedly for "a trading education post" a
// model converges — you get risk management eleven ways, each convinced it is
// the first. Drawing from a list that is consumed in order means the site
// never publishes the same article twice under two titles, and it means the
// run simply stops when the list runs out rather than inventing filler to
// hit a quota. A day with nothing new to say should publish nothing.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEFAULT_COUNT = 4;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export const GET = withCronErrorAlert("education-posts", async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requested = Number(searchParams.get("count") ?? DEFAULT_COUNT);
  const count = Number.isFinite(requested) ? Math.min(Math.max(1, requested), 6) : DEFAULT_COUNT;

  const existing = await db
    .select({ topic: educationPosts.topic, slug: educationPosts.slug })
    .from(educationPosts)
    .orderBy(desc(educationPosts.publishedAt));
  const used = new Set(existing.map((r) => r.topic));
  // Grows as this run writes, so two posts in the same batch cannot claim
  // the same slug either.
  const takenSlugs = new Set(existing.map((r) => r.slug));

  const queue = educationTopics.filter((t) => !used.has(t.id)).slice(0, count);
  if (queue.length === 0) {
    // Not an error. The list is finite by design; when it empties, someone
    // adds subjects worth writing about rather than the machine inventing
    // them.
    return NextResponse.json({
      ok: true,
      written: 0,
      reason: "topic queue empty — add subjects to lib/educationTopics.ts",
      totalTopics: educationTopics.length,
      alreadyPublished: used.size,
    });
  }

  const written: string[] = [];
  const skipped: { topic: string; reason: string }[] = [];

  for (const topic of queue) {
    const copy = await generateEducationPost(topic);
    if (!copy) {
      // generateEducationPost already logged why — a failed generation or a
      // post that broke the content rules. The topic stays unused, so the
      // next run tries it again.
      skipped.push({ topic: topic.id, reason: "generation rejected" });
      continue;
    }

    // Translated at write time, never per request: a reader waits on nobody's
    // model, and a bad translation is a row someone can edit.
    const translations = await translateBulletin(copy);

    const slug = slugifyEducation(topic.id, copy.title, takenSlugs);
    takenSlugs.add(slug);

    try {
      await db
        .insert(educationPosts)
        .values({
          slug,
          topic: topic.id,
          title: copy.title,
          excerpt: copy.excerpt,
          body: copy.body,
          translations: Object.keys(translations).length ? JSON.stringify(translations) : null,
        })
        .onConflictDoNothing();
      written.push(topic.id);
    } catch (err) {
      console.error(`education-posts: insert failed for ${topic.id}:`, err);
      skipped.push({ topic: topic.id, reason: "insert failed" });
    }
  }

  return NextResponse.json({
    ok: true,
    written: written.length,
    topics: written,
    skipped,
    remainingInQueue: educationTopics.length - used.size - written.length,
  });
});
