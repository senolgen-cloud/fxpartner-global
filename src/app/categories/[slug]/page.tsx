import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import BrokerCard from "@/components/BrokerCard";
import {
  brokers,
  brokerCategories,
  categoryInfo,
  getCategoryBySlug,
  getBrokerScores,
  type BrokerCategory,
} from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// "Beginners" reads awkwardly as "Beginners Brokers" in a <title> — every
// other category name concatenates cleanly with "Forex Brokers", so only
// that one needs an override. The on-page H1 keeps the raw category name
// unchanged to stay consistent with the filter-button label elsewhere.
const CATEGORY_TITLE_OVERRIDES: Partial<Record<BrokerCategory, string>> = {
  Beginners: "Best Forex Brokers for Beginners",
};

function categoryTitle(name: BrokerCategory): string {
  return CATEGORY_TITLE_OVERRIDES[name] ?? `${name} Forex Brokers`;
}

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
    title: categoryTitle(category.name),
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
  const topPick =
    matches.length > 0
      ? matches.reduce((best, b) =>
          getBrokerScores(b).composite > getBrokerScores(best).composite ? b : best
        )
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Categories", url: `${SITE_URL}/categories` },
              { name: category.name, url: `${SITE_URL}/categories/${category.slug}` },
            ])
          ),
        }}
      />
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
            {topPick && (
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-on-ink-muted">
                Based on the FXPARTNER Index, the top-rated {category.name.toLowerCase()}{" "}
                broker is{" "}
                <Link
                  href={`/brokers/${topPick.slug}`}
                  className="notranslate font-medium text-text-on-ink underline decoration-hairline underline-offset-4 hover:decoration-signal"
                >
                  {topPick.name}
                </Link>
                , scoring {getBrokerScores(topPick).composite.toFixed(1)}/10.
              </p>
            )}
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
