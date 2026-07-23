import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brokers } from "@/data/brokers";

export const metadata: Metadata = {
  title: "Current Broker Campaigns",
  description:
    "Active referral and deposit campaigns from FXPARTNER partner brokers, in one place.",
  alternates: { canonical: "/campaigns" },
};

export default function CampaignsPage() {
  const campaigns = brokers.filter((b) => b.promotion);

  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              Campaigns
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Current broker campaigns
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              Active referral and deposit campaigns from FXPARTNER partner
              brokers, kept in one place as they change. Terms vary by
              broker and country — always confirm current conditions before
              participating.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-16">
            {campaigns.length === 0 ? (
              <p className="text-[15px] text-text-muted">
                No active campaigns right now — check back soon.
              </p>
            ) : (
              <div className="divide-y divide-hairline-light border-t border-hairline-light">
                {campaigns.map((broker) => (
                  <div key={broker.slug} id={broker.slug} className="scroll-mt-24 py-10">
                    <div className="flex items-center gap-3">
                      {broker.logo && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-hairline-light bg-white p-1.5">
                          <Image
                            src={broker.logo}
                            alt={broker.name}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                          {broker.promotion!.tag}
                        </span>
                        <h2 className="font-display text-2xl font-semibold text-text-dark">
                          {broker.name}
                        </h2>
                      </div>
                    </div>

                    <h3 className="mt-5 font-display text-xl font-semibold text-text-dark">
                      {broker.promotion!.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-dark/90">
                      {broker.promotion!.intro}
                    </p>

                    <ol className="mt-5 space-y-3">
                      {broker.promotion!.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-[15px] text-text-dark/90">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-xs text-text-dark">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={broker.referralUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
                      >
                        Open a {broker.name} Account
                      </a>
                      {broker.promotion!.contactEmail && (
                        <a
                          href={`mailto:${broker.promotion!.contactEmail}`}
                          className="rounded-full border border-hairline-light px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-text-dark"
                        >
                          Email {broker.name} for Your Referral Link
                        </a>
                      )}
                      <Link
                        href={`/brokers/${broker.slug}`}
                        className="rounded-full border border-hairline-light px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-text-dark"
                      >
                        {broker.name} Full Review →
                      </Link>
                    </div>

                    <p className="mt-5 text-xs leading-relaxed text-text-muted">
                      {broker.promotion!.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
