import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrokerLookupSearch from "@/components/BrokerLookupSearch";
import { lookupBrokers } from "@/data/brokerLookup";

export const metadata: Metadata = {
  title: "Broker Lookup",
  description:
    "Search any forex broker by name and see whether it's regulated, worth extra caution, or flagged as high-risk by official regulator warning lists.",
  alternates: { canonical: "/broker-lookup" },
};

export default function BrokerLookupPage() {
  const highRiskCount = lookupBrokers.filter((b) => b.verdict === "high-risk").length;

  return (
    <>
      <Header />
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
            <BrokerLookupSearch />

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">How to read this:</strong>{" "}
                Verdicts are built from official regulator warning lists
                (FCA, CySEC, BaFin, CONSOB, FINMA), independent trust-score
                sources, and our own editorial reviews. A
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
