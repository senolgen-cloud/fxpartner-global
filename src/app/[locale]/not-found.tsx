import NotFoundBody from "@/components/NotFoundBody";
import { getServerLocale } from "@/lib/serverLocale";

/**
 * What a page's own notFound() renders: a lesson, bulletin or signal whose
 * row does not exist. It sits under the locale layout, so the header and
 * footer stay around it and the reader is still in their own language.
 *
 * Addresses that match no route at all never reach this file — the root
 * layout is the [locale] segment, so Next has no layout to put them in.
 * Those, and the unknown slugs proxy.ts rewrites to /_bulunamadi, are
 * answered by app/global-not-found.tsx with a real 404 status.
 */
export default function LocaleNotFound() {
  return <NotFoundBody locale={getServerLocale()} />;
}
