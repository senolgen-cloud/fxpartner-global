/**
 * Data a page wants and can, at a push, render without.
 *
 * On 2026-08-31 the database hit its compute quota and every read against
 * it threw for eleven hours. Nothing in the app caught that, so a query
 * that was one section of a page took the whole page with it: the home
 * page died over its signal card, /brokerlar over its rating badges,
 * /brokers/[slug] over its comment list. A reader got a black screen with
 * an error id on it — no header, no broker list, no way on. All of that
 * content was sitting in the repo and needed no database at all.
 *
 * So the rule this encodes: a page fails only over the thing it exists to
 * show. A missing section is a missing section; it is not a dead page.
 *
 * Deliberately NOT for:
 *
 * - The row a page is *about* — a lesson at /egitim/[slug], a bulletin at
 *   /haber-bulteni/[slug]. Rendering an empty article shell there would be
 *   a lie to a reader and, worse, a 200 to a crawler that would happily
 *   index the emptiness. Those still throw, into the error boundary at
 *   [locale]/error.tsx, which is a branded, translated page inside the
 *   site chrome rather than a black screen with an error id on it.
 * - Writes, and the reads a write decides on. Swallowing an error in a
 *   server action means telling somebody their comment was posted when it
 *   was not.
 * - Cron routes. Nobody is looking at those; a silent failure there is a
 *   job that quietly stops doing its work.
 *
 * `unavailable` is returned rather than inferred from an empty result
 * because the two are genuinely different — a broker with no comments yet
 * and a broker whose comments could not be read look identical in the
 * data, and only one of them is worth apologising for. Pages pass it to
 * <DataUnavailable /> so the gap is admitted rather than papered over.
 */
import { unstable_rethrow } from "next/navigation";

export type Optional<T> = {
  data: T;
  /** True when the load failed and `data` is the fallback, not the truth. */
  unavailable: boolean;
};

export async function loadOptional<T>(
  what: string,
  fallback: T,
  load: () => Promise<T>
): Promise<Optional<T>> {
  try {
    return { data: await load(), unavailable: false };
  } catch (err) {
    // Next signals notFound(), redirect() and "this page is dynamic" by
    // throwing, so a bare catch here would swallow control flow and not an
    // outage. That is not theoretical: the first version of this caught the
    // dynamic-rendering marker and the build began trying to prerender
    // pages that read cookies. unstable_rethrow puts Next's own errors back
    // in the air and lets everything else through.
    unstable_rethrow(err);
    // Loud on the way past. A section that quietly disappeared and told
    // nobody would be a worse bug than the one this avoids.
    console.error(`${what} unavailable, rendering without it —`, err);
    return { data: fallback, unavailable: true };
  }
}
