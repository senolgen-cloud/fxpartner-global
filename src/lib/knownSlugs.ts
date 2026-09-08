import { blogPosts } from "@/data/blog";
import { brokers, categoryInfo } from "@/data/brokers";
import { marketAnalysisPosts } from "@/data/marketAnalysis";
import { propFirms } from "@/data/propFirms";
import { isoToBulletinSlug, technicalAnalysisPosts } from "@/data/technicalAnalysis";

/**
 * Which slugs really exist, for the proxy to check before a response starts.
 *
 * WHY THIS IS NOT DONE IN THE PAGE. Every page here already calls
 * notFound() for a slug it cannot find, and that call cannot set the status
 * code: this whole tree renders dynamically (the layout reads the session),
 * a dynamic response is streamed, and streaming means the headers left the
 * server before the page ever looked the slug up. Next's own documentation
 * says so, and prescribes the remedy:
 *
 *   "If you need a 404 status ... ensure the resource exists before the
 *    response body is streamed ... You can run this check in proxy."
 *   — next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md
 *
 * Three cheaper fixes were tried against a production build first and none
 * of them moved the status off 200: deleting the [locale]/loading.tsx
 * Suspense boundary, dynamicParams = false on the slug segments (inert —
 * nothing in this tree is prerendered, so there is no static param list to
 * check against), and calling notFound() from generateMetadata. The proxy
 * is the only place left that runs before the first byte.
 *
 * WHY THE DATA IS IMPORTED RATHER THAN COPIED. These five modules are plain
 * data with no imports of their own, so this costs the proxy their bytes and
 * nothing else — no translation catalogue, no database, no build step. A
 * generated manifest would be smaller and would eventually go stale, and a
 * stale manifest here does not cause a soft 404, it 404s a real article.
 * Reading the same arrays the pages read cannot drift.
 *
 * WHAT IS DELIBERATELY MISSING. Only sections whose full set of slugs lives
 * in the repository are listed. /egitim, /haber-bulteni and /cashback are
 * fed from the database, and a proxy cannot know their slugs without a query
 * on every request; guessing would 404 content published after the last
 * deploy. Those keep the streamed 404 page, which Next marks noindex, so
 * they are not indexed either way — see check-soft-404.mjs, which fails if a
 * new slug route appears in neither list.
 */
export const KNOWN_SLUGS: Record<string, Set<string>> = {
  blog: new Set(blogPosts.map((p) => p.slug)),
  brokers: new Set(brokers.map((b) => b.slug)),
  // Category slugs are plain ASCII and live in the same module as the
  // brokers, so this line costs nothing the import above did not already
  // pay for. They are the untranslated slugs on purpose: the URL is the
  // same in every locale, only the page copy changes.
  categories: new Set(Object.values(categoryInfo).map((c) => c.slug)),
  "piyasa-analizi": new Set(marketAnalysisPosts.map((p) => p.slug)),
  "prop-firmalar": new Set(propFirms.map((f) => f.slug)),
  "teknik-analiz": new Set(technicalAnalysisPosts.map((p) => isoToBulletinSlug(p.publishedAt))),
};

/**
 * True when `path` addresses a guarded section with a slug that does not
 * exist. `path` is locale-stripped, e.g. "/blog/bir-yazi".
 *
 * Only the first segment after the section is checked, so a deeper page
 * under a real slug (/prop-firmalar/ftmo/indirim-kodu) is judged on the
 * slug, and the section index itself (/blog) is not judged at all.
 */
/**
 * Real pages that sit beside a [slug] route and are not slugs.
 *
 * /prop-firmalar/indirim-kodlari is a page in its own right; read as a
 * slug it is not a prop firm, and the first version of this check 404'd
 * it. Anything listed here is left for the router to handle normally.
 *
 * check-soft-404.mjs reads the route directories and fails if this map
 * and the filesystem disagree, so adding a sibling page to a guarded
 * section breaks the build here rather than quietly 404ing in production.
 */
export const LITERAL_ROUTES: Record<string, Set<string>> = {
  "prop-firmalar": new Set(["indirim-kodlari"]),
};

export function isUnknownSlug(path: string): boolean {
  const [, section, slug] = path.split("/");
  if (!section || !slug) return false;
  const known = KNOWN_SLUGS[section];
  if (!known) return false;
  if (LITERAL_ROUTES[section]?.has(slug)) return false;
  return !known.has(slug);
}
