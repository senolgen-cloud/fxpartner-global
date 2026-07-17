export default function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating} üzerinden 5 puan`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const half = i === full && hasHalf;
          return (
            <span key={i} className="relative inline-block text-base leading-none">
              <span className="text-hairline-light">★</span>
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden text-gold"
                  style={{ width: half ? "50%" : "100%" }}
                >
                  ★
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="tabular-stat font-mono text-sm text-text-muted">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
