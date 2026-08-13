import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import { technicalAnalysisPosts } from "@/data/technicalAnalysis";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Teknik Analiz",
  description:
    "FXPARTNER'ın gün içi teknik analizleri — pivot seviyeleri, destek/direnç bantları ve RSI/MACD yorumlarıyla.",
  alternates: { canonical: "/teknik-analiz" },
};

function cardImageUrl(post: (typeof technicalAnalysisPosts)[number]) {
  const params = new URLSearchParams({
    instrument: post.instrument,
    timeframe: post.timeframe,
    pivot: post.pivot,
    last: post.lastPrice,
    bias: post.bias,
    headline: post.headline,
    resistances: post.resistances.map((r) => `${r.price}:${r.strength}`).join(","),
    supports: post.supports.map((s) => `${s.price}:${s.strength}`).join(","),
  });
  return `${SITE_URL}/api/og/technical-analysis?${params.toString()}`;
}

export default function TechnicalAnalysisIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Teknik Analiz", url: `${SITE_URL}/teknik-analiz` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">Teknik Analiz</span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Gün içi pivot ve seviye analizleri
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Pivot seviyeleri, destek/direnç bantları ve RSI/MACD yorumlarıyla —
              her sinyal yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="space-y-10">
              {technicalAnalysisPosts
                .slice()
                .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
                .map((post) => (
                  <article
                    key={post.slug}
                    className="overflow-hidden rounded-2xl border border-hairline-light bg-white shadow-sm"
                  >
                    <div className="relative aspect-square w-full max-w-md mx-auto sm:max-w-none sm:aspect-[4/3]">
                      <Image src={cardImageUrl(post)} alt={post.headline} fill unoptimized className="object-cover" />
                    </div>
                    <div className="p-6">
                      <span className="font-mono text-xs text-text-muted">
                        {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        · {post.instrument} · {post.timeframe} · {post.source}
                      </span>
                      <h2 className="mt-2 font-poppins text-2xl font-semibold text-text-dark">{post.headline}</h2>
                      <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
                        <strong className="text-text-dark">Ana senaryo:</strong> {post.preference}
                      </p>
                      <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                        <strong className="text-text-dark">Alternatif senaryo:</strong> {post.alternative}
                      </p>
                      <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                        <strong className="text-text-dark">Yorum:</strong> {post.comment}
                      </p>
                      <p className="mt-4 text-xs text-text-muted">
                        Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
                      </p>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
