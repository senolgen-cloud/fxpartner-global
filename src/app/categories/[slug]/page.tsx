import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrokerCard from "@/components/BrokerCard";
import { brokers, brokerCategories, categoryInfo, getCategoryBySlug } from "@/data/brokers";

export function generateStaticParams() {
  return brokerCategories.map((category) => ({
    slug: categoryInfo[category].slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} Brokers`,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const matches = brokers.filter((b) => b.categories.includes(category.name));

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <Link
              href="/categories"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← All categories
            </Link>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {category.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {category.description}
            </p>
            <p className="tabular-stat mt-6 font-mono text-xs uppercase tracking-[0.15em] text-signal">
              {matches.length} brokers in this category
            </p>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-16">
            {matches.length === 0 ? (
              <p className="text-sm text-text-muted">
                No brokers in this category yet.
              </p>
            ) : (
              matches.map((broker) => (
                <BrokerCard key={broker.slug} broker={broker} />
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
