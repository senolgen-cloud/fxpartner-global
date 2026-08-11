import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "FXPARTNER connects traders with regulated forex brokers through transparent, honest reviews — and helps brokers build trust with real, engaged audiences.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              About FXPARTNER
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              A trusted bridge between traders and brokers
            </h1>
            <p className="mt-5 max-w-xl text-text-on-ink-muted">
              FXPARTNER is a fast-growing review and partnership platform for
              the forex and CFD industry, built on one principle above all
              others: always transparent, always accurate.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section>
          <article className="mx-auto max-w-3xl px-6 py-16 text-[15px] leading-relaxed text-text-dark/90">
            <p>
              We started FXPARTNER to fix a simple problem: traders couldn&apos;t
              tell which broker reviews online were genuine and which were
              paid placements dressed up as advice. So we built a platform
              that says clearly, every time, which is which — and lets the
              quality of our information speak for itself.
            </p>
            <p className="mt-4">
              Today FXPARTNER is a growing ecosystem: broker reviews and
              comparisons, market analysis, trading signals, a cashback
              program, and active Telegram communities — all built around the
              same standard of honesty.
            </p>
          </article>
        </section>

        {/* Principles */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Our principles
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold md:text-4xl">
              What we will never compromise on
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-6">
                <h3 className="font-poppins text-lg font-semibold">
                  Always transparent
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                  Where we have a commercial relationship with a broker, we
                  say so — clearly, on the page, not buried in a footnote.
                  Nothing is presented as independent when it isn&apos;t.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-6">
                <h3 className="font-poppins text-lg font-semibold">
                  Always accurate
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                  Regulation status, scoring, and complaint data are checked
                  against real sources and kept up to date. Partnership
                  agreements never change what we publish about a broker.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline bg-ink-soft/60 p-6">
                <h3 className="font-poppins text-lg font-semibold">
                  Independent scoring
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                  Advertising and commission revenue fund the platform — it
                  never buys a better score. Brokers we partner with are
                  reviewed by the same criteria as everyone else.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For investors */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              For traders
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              What FXPARTNER does for you
            </h2>
            <p className="mt-5 max-w-2xl text-text-muted">
              We help you choose a broker with your eyes open — by regulation,
              real cost, platform quality, and how they actually treat
              clients when something goes wrong.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Honest broker reviews
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Every broker is scored on the same criteria — regulation,
                  costs, platforms, withdrawal experience — whether or not we
                  have a partnership with them.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  A place to be heard
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Leave a review, file a complaint, or check our risk warnings
                  before you deposit — real trader experience shapes what we
                  publish.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Cashback and campaigns
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Get more from the volume you already trade through our
                  cashback program and broker campaigns, tracked openly
                  against our own partner records.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Signals and market analysis
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Follow our market analysis and Telegram communities for
                  context on what&apos;s moving markets — never presented as
                  guaranteed advice.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/brokers"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Compare brokers →
              </Link>
            </div>
          </div>
        </section>

        {/* For brokers */}
        <section className="bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              For brokers
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              What FXPARTNER does for your brand
            </h2>
            <p className="mt-5 max-w-2xl text-text-muted">
              We work with brokers under flexible, transparent partnership
              models — monthly advertising, commission, and CPA — matched to
              what makes sense for your goals. As a young, fast-growing
              ecosystem, the monthly model is what most of our partners
              currently prefer: predictable cost, consistent visibility.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Real, engaged audiences
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Content is published on the site first, then shared across
                  our active Telegram groups — reaching traders who are
                  already looking for a broker, not cold traffic.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Revenue reinvested in growth
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  What we earn goes back into advertising and product
                  development. As FXPARTNER grows, so does the visibility of
                  every partner on it — it&apos;s an investment, not just a fee.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Flexible partnership models
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Fixed monthly fee, commission-based, or CPA — we structure
                  the agreement around what works for your acquisition goals.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper-high p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Scoring stays independent
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  A partnership never changes how a broker is reviewed or
                  scored. That&apos;s what keeps our audience — and in turn our
                  partners — trusting what we publish.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/partners"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Become a partner →
              </Link>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <p className="rounded-2xl border border-hairline-light bg-paper p-6 text-sm leading-relaxed text-text-muted">
              FXPARTNER is part of the FXPARTNER education and CopyTrade
              ecosystem, founded by Erdem Torun. Nothing on this site is
              investment advice — see our{" "}
              <Link href="/terms" className="text-signal hover:text-signal-strong">
                Terms of Service
              </Link>{" "}
              for details. Questions? Email{" "}
              <a
                href="mailto:senolgen@gmail.com"
                className="text-signal hover:text-signal-strong"
              >
                senolgen@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
