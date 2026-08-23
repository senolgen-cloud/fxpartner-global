import type { Metadata } from "next";
import { tr, trLocale } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { marketAnalysisPosts, getMarketAnalysisCoverImage } from "@/data/marketAnalysis";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { trData } from "@/lib/localizeContent";

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
    title: t["page.piyasa-analizi.title"],
    description: t["page.piyasa-analizi.description"],
    alternates: {
      canonical: localePath(locale, "/piyasa-analizi"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/piyasa-analizi")])
      ),
    },
  };
}

export default async function MarketAnalysisIndexPage({
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
              { name: "Piyasa Analizleri", url: `${SITE_URL}/piyasa-analizi` },
            ])
          ),
        }}
      />
      {/* This section's content is deliberately Turkish (unlike the rest of
          the English-language site) — lang="tr" here is a genuine language
          signal for crawlers/screen readers/translate tooling, not a
          translation of English copy. */}
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Piyasa Analizleri
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Günlük piyasa özetleri")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Küresel borsalar, merkez bankası kararları ve ekonomik takvimdeki önemli veriler — her gün güncellenir.")}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {trData(marketAnalysisPosts)
                .slice()
                .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
                .map((post) => (
                  <Link
                    key={post.slug}
                    href={`/piyasa-analizi/${post.slug}`}
                    className="group flex gap-6 py-8"
                  >
                    <div className="relative hidden h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-hairline-light sm:block">
                      <Image
                        src={getMarketAnalysisCoverImage(post)}
                        alt={post.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-xs text-text-muted">
                        {new Date(post.publishedAt).toLocaleDateString(trLocale(), {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        · {post.readingMinutes} dk okuma
                      </span>
                      <h2 className="mt-2 font-poppins text-2xl font-semibold text-text-dark transition-colors group-hover:text-signal">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                        {post.excerpt}
                      </p>
                      <span className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal">
                        Analizi oku →
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
