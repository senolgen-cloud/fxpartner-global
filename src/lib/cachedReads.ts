import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { tradeSignals, newsBulletins, educationPosts, comments, users } from "@/db/schema";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { getBrokerReviewStats } from "@/lib/brokerReviews";
import { SIGNALS_EPOCH } from "@/lib/signalPeriods";

/**
 * The database reads that many requests can share.
 *
 * Neon bills compute *time*, not queries, and it sleeps after a few minutes
 * idle. That makes the expensive thing on this site not the size of a query
 * but the number of times something wakes the database up — and the site
 * was waking it on almost every request. The worst of it was not even a
 * page: /signals polls /api/signals every fifteen seconds, so one tab left
 * open ran two queries a minute, forever, and the database never got to
 * sleep at all.
 *
 * None of that data is per-reader. The signal board is the same rows for
 * everybody (masking is applied afterwards, per viewer); the lesson list,
 * the bulletin list and the broker rating aggregates are the same for
 * everybody. So they are read once and shared.
 *
 * Not here, on purpose:
 *
 * - The session. It is per-reader by definition, and it is the one query
 *   that cannot be shared. It is also skipped entirely for a reader with no
 *   cookie, which is most of them.
 * - The article pages (/egitim/[slug], /haber-bulteni/[slug]). One query per
 *   article view, and their components call methods on the row's Date
 *   fields directly — see JsonSafe below for why that matters. Small prize,
 *   real risk.
 *
 * TIME-TO-LIVE IS THE FLOOR, NOT THE MECHANISM. Every entry carries a tag
 * and the code that writes the data clears it, so a new signal or a new
 * comment shows up at once rather than after the TTL. The TTL only bounds
 * how stale something can get if an invalidation is ever missed.
 * check-cache-tags.mjs makes sure every tag defined here has someone
 * clearing it.
 */

/** Tags, in one place because two spellings of a tag is a tag nobody clears. */
export const CACHE_TAGS = {
  signals: "signals",
  lessons: "lessons",
  bulletins: "bulletins",
  brokerComments: "broker-comments",
} as const;

/**
 * What survives unstable_cache unchanged.
 *
 * unstable_cache stores its value with JSON.stringify and returns it with
 * JSON.parse, so a Date goes in as a Date and comes back as a string. That
 * is the nastiest possible bug shape: the first request works, and every
 * request after it — the cache hits, the ones this exists to serve — gets a
 * string where the code expects a Date and dies on .toISOString().
 *
 * So the compiler refuses it. A cached read must convert its dates itself,
 * which every consumer below already wanted anyway: SignalsBoard declares
 * its props with string dates and revives them, and the list pages all call
 * new Date(...) at the point of use.
 */
type JsonSafe<T> = T extends Date
  ? never
  : T extends (infer U)[]
    ? JsonSafe<U>[]
    : T extends object
      ? { [K in keyof T]: JsonSafe<T[K]> }
      : T;

function cachedRead<A extends unknown[], R>(
  keyParts: string[],
  // The constraint lives on the argument rather than the type parameter:
  // `R extends JsonSafe<R>` is circular and TypeScript rejects it outright,
  // while this intersection turns a Date-typed field into `Date & never`
  // and refuses the function that returns it. Same rule, legal spelling.
  load: (...args: A) => Promise<R & JsonSafe<R>>,
  options: { revalidate: number; tags: string[] }
): (...args: A) => Promise<R> {
  return unstable_cache(load, keyParts, options);
}

/** A row's Date columns, as the ISO strings the readers all convert back. */
type WithIsoDates<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends Date ? string : T[P] extends Date | null ? string | null : T[P];
};

type SignalRow = typeof tradeSignals.$inferSelect;
export type SignalJson = WithIsoDates<SignalRow, "createdAt" | "closedAt">;

function signalToJson(s: SignalRow): SignalJson {
  return {
    ...s,
    createdAt: s.createdAt.toISOString(),
    closedAt: s.closedAt ? s.closedAt.toISOString() : null,
  };
}

/**
 * The whole signal board: open trades and the closed history behind the
 * published win rate.
 *
 * Unmasked, because masking depends on who is asking and this is shared by
 * everybody. Callers mask what they return — see maskLockedActiveSignal.
 * That is safe here and nowhere near the wire: this value never leaves the
 * server without going through a caller that masks it.
 */
export const cachedSignalBoard = cachedRead(
  // "-v2" because the cutoff below changes what these keys mean. Without the
  // bump, readers holding the pre-reset entry would keep being served the old
  // history until the TTL happened to expire.
  ["signal-board-v2"],
  async (closedLimit: number) => {
    const [active, closed] = await Promise.all([
      db.query.tradeSignals.findMany({
        // SIGNALS_EPOCH — the record starts on the reset date, and it is
        // applied in SQL rather than filtered afterwards so the pre-reset
        // rows are never read, paged or paid for.
        where: and(eq(tradeSignals.status, "active"), gte(tradeSignals.createdAt, SIGNALS_EPOCH)),
        orderBy: desc(tradeSignals.createdAt),
        limit: 30,
      }),
      db.query.tradeSignals.findMany({
        // On createdAt, not closedAt: a trade opened before the reset does
        // not join the new record by closing after it.
        where: and(eq(tradeSignals.status, "closed"), gte(tradeSignals.createdAt, SIGNALS_EPOCH)),
        orderBy: desc(tradeSignals.closedAt),
        limit: closedLimit,
      }),
    ]);
    return { active: active.map(signalToJson), closed: closed.map(signalToJson) };
  },
  { revalidate: 60, tags: [CACHE_TAGS.signals] }
);

/**
 * The hero card's signal: the newest open trade, or the newest closed one
 * between open trades so the card is never empty.
 */
export const cachedLatestSignal = cachedRead(
  ["latest-signal-v2"],
  async (): Promise<SignalJson | null> => {
    const row =
      (await db.query.tradeSignals.findFirst({
        where: and(eq(tradeSignals.status, "active"), gte(tradeSignals.createdAt, SIGNALS_EPOCH)),
        orderBy: desc(tradeSignals.createdAt),
      })) ??
      (await db.query.tradeSignals.findFirst({
        where: and(eq(tradeSignals.status, "closed"), gte(tradeSignals.createdAt, SIGNALS_EPOCH)),
        orderBy: desc(tradeSignals.closedAt),
      })) ??
      null;
    return row ? signalToJson(row) : null;
  },
  { revalidate: 60, tags: [CACHE_TAGS.signals] }
);

/**
 * Real per-broker aggregates from rated comments, for every list view at
 * once rather than one query per card.
 *
 * The aggregate itself still lives in lib/brokerReviews.ts, which owns the
 * subject; this only decides that the answer is shared. Tagged with the
 * comments tag rather than a ratings one, because a rating only ever
 * changes when somebody leaves or edits a comment.
 */
export const cachedBrokerReviewStats = cachedRead(
  ["broker-review-stats"],
  getBrokerReviewStats,
  { revalidate: 300, tags: [CACHE_TAGS.brokerComments] }
);

type LessonRow = typeof educationPosts.$inferSelect;
export type LessonJson = WithIsoDates<LessonRow, "publishedAt">;

/** The lesson index. Written twice a day by cron, read constantly. */
export const cachedLessonIndex = cachedRead(
  ["lesson-index"],
  async (limit: number): Promise<LessonJson[]> => {
    const rows = await db.query.educationPosts.findMany({
      orderBy: [asc(educationPosts.lessonNo), asc(educationPosts.publishedAt)],
      limit,
    });
    return rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() }));
  },
  { revalidate: 900, tags: [CACHE_TAGS.lessons] }
);

type BulletinRow = typeof newsBulletins.$inferSelect;
export type BulletinJson = WithIsoDates<BulletinRow, "publishedAt">;

/** The bulletin index. Same shape of thing as the lesson index. */
export const cachedBulletinIndex = cachedRead(
  ["bulletin-index"],
  async (limit: number): Promise<BulletinJson[]> => {
    const rows = await db.query.newsBulletins.findMany({
      orderBy: [desc(newsBulletins.publishedAt)],
      limit,
    });
    return rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() }));
  },
  { revalidate: 900, tags: [CACHE_TAGS.bulletins] }
);

/**
 * The comments under one broker review.
 *
 * Left join, not inner: commenting no longer requires an account, so a row's
 * author is either a real user (userName) or a guest (guestName) — an inner
 * join here would silently drop every guest comment.
 */
export const cachedBrokerComments = cachedRead(
  ["broker-comments"],
  async (slug: string) => {
    const rows = await db
      .select({
        id: comments.id,
        body: comments.body,
        rating: comments.rating,
        createdAt: comments.createdAt,
        userName: users.name,
        userCountry: users.country,
        guestName: comments.guestName,
        title: comments.title,
        experience: comments.experience,
        liked: comments.liked,
        improved: comments.improved,
        ratingPlatform: comments.ratingPlatform,
        ratingPricing: comments.ratingPricing,
        ratingService: comments.ratingService,
        ratingWithdrawal: comments.ratingWithdrawal,
        brokerReply: comments.brokerReply,
        brokerReplyAt: comments.brokerReplyAt,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.brokerSlug, slug))
      .orderBy(desc(comments.createdAt));

    return rows.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      brokerReplyAt: c.brokerReplyAt ? c.brokerReplyAt.toISOString() : null,
    }));
  },
  { revalidate: 300, tags: [CACHE_TAGS.brokerComments] }
);

export type BrokerCommentJson = Awaited<ReturnType<typeof cachedBrokerComments>>[number];

/** The community feed: the newest comments across every broker. */
export const cachedCommunityComments = cachedRead(
  ["community-comments"],
  async (limit: number) => {
    const rows = await db
      .select({
        id: comments.id,
        body: comments.body,
        rating: comments.rating,
        brokerSlug: comments.brokerSlug,
        createdAt: comments.createdAt,
        userName: users.name,
        userCountry: users.country,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt))
      .limit(limit);
    return rows.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }));
  },
  { revalidate: 300, tags: [CACHE_TAGS.brokerComments] }
);

export type CommunityCommentJson = Awaited<ReturnType<typeof cachedCommunityComments>>[number];
