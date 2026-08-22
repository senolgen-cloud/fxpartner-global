import { tr } from "@/lib/chrome";
const slides = [
  {
    eyebrow: "01 · Regülasyon",
    title: "Her lisans,\ndoğrulandı.",
    body: "FCA, ASIC, CySEC ve offshore kayıtlar, bir broker listeye girmeden önce kamuya açık sicillerle çapraz kontrol edilir.",
    stat: "9",
    statLabel: "Takip Edilen Regülatör",
    tone: "signal" as const,
  },
  {
    eyebrow: "02 · Maliyet",
    title: "Spread ve swap,\nyan yana.",
    body: "Komisyon, spread ve gecelik swap birlikte — tek başına değil — değerlendirilir; böylece bir pozisyonu tutmanın gerçek maliyeti görünür.",
    stat: "0.0",
    statLabel: "Pip'ten İtibaren (Ham)",
    tone: "gold" as const,
  },
  {
    eyebrow: "03 · Platform",
    title: "MT4, MT5,\ncTrader test edildi.",
    body: "Herhangi bir platform puanlanmadan önce, canlı bir demoda işlem hızı, emir türleri ve mobil eşdeğerlik kontrol edilir.",
    stat: "3",
    statLabel: "Karşılaştırılan Platform",
    tone: "signal" as const,
  },
  {
    eyebrow: "04 · Para Çekme",
    title: "İlk ödeme,\ngerçek testtir.",
    body: "Küçük bir depozit, gerçek bir para çekme talebi ve bir kronometre — güven varsayılmaz, ölçülür.",
    stat: "24 sa",
    statLabel: "Görülen En Hızlı Ödeme",
    tone: "gold" as const,
  },
];

export default function ShowcaseGallery() {
  return (
    <section className="relative overflow-hidden bg-ink-soft py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            {tr("Endeksin İçinde")}
          </span>
          <h2 className="font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
            Her puanın <em className="font-poppins italic text-text-on-ink-muted">nasıl</em> kazanıldığını görün.
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
