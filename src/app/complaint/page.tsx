import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ComplaintForm from "@/components/ComplaintForm";
import { brokers } from "@/data/brokers";

export const metadata: Metadata = {
  title: "File a Complaint | FXPARTNER",
  description:
    "Had a problem with a forex broker? Tell us what happened and we'll try to get it resolved.",
};

export default function ComplaintPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Complaints
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Had a problem with a broker?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Tell us what happened. We review every complaint, try to reach
              out to the broker within 48 hours, and follow up with you by
              email on what we find.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-2xl px-6 py-16">
            <ComplaintForm brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))} />
            <p className="mt-8 text-xs leading-relaxed text-text-muted">
              FXPARTNER is not a regulator and cannot force a broker to
              respond or compensate you. We forward verified complaints to
              the broker and publish patterns we see in our reviews. For
              formal/legal action, contact your local financial regulator.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
