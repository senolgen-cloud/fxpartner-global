import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cachedReads";
import { db } from "@/db";
import { educationPosts } from "@/db/schema";
import { educationTopics } from "@/lib/educationTopics";
import { generateEducationPost, slugifyEducation } from "@/lib/educationPost";
import { DAILY_LESSON_TARGET, lessonsAllowedNow, startOfUtcDay } from "@/lib/educationCadence";
import { translateBulletin } from "@/lib/translateContent";
import { withCronErrorAlert } from "@/lib/cron-wrapper";

// Owned by Haber & Editöryal Departmanı — see src/lib/departments.ts.
// ACTIVE since 2026-08-25, twice a day, after the compliance-brand review
// this was paused for. What that review checked, and found:
//   - Both /egitim and /egitim/[slug] already carry the "yatırım tavsiyesi
//     değildir" line; the article page also names leverage risk.
//   - The prompt states six rules but only one of them — the return promise
//     — had a mechanical check behind it. Three more now do: a market call
//     (an instrument name sitting near a direction), a statistic with a
//     source attached, and any broker from the catalogue by name.
//   - Three posts generated from the real queue passed all of it.
// Open, and the owner's call rather than this file's: the pages do not say
// the prose is machine-written.
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

// The cadence lives in lib/educationPost.ts, next to the rule that enforces
// it. This route decides nothing about how often the site publishes; it
// asks.
const DEFAULT_COUNT = DAILY_LESSON_TARGET;

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
    .select({
      topic: educationPosts.topic,
      slug: educationPosts.slug,
      publishedAt: educationPosts.publishedAt,
    })
    .from(educationPosts)
    .orderBy(desc(educationPosts.publishedAt));

  // Counted from the rows already fetched rather than with a second query:
  // this route runs several times a day now and most of those runs do
  // nothing, so the cheap path should stay one wakeup, not two.
  const dayStart = startOfUtcDay();
  const publishedToday = existing.filter((r) => r.publishedAt >= dayStart).length;
  const allowed = lessonsAllowedNow(publishedToday, count);
  if (allowed === 0) {
    // The ordinary outcome of a catch-up run, and not an error. See
    // lessonsAllowedNow for why the job attempts more often than it writes.
    return NextResponse.json({
      ok: true,
      written: 0,
      reason: "today's lessons are already published",
      publishedToday,
      dailyTarget: DAILY_LESSON_TARGET,
    });
  }

  const used = new Set(existing.map((r) => r.topic));
  // Grows as this run writes, so two posts in the same batch cannot claim
  // the same slug either.
  const takenSlugs = new Set(existing.map((r) => r.slug));
  // Lessons are numbered by how many exist, not by where the topic sits in
  // the queue: a subject retired from the list must not renumber a lesson
  // somebody has already been sent a link to.
  let nextLesson = existing.length + 1;

  const queue = educationTopics.filter((t) => !used.has(t.id)).slice(0, allowed);
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
          lessonNo: nextLesson,
          topic: topic.id,
          title: copy.title,
          excerpt: copy.excerpt,
          body: copy.body,
          translations: Object.keys(translations).length ? JSON.stringify(translations) : null,
        })
        .onConflictDoNothing();
      // The lesson index is read once and shared (lib/cachedReads.ts), so a
      // newly published lesson has to clear it or it stays invisible on
      // /egitim until the TTL runs out.
      revalidateTag(CACHE_TAGS.lessons, "max");
      written.push(topic.id);
      nextLesson++;
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
