import { tr, trf } from "@/lib/chrome";

/**
 * Says out loud that a section could not be loaded.
 *
 * The alternative is worse than it looks. Every list on this site already
 * has an empty state — "Henüz bülten yayınlanmadı" — and during a database
 * outage that sentence is simply false: there are ninety bulletins, they
 * just could not be read. A reader who is told there is nothing here does
 * not come back in ten minutes; a reader who is told the data is
 * temporarily unreachable does.
 *
 * So this is not decoration around a failure, it is the honest version of
 * the empty state, and pages pick between the two on the `unavailable`
 * flag from loadOptional() rather than on whether the list came back
 * empty.
 *
 * Quiet on purpose: hairline border, muted text, no red. The rest of the
 * page is fine and is worth reading, and an alarm bar across the top of it
 * would suggest otherwise.
 */
export default function DataUnavailable({
  /**
   * What is missing, in the reader's terms and already translated — the
   * caller passes tr("Yorumlar"), not "Yorumlar". It goes through trf's
   * named hole rather than being glued onto a fragment, because a sentence
   * assembled from two halves survives exactly one language.
   */
  what,
  className = "",
}: {
  what?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`rounded-lg border border-hairline-light bg-paper-high px-4 py-3 text-sm text-text-muted ${className}`}
    >
      <p>
        {what
          ? trf("{what} şu an alınamıyor.", { what })
          : tr("Bu bölüm şu an alınamıyor.")}{" "}
        {tr("Sayfanın geri kalanı güncel — birazdan tekrar deneyin.")}
      </p>
    </div>
  );
}
