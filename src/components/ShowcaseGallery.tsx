const slides = [
  {
    eyebrow: "01 · Regulation",
    title: "Every license,\nverified.",
    body: "FCA, ASIC, CySEC, and offshore registrations cross-checked against public registries before a broker earns a place on the list.",
    stat: "9",
    statLabel: "Regulators Tracked",
    tone: "signal" as const,
  },
  {
    eyebrow: "02 · Cost",
    title: "Spread and swap,\nside by side.",
    body: "Commission, spread, and overnight swap read together — not in isolation — so the real cost of holding a position is visible.",
    stat: "0.0",
    statLabel: "Pip From (Raw)",
    tone: "gold" as const,
  },
  {
    eyebrow: "03 · Platform",
    title: "MT4, MT5,\ncTrader tested.",
    body: "Execution speed, order types, and mobile parity checked on a live demo before any platform is scored.",
    stat: "3",
    statLabel: "Platforms Compared",
    tone: "signal" as const,
  },
  {
    eyebrow: "04 · Withdrawal",
    title: "The first payout\nis the real test.",
    body: "A small deposit, a real withdrawal request, and a stopwatch — trust is measured, not assumed.",
    stat: "24h",
    statLabel: "Fastest Payout Seen",
    tone: "gold" as const,
  },
];

export default function ShowcaseGallery() {
  return (
    <section className="relative overflow-hidden bg-ink-soft py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            Inside the Index
          </span>
          <h2 className="font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
            See <em className="font-poppins italic text-text-on-ink-muted">how</em> each score
            is earned.
          </h2>
        </div>
      </div>

      <div
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] md:px-[max(1.5rem,calc((100%-72rem)/2))] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {slides.map((slide) => (
          <article
            key={slide.eyebrow}
            role="listitem"
            className="group relative flex h-[420px] w-[300px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-3xl border border-hairline bg-ink p-7 sm:h-[440px] sm:w-[340px]"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[90px] transition-opacity duration-500 group-hover:opacity-80 ${
                slide.tone === "signal" ? "bg-signal/25" : "bg-gold/20"
              }`}
            />

            <div className="relative">
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
                  slide.tone === "signal" ? "text-signal" : "text-gold"
                }`}
              >
                {slide.eyebrow}
              </span>
              <h3 className="mt-4 whitespace-pre-line font-display text-2xl font-semibold leading-[1.15] text-text-on-ink">
                {slide.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-text-on-ink-muted">
                {slide.body}
              </p>
            </div>

            <div className="relative flex items-end justify-between border-t border-hairline pt-5">
              <div>
                <p
                  className={`font-display text-4xl font-semibold tabular-stat ${
                    slide.tone === "signal" ? "text-signal" : "text-gold"
                  }`}
                >
                  {slide.stat}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {slide.statLabel}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
