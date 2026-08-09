function wordForRating(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Great";
  if (rating >= 2.5) return "Average";
  return "Poor";
}

// Real-data equivalent of a Trustpilot-style rating badge — driven by the
// same aggregate (ratedComments) already computed for brokerFinancialServiceSchema,
// never a placeholder count. Renders nothing when there are no rated
// comments yet rather than showing a hollow "0 reviews" badge. Labeled as
// FXPARTNER's own community reviews, not "Verified Company" — that phrase
// implies third-party accreditation (like Trustpilot's own badge) that
// this site doesn't have.
export default function ReviewBadge({
  rating,
  count,
}: {
  rating: number;
  count: number;
}) {
  if (count === 0) return null;

  const full = Math.round(rating);

  return (
    <div className="inline-flex flex-col items-start gap-3 rounded-2xl border border-hairline bg-ink px-6 py-5 text-text-on-ink">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
          FXPARTNER kullanıcı puanı
        </p>
        <p className="mt-1 font-display text-3xl font-semibold leading-none">
          {wordForRating(rating)}
        </p>
      </div>

      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`flex h-7 w-7 items-center justify-center rounded-md border text-sm ${
              i < full
                ? "border-signal bg-signal/15 text-signal"
                : "border-hairline text-text-on-ink-muted"
            }`}
          >
            ★
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="tabular-stat font-mono text-sm font-semibold text-text-on-ink">
          {rating.toFixed(1)}
        </span>
        <span className="text-xs text-text-on-ink-muted">
          Based on {count} {count === 1 ? "review" : "reviews"}
        </span>
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-signal">
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6L12 2z" />
        </svg>
        FXPARTNER Community Reviews
      </span>
    </div>
  );
}
