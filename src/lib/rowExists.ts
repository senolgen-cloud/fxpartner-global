import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { educationPosts, newsBulletins, tradeSignals } from "@/db/schema";
import { hasDailyReport } from "@/lib/dailyReport";
import { SIGNALS_EPOCH } from "@/lib/signalPeriods";

/**
 * Whether a database-fed page exists, asked by the proxy before the body
 * streams.
 *
 * knownSlugs.ts covers the sections whose slugs live in the repository.
 * These four are rows, so until now a lesson, bulletin, trade or day that
 * did not exist rendered the not-found page under a 200 — a soft 404, and
 * one Search Console reports as such. Next's docs prescribe the same remedy
 * for both kinds: check the resource before the response starts, in the
 * proxy. For rows that means a query, so each check is the cheapest one
 * that answers the question: one indexed column, one row, nothing else.
 *
 * Each check must agree with its page's own notFound() condition. One that
 * says "missing" where the page would render 404s a real page; one that says
 * "exists" where the page would not just leaves the old soft 404 in place.
 * So each line below names the condition it mirrors.
 *
 * check-soft-404.mjs reads the keys of ROW_CHECKS, so a new database-fed
 * section is guarded by adding one line here.
 */
export const ROW_CHECKS: Record<string, (slug: string) => Promise<boolean>> = {
  // egitim/[slug]/page.tsx: getPost(slug), notFound() when absent.
  egitim: async (slug) =>
    Boolean(
      await db.query.educationPosts.findFirst({
        columns: { id: true },
        where: eq(educationPosts.slug, slug),
      })
    ),
  // haber-bulteni/[slug]/page.tsx: getBulletin(slug), notFound() when absent.
  "haber-bulteni": async (slug) =>
    Boolean(
      await db.query.newsBulletins.findFirst({
        columns: { id: true },
        where: eq(newsBulletins.slug, slug),
      })
    ),
  // signals/[ticket]/page.tsx: loadSignal(ticket) — no row, or a row from
  // before the record's reset date, is not a page.
  signals: async (ticket) =>
    Boolean(
      await db.query.tradeSignals.findFirst({
        columns: { id: true },
        where: and(eq(tradeSignals.ticket, ticket), gte(tradeSignals.createdAt, SIGNALS_EPOCH)),
      })
    ),
  // gun-sonu/[date]/page.tsx: load(date) — a day with no reportable trade.
  // Malformed and unfinished dates never get here; knownSlugs.ts 404s them.
  "gun-sonu": (date) => hasDailyReport(date),
};

// Pages found once stay found: lessons, bulletins and trades are not
// deleted, and a finished day's trades do not change. Remembering them
// keeps a popular lesson from costing a query on every view. Misses are
// never remembered, because the row may be published a minute from now.
const found = new Set<string>();
const FOUND_LIMIT = 5000;

/**
 * True only when the database says the row is not there. `path` is
 * locale-stripped, e.g. "/egitim/pip-nedir".
 *
 * Fails open. If the database cannot be asked, the request goes through to
 * the page, which renders or fails exactly as it did before this check
 * existed; a database outage must not turn every lesson into a 404.
 */
export async function isMissingRow(path: string, literal?: Set<string>): Promise<boolean> {
  const segments = path.split("/");
  // Only /<section>/<slug> itself. Deeper addresses under it (the day
  // report's opengraph-image) are judged by their own route.
  if (segments.length !== 3) return false;
  const [, section, slug] = segments;
  const check = ROW_CHECKS[section];
  if (!check || !slug || literal?.has(slug)) return false;

  const key = `${section}/${slug}`;
  if (found.has(key)) return false;
  try {
    const exists = await check(decodeURIComponent(slug));
    if (exists) {
      if (found.size >= FOUND_LIMIT) found.clear();
      found.add(key);
    }
    return !exists;
  } catch (error) {
    console.warn(`proxy: could not check ${key}, letting the page decide —`, error);
    return false;
  }
}
