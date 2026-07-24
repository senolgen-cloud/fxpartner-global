import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { marketAnalysisPosts } from "@/data/marketAnalysis";

export const metadata: Metadata = {
  title: "Piyasa Analizleri",
  description:
    "FXPARTNER'ın günlük piyasa özetleri — küresel borsalar, merkez bankası kararları ve ekonomik takvimdeki önemli veriler.",
  alternates: { canonical: "/piyasa-analizi" },
};

export default function MarketAnalysisIndexPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Piyasa Analizleri
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Günlük piyasa özetleri
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Küresel borsalar, merkez bankası kararları ve ekonomik takvimdeki
              önemli veriler — her gün güncellenir.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="divide-y divide-hairline-light border-t border-hairline-light">
              {marketAnalysisPosts
                .slice()
                .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
                .map((post) => (
                  <Link
                    key={post.slug}
                    href={`/piyasa-analizi/${post.slug}`}
                    className="group block py-8"
                  >
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
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
