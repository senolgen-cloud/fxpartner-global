import { tr } from "@/lib/chrome";
import { trData } from "@/lib/localizeContent";
const slides = [
  {
    eyebrow: "01 · Regülasyon",
    title: "Lisans numarası,\nkartta.",
    body: "Bağımsız doğrulayabildiğimiz lisans numaraları inceleme sayfasında numarasıyla görünür; numarasını henüz doğrulayamadığımız bir lisans, brokerın beyanı olarak numarasız listelenir.",
    tone: "signal" as const,
  },
  {
    eyebrow: "02 · Maliyet",
    title: "Spread ve swap,\nyan yana.",
    body: "Komisyon, spread ve gecelik swap birlikte — tek başına değil — değerlendirilir; böylece bir pozisyonu tutmanın gerçek maliyeti görünür.",
    tone: "gold" as const,
  },
  {
    eyebrow: "03 · Platform",
    title: "MT4, MT5,\ncTrader test edildi.",
    body: "Herhangi bir platform puanlanmadan önce, canlı bir demoda işlem hızı, emir türleri ve mobil eşdeğerlik kontrol edilir.",
    tone: "signal" as const,
  },
  {
    eyebrow: "04 · Para Çekme",
    title: "İlk ödeme,\ngerçek testtir.",
    body: "Küçük bir depozit, gerçek bir para çekme talebi ve bir kronometre — güven varsayılmaz, ölçülür.",
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
            {tr("Her puanın")}{" "}
            <em className="font-poppins italic text-text-on-ink-muted">{tr("nasıl")}</em>{" "}
            {tr("kazanıldığını görün.")}
          </h2>
        </div>
      </div>

      <div
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] md:px-[max(1.5rem,calc((100%-72rem)/2))] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {trData(slides).map((slide) => (
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

          </article>
        ))}
      </div>
    </section>
  );
}
