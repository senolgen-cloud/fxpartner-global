import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { brokerCategories, categoryInfo, brokers } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.categories.title"],
    description: t["page.categories.description"],
    alternates: {
      canonical: localePath(locale, "/categories"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/categories")])
      ),
    },
  };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Kategoriler", url: `${SITE_URL}/categories` },
            ])
          ),
        }}
      />
      <main className="flex-1">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Kategoriler
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("İhtiyacınıza uygun bir broker bulun")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Her kategori, brokerları tek bir öne çıkan özellik etrafında gruplar. Karşılaştırmanıza buradan başlayın.")}
            </p>
          </div>
        </section>

        <section className="bg-paper-high">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {brokerCategories.map((category) => {
                const info = categoryInfo[category];
                const count = brokers.filter((b) =>
                  b.categories.includes(category)
                ).length;
                return (
                  <Link
                    key={category}
                    href={`/categories/${info.slug}`}
                    className="group flex flex-col rounded-2xl border border-hairline-light p-6 transition-colors hover:border-text-dark"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-display text-xl font-semibold text-text-dark">
                        {info.label}
                      </h2>
                      <span className="tabular-stat shrink-0 font-mono text-xs text-text-muted">
                        {count} broker
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                      {info.description}
                    </p>
                    <span className="mt-5 font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors group-hover:text-signal-strong">
                      {tr("Görüntüle →")}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
