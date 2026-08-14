import Footer from "@/components/Footer";
import BrokerList from "@/components/BrokerList";
import ComparisonTable from "@/components/ComparisonTable";
import { COMPARISON_CRITERIA } from "@/lib/comparisonCriteria";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";
import HeroVideo from "@/components/HeroVideo";
import HeroSpotlight from "@/components/HeroSpotlight";
import TradingVideo from "@/components/TradingVideo";
import HeroCashbackForm from "@/components/HeroCashbackForm";
import HeroFeatureRow from "@/components/HeroFeatureRow";
import InstallAppButtons from "@/components/InstallAppButtons";
import HeroEcosystemMockups from "@/components/HeroEcosystemMockups";
import ShowcaseGallery from "@/components/ShowcaseGallery";
import RegulatorBadges from "@/components/RegulatorBadges";
import HeroBrokerSearch from "@/components/HeroBrokerSearch";
import { brokers } from "@/data/brokers";
import { lookupBrokers } from "@/data/brokerLookup";
import { faqSchema } from "@/lib/schema";
import { db } from "@/db";
import { tradeSignals } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const trackedBrokerCount = lookupBrokers.length;
const trackedRegulatorCount = new Set([
  ...brokers.flatMap((b) => b.regulators),
  ...lookupBrokers.flatMap((b) => b.regulators ?? []),
]).size;
// Read from each broker's real minDeposit string (e.g. "$5", "From $10*")
// rather than a hand-typed number, so this can't go stale if a broker with
// a lower minimum gets added later.
const lowestMinDeposit = Math.min(
  ...brokers.map((b) => {
    const n = parseFloat(b.minDeposit.replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? Infinity : n;
  })
);

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

const accountSteps = [
  "Pick a broker from the ranking above whose regulation and cost profile matches your risk tolerance.",
  "Complete the broker's KYC form with your ID and proof of address — most Tier-1 regulated brokers require this before your first deposit.",
  "Fund the account with the minimum deposit first, not your full trading capital, so you can evaluate execution quality risk-free.",
  "Open the platform (MT4, MT5, or the broker's own app) in demo mode and confirm spreads and order execution match what's advertised.",
];

const withdrawalSteps = [
  "Request a small withdrawal first — the amount matters less than observing the broker's actual processing time.",
  "Use the same payment method you deposited with; most regulated brokers require this for anti-money-laundering compliance.",
  "Track the time from request to funds received: same-day to 3 business days is typical for reputable brokers, longer delays are a warning sign.",
  "Keep the confirmation email or transaction ID — it's your reference if you need to dispute a delay with the broker or your regulator.",
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
  {
    q: "How are the trade signals generated, and how accurate are they?",
    a: "Signals combine automated technical screening (trend, momentum, and volatility indicators across major pairs) with a manual review pass before publication. Every signal carries an entry, stop-loss, and take-profit level so its outcome is objectively checkable — closed signals stay visible on the signals page with their result, win or loss. Past performance does not guarantee future results, and signals are educational in nature, not personalized advice.",
  },
  {
    q: "What are the risks of forex trading?",
    a: "Forex trading uses leverage, which magnifies both gains and losses — you can lose more than your initial deposit depending on the account type and jurisdiction. Spreads and swaps widen during high-volatility events, and offshore-regulated accounts carry weaker investor-protection guarantees than Tier-1 regulated ones. Only trade with capital you can afford to lose, and use a demo account before committing real funds.",
  },
];

export default async function Home() {
  // Prefer the latest still-open trade so the hero card reflects a real
  // signal a visitor could still act on; fall back to the latest closed
  // one so the card isn't empty between open trades.
  const latestSignal =
    (await db.query.tradeSignals.findFirst({
      where: eq(tradeSignals.status, "active"),
      orderBy: desc(tradeSignals.createdAt),
    })) ??
    (await db.query.tradeSignals.findFirst({
      where: eq(tradeSignals.status, "closed"),
      orderBy: desc(tradeSignals.closedAt),
    })) ??
    null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
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
          <HeroSpotlight />

          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
                <span
                  aria-hidden="true"
                  className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
                />
                Learn · Trade · Grow
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
                Forex signals, market analysis, and broker comparison.{" "}
                <span className="text-signal">One trading ecosystem.</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
                FXPARTNER is your all-in-one platform for smarter trading.
                Signals, AI insights, economic calendar, trusted brokers and
                a global community.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-7">
                <HeroBrokerSearch />
              </div>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#brokers"
                  className="lift-on-hover rounded-full bg-gradient-to-b from-signal to-signal-strong px-6 py-3 text-sm font-medium text-on-signal shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-shadow hover:shadow-lg hover:shadow-signal/30"
                >
                  Explore the Ecosystem
                </a>
                <a
                  href="#comparison"
                  className="lift-on-hover rounded-full border border-hairline px-6 py-3 text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
                >
                  Comparison Table
                </a>
              </div>
            </Reveal>

            <Reveal delay={290}>
              <InstallAppButtons />
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-12 border-t border-hairline pt-10">
                <HeroFeatureRow />
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroEcosystemMockups brokers={brokers} latestSignal={latestSignal} />
          </Reveal>
          </div>
        </section>

        {/* Ranked broker list */}
        <section id="brokers" className="relative overflow-hidden bg-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-hairline to-transparent"
          />
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Rankings
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-on-ink md:text-4xl">
                The {brokers.length} most-chosen forex brokers of 2026
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
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

        {/* Cashback lead capture */}
        <section className="bg-ink-soft">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mx-auto max-w-lg">
              <HeroCashbackForm />
            </div>
          </div>
        </section>

        <RegulatorBadges />

        {/* At-a-glance stats */}
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <Reveal>
              <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Brokers Tracked
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={trackedBrokerCount} />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Regulatory Authorities
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={trackedRegulatorCount} suffix="+" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Lowest Entry
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={lowestMinDeposit} prefix="$" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    Comparison Criteria
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-text-on-ink">
                    <AnimatedStat value={COMPARISON_CRITERIA.length} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        <ShowcaseGallery />

        {/* Comparison table */}
        <section id="comparison" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
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
            <Reveal className="mx-auto max-w-2xl text-center">
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

        {/* Account opening & withdrawal walkthrough */}
        <section id="guides" className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                Walkthrough
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-text-on-ink md:text-4xl">
                Opening an account and your first withdrawal
              </h2>
              <p className="mt-4 text-text-on-ink-muted">
                The same two moments decide most trust issues with a new
                broker. Here&apos;s what to check at each one.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="font-display text-lg font-semibold text-text-on-ink">
                  Opening an account
                </h3>
                <ol className="mt-4 space-y-4">
                  {accountSteps.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-xs text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] leading-relaxed text-text-on-ink-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-on-ink">
                  Your first withdrawal
                </h3>
                <ol className="mt-4 space-y-4">
                  {withdrawalSteps.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-mono text-xs text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[14px] leading-relaxed text-text-on-ink-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Reveal delay={120} className="mt-12">
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                  Risk warning
                </p>
                <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-text-on-ink-muted">
                  Forex trading is leveraged and carries a high risk of
                  losing your capital quickly. Never deposit more than you
                  can afford to lose, and treat every step above — KYC,
                  first deposit, first withdrawal — as a test before
                  committing further funds.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <TradingVideo />

        {/* FAQ */}
        <section id="faq" className="bg-paper">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <Reveal className="text-center">
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
