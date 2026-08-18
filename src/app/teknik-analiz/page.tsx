import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import { technicalAnalysisPosts, getBulletinTitle, type TechnicalAnalysisPost } from "@/data/technicalAnalysis";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Teknik Analiz",
  description:
    "FXPARTNER'ın gün içi teknik analiz bültenleri — gerçek grafikler, pivot seviyeleri, destek/direnç bantları ve RSI/MACD yorumlarıyla.",
  alternates: { canonical: "/teknik-analiz" },
};

// Falls back to the coded pivot-ladder card when an instrument has no real
// chart screenshot attached (e.g. Apple below) — every entry always has
// some image, it just isn't always the real Trading Central chart.
function codedCardImageUrl(post: TechnicalAnalysisPost) {
  const params = new URLSearchParams({
    instrument: post.instrument,
    timeframe: post.timeframe,
    pivot: post.pivot,
    bias: post.bias,
    headline: post.headline,
    resistances: post.resistances.map((r) => `${r.price}:${r.strength}`).join(","),
    supports: post.supports.map((s) => `${s.price}:${s.strength}`).join(","),
  });
  if (post.lastPrice) params.set("last", post.lastPrice);
  return `${SITE_URL}/api/og/technical-analysis?${params.toString()}`;
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

export default function TechnicalAnalysisIndexPage() {
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
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">Teknik Analiz Bülteni</span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Gün içi pivot ve seviye analizleri
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Gerçek grafikler, pivot seviyeleri, destek/direnç bantları ve RSI/MACD
              yorumlarıyla — her analiz yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
            </p>
          </div>
        </section>

        {dateGroups.map(([date, posts]) => (
          <section key={date} className="border-t border-hairline-light first:border-t-0">
            <div className="mx-auto max-w-3xl px-6 py-16">
              <div className="mb-10">
                <span className="font-mono text-xs text-text-muted">
                  {new Date(date).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <h2 className="mt-2 font-poppins text-3xl font-semibold text-text-dark">{getBulletinTitle(date)}</h2>
              </div>

              <div className="space-y-10">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="overflow-hidden rounded-2xl border border-hairline bg-ink-soft/60 shadow-sm"
                  >
                    <div className="relative aspect-square w-full max-w-md mx-auto sm:max-w-none sm:aspect-[4/3] bg-ink">
                      <Image
                        src={post.chartImage ?? codedCardImageUrl(post)}
                        alt={post.headline}
                        fill
                        unoptimized
                        className={post.chartImage ? "object-contain" : "object-cover"}
                      />
                    </div>
                    <div className="p-6">
                      <span className="font-mono text-xs text-text-on-ink-muted">
                        {post.instrument} · {post.timeframe} · {post.source}
                      </span>
                      <h3 className="mt-2 font-poppins text-2xl font-semibold text-text-on-ink">{post.headline}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-text-on-ink-muted">
                        <strong className="text-text-on-ink">Ana senaryo:</strong> {post.preference}
                      </p>
                      <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
                        <strong className="text-text-on-ink">Alternatif senaryo:</strong> {post.alternative}
                      </p>
                      <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
                        <strong className="text-text-on-ink">Yorum:</strong> {post.comment}
                      </p>
                      <p className="mt-4 text-xs text-text-on-ink-muted">
                        Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
                      </p>
                    </div>
                  </article>
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
