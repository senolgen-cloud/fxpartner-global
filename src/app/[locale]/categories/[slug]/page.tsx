import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
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
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { trData } from "@/lib/localizeContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// "Yeni Başlayanlar" doesn't concatenate cleanly with "Forex Brokerları" in
// a <title> the way the other category labels do, so only that one needs
// an override.
const CATEGORY_TITLE_OVERRIDES: Partial<Record<BrokerCategory, string>> = {
  Beginners: "Yeni Başlayanlar İçin En İyi Forex Brokerları",
};

function categoryTitle(name: BrokerCategory): string {
  return trData(CATEGORY_TITLE_OVERRIDES)[name] ?? `${categoryInfo[name].label} Forex Brokerları`;
}

export function generateStaticParams() {
  return brokerCategories.map((category) => ({
    slug: trData(categoryInfo)[category].slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
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
  params: Promise<{ slug: string ; locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

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
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Kategoriler", url: `${SITE_URL}/categories` },
              { name: trData(categoryInfo)[category.name].label, url: `${SITE_URL}/categories/${category.slug}` },
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
              {tr("← Tüm kategoriler")}
            </Link>
            <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {trData(categoryInfo)[category.name].label}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {category.description}
            </p>
            <p className="tabular-stat mt-6 font-mono text-xs uppercase tracking-[0.15em] text-signal">
              Bu kategoride {matches.length} broker var
            </p>
            {topPick && (
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-on-ink-muted">
                FXPARTNER Endeksi&apos;ne göre en yüksek puanlı {trData(categoryInfo)[category.name].label.toLowerCase()}{" "}
                {tr("brokerı")}{" "}
                <Link
                  href={`/brokers/${topPick.slug}`}
                  className="notranslate font-medium text-text-on-ink underline decoration-hairline underline-offset-4 hover:decoration-signal"
                >
                  {topPick.name}
                </Link>
                , {getBrokerScores(topPick).composite.toFixed(1)}/10 puanla.
              </p>
            )}
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-16">
            {matches.length === 0 ? (
              <p className="text-sm text-text-muted">
                {tr("Bu kategoride henüz broker yok.")}
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
