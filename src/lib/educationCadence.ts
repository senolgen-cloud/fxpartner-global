/**
 * How often the Akademi publishes, and nothing else.
 *
 * Its own module rather than a corner of educationPost.ts, and the reason
 * is the check: scripts/check-education-cadence.mjs runs these functions
 * for real, and a policy file that imports the Gemini client and the broker
 * catalogue cannot be run outside the app. Pure arithmetic, no imports,
 * exercised rather than read.
 */
/**
 * Two lessons a day.
 *
 * Four was five times the blog's hand-written rate and the shape that
 * scaled-content guidance is written about; two is closer to the site's own
 * pace and still fills the queue for about five weeks.
 */
export const DAILY_LESSON_TARGET = 2;

/**
 * How many lessons this run may still publish today.
 *
 * The cron used to fire once a day, and GitHub's scheduled runs are
 * best-effort: over the six days to 2026-08-31 every run landed hours off
 * its 07:40 slot — 08:22, 18:24, 19:34, 13:21, 13:17 — and the last one was
 * dropped entirely, so a day went by with no lesson at all. The hourly
 * dispatcher never had that problem, because a missed hour is retried an
 * hour later.
 *
 * So the job attempts several times a day and this decides whether an
 * attempt does anything. That only works if publishing is idempotent per
 * day, which is what this makes it: the second attempt of a day on which
 * the quota is already met writes nothing and says so.
 *
 * A missed day stays missed — the count is today's, not a backlog. Four
 * lessons published at once to make up for yesterday would be precisely the
 * burst the cadence was set to avoid.
 */
export function lessonsAllowedNow(publishedToday: number, requested: number): number {
  const remaining = Math.max(0, DAILY_LESSON_TARGET - publishedToday);
  return Math.min(remaining, Math.max(0, requested));
}

/** Midnight UTC today. The whole app runs on UTC — see instrumentation.ts. */
export function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
