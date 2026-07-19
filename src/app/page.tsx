import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";
import Highlights from "@/components/Highlights";
import BrokerList from "@/components/BrokerList";
import ComparisonTable from "@/components/ComparisonTable";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import HeroVideo from "@/components/HeroVideo";
import TradingVideo from "@/components/TradingVideo";
import { brokers } from "@/data/brokers";

const steps = [
  {
    n: "01",
    title: "Check the regulation",
    body: "Brokers overseen by top-tier (Tier-1) authorities like the FCA, ASIC, or CySEC offer a stronger framework for the safety of your funds.",
  },
  {
    n: "02",
    title: "Compare the cost structure",
    body: "Weigh spread, commission, and overnight swap rates together — a low spread is sometimes offset by a higher commission.",
  },
  {
    n: "03",
    title: "Test the platform and tools",
    body: "Open a demo account to see whether the MT4, MT5, or cTrader interface fits your own strategy.",
  },
  {
    n: "04",
    title: "Try the withdrawal process",
    body: "Starting with a small deposit and watching the speed and transparency of your first withdrawal request is the best way to test long-term trust.",
  },
];

const faqs = [
  {
    q: "What is the FXPARTNER Index and how is it calculated?",
    a: "The FXPARTNER Index is a composite score from 0-10, calculated from the four criteria in the 01-04 guide below (Regulation, Cost, Platform, Withdrawals). The Platform axis is computed automatically from the broker's platform data. The Regulation axis is derived from license data by default; the editorial team may update this score when it makes a reasoned exception. The Cost and Withdrawals axes are editorial judgments based on verifiable signals found in the review — brokers with no specific signal get a neutral score on that axis. The Index is a separate measure from the star rating; the two can reflect different things.",
  },
  {
    q: "How is this ranking determined?",
    a: "It's an assessment based on general criteria around regulatory quality, cost transparency, platform variety, and fit for the investor's profile. FXPARTNER has a partnership/referral relationship with some of the listed brokers and may earn a commission on account openings; this is noted separately on each broker card.",
  },
  {
    q: "Which broker is best for beginners?",
    a: "For a low minimum deposit and extensive educational content, XM generally offers an easier start; Lite Finance also stands out for its low barrier to entry.",
  },
  {
    q: "Why do leverage ratios vary by country?",
    a: "In regions like the EU and UK, ESMA/FCA regulations cap leverage for retail investors, while offshore-licensed accounts can offer much higher ratios. The figures on this page may vary by region.",
  },
  {
    q: "Does this site give investment advice?",
    a: "No. The content is for general informational purposes only and is not personal investment advice. You should do your own research and consult a professional if needed before making a decision.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <Ticker />
      <Highlights />

      <main className="flex-1">
        {/* Hero */}
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

          <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
                <span
                  aria-hidden="true"
                  className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
                />
                2026 Broker Guide
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                Learn the difference between forex brokers before you pick one.
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
                We compared XM, AvaTrade, Lite Finance, and other leading
                brokers worldwide in one place, by regulation, cost,
                platform, and withdrawal speed.
              </p>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#brokers"
                  className="lift-on-hover rounded-full bg-signal px-6 py-3 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong hover:shadow-lg hover:shadow-signal/30"
                >
                  See the Rankings
                </a>
                <a
                  href="#comparison"
                  className="lift-on-hover rounded-full border border-hairline px-6 py-3 text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
                >
                  Comparison Table
                </a>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-hairline pt-8 sm:grid-cols-4">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Brokers Reviewed
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={brokers.length} />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Regulatory Authorities
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={12} suffix="+" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Lowest Entry
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={5} prefix="$" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Comparison Criteria
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedStat value={6} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Ranked broker list */}
        <section id="brokers" className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Rankings
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                The {brokers.length} most-chosen forex brokers of 2026
              </h2>
              <p className="mt-4 text-text-muted">
                Each broker was assessed on regulatory strength, cost
                structure, platform support, and fit for different investor
                profiles.
              </p>
            </Reveal>

            <div className="mt-12">
              <BrokerList brokers={brokers} />
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section id="comparison" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Side by Side
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                Comparison table
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                See the key numbers at a glance before you decide.
              </p>
            </Reveal>
            <Reveal delay={120} className="mt-10">
              <ComparisonTable />
            </Reveal>
            <p className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-text-on-ink-muted">
              * Leverage and minimum deposit figures may vary by account type
              and the investor&apos;s country. Verify current terms on the
              broker&apos;s official website before trading.
            </p>
          </div>
        </section>

        {/* How to choose */}
        <section id="how-to-choose" className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Guide
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                How to choose a broker?
              </h2>
              <p className="mt-4 text-text-muted">
                These four criteria are scored from 0-10 on every broker
                profile as the{" "}
                <strong className="font-medium text-text-dark">FXPARTNER Index</strong>.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
              {steps.map((step, i) => (
                <Reveal key={step.n} delay={i * 90} className="flex gap-5">
                  <span className="font-display text-3xl font-light text-signal">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-text-dark">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <TradingVideo />

        {/* FAQ */}
        <section id="faq" className="bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                FAQ
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-dark md:text-4xl">
                Frequently asked questions
              </h2>
            </Reveal>
            <div className="mt-10 divide-y divide-hairline-light border-t border-hairline-light">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium text-text-dark transition-colors group-open:text-signal">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
