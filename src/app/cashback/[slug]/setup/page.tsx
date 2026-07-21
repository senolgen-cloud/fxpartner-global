import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CashbackSetupForm from "@/components/CashbackSetupForm";
import { getCashbackProgram, cashbackPrograms } from "@/data/cashback";
import { getBrokerBySlug } from "@/data/brokers";

export function generateStaticParams() {
  return cashbackPrograms.map((p) => ({ slug: p.brokerSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const broker = getBrokerBySlug(slug);
  if (!broker) return {};
  return {
    title: `Set Up ${broker.name} Cashback`,
    description: `Link your ${broker.name} trading account to start tracking cashback.`,
    alternates: { canonical: `/cashback/${slug}/setup` },
  };
}

export default async function CashbackSetupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getCashbackProgram(slug);
  const broker = getBrokerBySlug(slug);
  if (!program || !broker) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-2xl px-6 py-16">
            <Link
              href="/cashback"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← All cashback programs
            </Link>
            <span className="mt-6 block font-mono text-xs uppercase tracking-[0.25em] text-gold">
              {broker.name} Cashback
            </span>
            <h1 className="mt-3 font-poppins text-3xl font-semibold leading-[1.15] tracking-tight md:text-4xl">
              Set up your {broker.name} cashback
            </h1>
            <p className="mt-4 text-text-on-ink-muted">
              Rate: <span className="font-mono text-gold">{program.rateLabel}</span>
              {" · "}
              {program.rateNote}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-2xl px-6 py-16">
            <CashbackSetupForm brokerSlug={slug} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
