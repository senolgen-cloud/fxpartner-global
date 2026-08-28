import { db } from "@/db";
import { telegramPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * How often a live signal is allowed to buzz a follower's phone.
 *
 * NOTHING IS EVER DROPPED. Every trade still posts to the channel, in full,
 * threaded exactly as before — this only decides whether the post also
 * pushes a notification. That distinction is the whole design: a channel's
 * problem is not how many messages it holds, it is how many times it
 * interrupts someone.
 *
 * The measurement that prompted it, on the day the copy account was
 * connected: 22 opens and 18 closes in twenty-four hours, one interruption
 * every thirty-six minutes, and rising — 14 a day across the month before,
 * 21 across the week, 40 on the day. Frequent trading is the point of a copy
 * account; broadcasting each one is not.
 *
 * An hour is a starting value, not a law. It caps audible alerts at 24 a day
 * in the worst case and, because trades arrive in bursts rather than evenly,
 * closer to a handful in practice. Tune it here.
 */
export const SIGNAL_ALERT_GAP_MS = 60 * 60 * 1000;

// Its own marker row, not the content dispatcher's. The two pace different
// things — that one decides whether an editorial post goes out at all, this
// one decides only whether a trade post makes a sound — and sharing a
// timestamp would make an article silence a signal.
const KEY = "signal-alert:last";

/**
 * True when this signal should ring. Records the time when it does, so the
 * next one inside the window stays quiet.
 *
 * Not idempotent by design: the caller asks once, immediately before
 * posting, and the answer is the decision.
 */
export async function shouldAlertForSignal(now: Date = new Date()): Promise<boolean> {
  const row = await db.query.telegramPosts.findFirst({
    where: eq(telegramPosts.key, KEY),
  });

  if (row && now.getTime() - row.postedAt.getTime() < SIGNAL_ALERT_GAP_MS) {
    return false;
  }

  await db
    .insert(telegramPosts)
    .values({ key: KEY, postedAt: now })
    .onConflictDoUpdate({ target: telegramPosts.key, set: { postedAt: now } });
  return true;
}
