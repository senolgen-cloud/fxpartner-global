import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import TechnicalAnalysisCard from "@/components/TechnicalAnalysisCard";
import {
  technicalAnalysisPosts,
  getBulletinTitle,
  isoToBulletinSlug,
  type TechnicalAnalysisPost,
} from "@/data/technicalAnalysis";
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
    title: t["page.teknik-analiz.title"],
    description: t["page.teknik-analiz.description"],
    alternates: {
      canonical: localePath(locale, "/teknik-analiz"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/teknik-analiz")])
      ),
    },
  };
}

function groupByDate(posts: TechnicalAnalysisPost[]) {
  const groups = new Map<string, TechnicalAnalysisPost[]>();
  for (const post of posts) {
    const list = groups.get(post.publishedAt) ?? [];
    list.push(post);
    groups.set(post.publishedAt, list);
  }
  return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default async function TechnicalAnalysisIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const dateGroups = groupByDate(technicalAnalysisPosts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Teknik Analiz", url: `${SITE_URL}/teknik-analiz` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">{tr("Teknik Analiz Bülteni")}</span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Gün içi pivot ve seviye analizleri")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Gerçek grafikler, pivot seviyeleri, destek/direnç bantları ve RSI/MACD yorumlarıyla — her analiz yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.")}
            </p>
          </div>
        </section>

        {dateGroups.map(([date, posts]) => (
          <section key={date} className="border-t border-hairline-light first:border-t-0">
            <div className="mx-auto max-w-3xl px-6 py-16">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-text-muted">
                    {new Date(date).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <h2 className="mt-2 font-poppins text-3xl font-semibold text-text-dark">{getBulletinTitle(date)}</h2>
                </div>
                <Link
                  href={`/teknik-analiz/${isoToBulletinSlug(date)}`}
                  className="shrink-0 font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors hover:text-signal-strong"
                >
                  {tr("Bülteni Görüntüle →")}
                </Link>
              </div>

              <div className="space-y-10">
                {posts.map((post) => (
                  <TechnicalAnalysisCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
