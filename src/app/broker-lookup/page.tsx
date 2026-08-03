import type { Metadata } from "next";
import Footer from "@/components/Footer";
import BrokerLookupSearch from "@/components/BrokerLookupSearch";
import BrokerLookupFullIndex from "@/components/BrokerLookupFullIndex";
import { lookupBrokers } from "@/data/brokerLookup";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Broker Lookup",
  description:
    "Search any forex broker by name and see whether it's regulated, worth extra caution, or flagged as high-risk by official regulator warning lists.",
  alternates: { canonical: "/broker-lookup" },
};

const lookupFaqs = [
  {
    q: "What does 'Verified / Regulated' mean on FXPARTNER's broker lookup?",
    a: "It means the broker holds real Tier-1 and/or multi-jurisdiction regulatory licenses, and no major regulator warnings were found for it at the time of our research.",
  },
  {
    q: "What does 'Caution' mean on FXPARTNER's broker lookup?",
    a: "The broker appears to be legitimate and operating, but there's a specific reason to dig deeper before funding an account — for example offshore-only licensing, a regulator red flag, a relinquished license, or a notable pattern of complaints.",
  },
  {
    q: "What does 'High Risk' mean on FXPARTNER's broker lookup?",
    a: "The broker is named on an official regulator warning or unauthorized-firm list, or matches a documented scam/clone pattern. This is a signal to research further before going anywhere near it — not a legal finding of fraud.",
  },
  {
    q: "Is a 'Caution' or 'High Risk' label a legal accusation of fraud?",
    a: "No. Both labels reflect a specific, documented finding — a regulator warning, a confirmed unlicensed status, or a recurring complaint pattern — not an accusation of criminal fraud. Always verify a broker's current status directly on the relevant regulator's official website before trading.",
  },
  {
    q: "What if a broker isn't in FXPARTNER's lookup database yet?",
    a: "That doesn't mean it's trustworthy — it means we haven't researched it yet. Search the broker's name on your own country's regulator (or the FCA, ASIC, CySEC) to confirm it's licensed, and search its name together with \"scam\" or \"withdrawal\" on independent review sites to check for recurring complaint patterns.",
  },
];

export default async function BrokerLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const highRiskCount = lookupBrokers.filter((b) => b.verdict === "high-risk").length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lookupFaqs)) }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Broker Lookup
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Check any broker before you fund an account
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-on-ink-muted">
              Search {lookupBrokers.length} brokers — from major regulated
              names to firms named on official regulator warning lists — and
              see an honest, sourced verdict for each.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <BrokerLookupSearch initialQuery={q || ""} />

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">How to read this:</strong>{" "}
                Verdicts are built from official regulator warning lists
                (FCA, CySEC, BaFin, CONSOB, FINMA, Turkey&apos;s SPK),
                independent trust-score sources, and our own editorial
                reviews. A
                &ldquo;High Risk&rdquo; label reflects a specific,
                documented finding — a regulator warning, a confirmed unlicensed
                status, or a recurring complaint pattern — not an accusation
                of criminal fraud. Regulator warning lists change weekly;
                always double-check a broker&apos;s current status on the
                relevant regulator&apos;s official website before trading.
                We currently track {highRiskCount} brokers flagged as high
                risk.
              </p>
            </div>

            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-text-dark">
                Frequently Asked Questions
              </h2>
              <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
                {lookupFaqs.map((faq) => (
                  <details key={faq.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-dark">
                      {faq.q}
                      <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-muted">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <BrokerLookupFullIndex />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
