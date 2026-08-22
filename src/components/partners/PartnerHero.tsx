import Reveal from "@/components/Reveal";
import { tr } from "@/lib/chrome";
import AnimatedStat from "@/components/AnimatedStat";
import HeroVideo from "@/components/HeroVideo";
import Hero3DGlobe from "@/components/partners/Hero3DGlobe";

export default function PartnerHero({
  brokerCount,
  regulatorCount,
}: {
  brokerCount: number;
  regulatorCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-text-on-ink">
      <div
        aria-hidden="true"
        className="hero-glow-signal pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-signal/25 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="hero-glow-gold pointer-events-none absolute -right-16 top-10 h-[360px] w-[360px] rounded-full bg-gold/20 blur-[110px]"
      />
      <HeroVideo />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
              <span
                aria-hidden="true"
                className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
              />
              {tr("Partner Programı")}
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              {tr("Küresel partner işinizi büyütün.")}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Yatırımcıların başarılı olmasına yardımcı olurken FXPARTNER ile ölçeklenebilir, düzenli bir gelir oluşturun — ana IB anlaşmamız kapsamında kendi Sub-IB hesabınızı açın ve ömür boyu komisyon kazanın.")}
            </p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#apply"
                className="lift-on-hover rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong hover:shadow-lg hover:shadow-signal/30"
              >
                Partner Olun
              </a>
              <a
                href="#how-it-works"
                className="lift-on-hover rounded-full border border-hairline px-6 py-3 text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
              >
                {tr("Nasıl Çalışır")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-hairline pt-8 sm:grid-cols-4">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Partner Aracı Kurumlar")}
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  <AnimatedStat value={brokerCount} />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Kapsanan Düzenleyici Kurum")}
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  <AnimatedStat value={regulatorCount} suffix="+" />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Katılım Maliyeti")}
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  <AnimatedStat value={0} prefix="$" />
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {tr("Komisyon Süresi")}
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold">
                  {tr("Ömür Boyu")}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200} className="hidden justify-self-center lg:flex">
          <Hero3DGlobe />
        </Reveal>
      </div>
    </section>
  );
}
