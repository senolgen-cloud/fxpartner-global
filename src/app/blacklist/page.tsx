import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brokers } from "@/data/brokers";

export const metadata: Metadata = {
  title: "Broker Risk Warnings",
  description:
    "Brokers flagged for low independent trust scores or recurring complaint patterns in published reviews.",
  alternates: { canonical: "/blacklist" },
};

// Curated, not automatic: only brokers whose `cons` already cite a specific,
// sourced complaint pattern or independent trust-score reference. Adding a
// broker here requires real, checkable evidence — never an unverified claim.
const WATCHLIST_SLUGS = ["exclusive-markets", "lhfx", "versus-trade"];

export default function BlacklistPage() {
  const flagged = WATCHLIST_SLUGS.map((slug) => brokers.find((b) => b.slug === slug)).filter(
    (b): b is NonNullable<typeof b> => Boolean(b)
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-alert">
              Risk Warnings
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Brokers to research carefully before signing up
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              These brokers score low on independent trust indices or have
              recurring complaint patterns noted in published reviews. This
              is not a legal finding of fraud — it&apos;s a signal to do
              extra due diligence. Sources are cited on each broker&apos;s
              full review.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {flagged.map((broker) => (
                <div key={broker.slug} className="py-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="font-display text-2xl font-semibold text-text-dark">
                      {broker.name}
                    </h2>
                    <span className="font-mono text-xs uppercase tracking-[0.15em] text-alert">
                      Rating {broker.rating.toFixed(1)}/5
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {broker.cons.map((con) => (
                      <li key={con} className="flex gap-3 text-[15px] text-text-dark/90">
                        <span className="mt-1 text-alert">–</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/brokers/${broker.slug}`}
                    className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors hover:text-signal-strong"
                  >
                    Full review →
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-display text-lg font-semibold text-text-dark">
                Had a bad experience with a broker?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                File a complaint and we&apos;ll factor verified, recurring
                patterns into this page and our scoring.
              </p>
              <Link
                href="/complaint"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                Submit a Complaint
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
