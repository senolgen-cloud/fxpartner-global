"use client";

import { useEffect } from "react";
import { useTr } from "@/components/useTr";
import Link from "@/components/LocaleLink";

/**
 * What a reader sees when a page fails.
 *
 * Until this file existed, they saw Next's default: a black screen, the
 * words "A server error occurred", and an eight-digit id. No header, no
 * navigation, nothing to do next, and — on a site that publishes in four
 * languages — nothing in theirs. That is what the 2026-08-31 database
 * outage actually looked like to the people it hit.
 *
 * This boundary sits under the locale layout, so the header, the footer
 * and the locale context are all still around it: the page fails, the site
 * does not. The reader gets a sentence in their own language, a retry
 * button, and the way back to the rest of the site.
 *
 * Everything a page can render without now degrades in place (see
 * lib/dbOptional.ts), so an error that reaches here is a page that
 * genuinely could not be produced — a lesson whose row is unreachable,
 * say. What it must not do is invent one: an empty article shell returned
 * as if it were the lesson would be a lie to the reader and, to a crawler,
 * an invitation to index the emptiness under that URL. A visible failure
 * is the honest answer for a page that is only its missing row.
 *
 * The status code is Next's to decide and is left alone. In practice a
 * dynamic page has usually flushed its shell before the failing query
 * resolves, so the response is already a 200 and this renders into it on
 * the client — which is exactly where the old default error screen came
 * from. Nothing here can change that after the fact, and faking either
 * status would be worse than reporting what happened.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTr();

  useEffect(() => {
    // The digest is the only thread between what the reader saw and the
    // line in the runtime log, so it goes to the console rather than
    // staying in a prop nobody reads.
    console.error("page failed:", error.digest ?? "(no digest)", error);
  }, [error]);

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-5 px-6 py-24">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
          {t("Geçici bir sorun")}
        </span>
        <h1 className="text-2xl font-semibold text-text-dark sm:text-3xl">
          {t("Bu sayfa şu an yüklenemedi")}
        </h1>
        <p className="text-text-muted">
          {t(
            "Hata bizde, sizde değil. Sayfa birkaç dakika içinde geri gelir; sitenin geri kalanı çalışmaya devam ediyor."
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-text-on-ink transition-colors hover:bg-signal-strong"
          >
            {t("Tekrar dene")}
          </button>
          {/* LocaleLink, not a bare anchor: a Ukrainian reader who hits
              this page should land back on /ua, not on the Turkish tree. */}
          <Link
            href="/"
            className="rounded-md border border-hairline-light px-4 py-2 text-sm text-text-dark transition-colors hover:border-signal"
          >
            {t("Ana sayfaya dön")}
          </Link>
        </div>
        {error.digest && (
          // Not for the reader — for the person they tell about it. A
          // support message with this number in it can be found in the
          // logs; one without it cannot.
          <p className="font-mono text-xs text-text-muted">
            {t("Hata kodu")}: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
