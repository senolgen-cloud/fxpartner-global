import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FormattedText from "@/components/FormattedText";
import { marketAnalysisPosts, getMarketAnalysisPostBySlug } from "@/data/marketAnalysis";
import { newsArticleSchema, breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export function generateStaticParams() {
  return marketAnalysisPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getMarketAnalysisPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/piyasa-analizi/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/piyasa-analizi/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function MarketAnalysisPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getMarketAnalysisPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema(post)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: SITE_URL },
              { name: "Piyasa Analizleri", url: `${SITE_URL}/piyasa-analizi` },
              { name: post.title, url: `${SITE_URL}/piyasa-analizi/${post.slug}` },
            ])
          ),
        }}
      />
      <Header />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Link
              href="/piyasa-analizi"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← Tüm analizler
            </Link>
            <p className="mt-6 font-mono text-xs text-text-on-ink-muted">
              {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · {post.readingMinutes} dk okuma
            </p>
            <h1 className="mt-3 font-poppins text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {post.intro}
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16">
            <div className="space-y-10">
              {post.news.map((item, i) => (
                <div key={i}>
                  <h2 className="flex items-center gap-2 font-poppins text-2xl font-semibold text-text-dark">
                    <span aria-hidden="true">{item.icon}</span>
                    {item.heading}
                  </h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-text-dark/90">
                    <FormattedText text={item.body} />
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <h2 className="flex items-center gap-2 font-poppins text-xl font-semibold text-text-dark">
                <span aria-hidden="true">📅</span>
                Ekonomik Takvim | {post.calendarLabel}
              </h2>
              <div className="mt-5 space-y-5">
                {post.calendarEvents.map((event, i) => (
                  <div key={i}>
                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-signal">
                      {event.icon} {event.time}
                    </p>
                    <p className="mt-1 font-poppins text-lg font-semibold text-text-dark">
                      {event.title}
                    </p>
                    {event.note && (
                      <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
                        <FormattedText text={event.note} />
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-10 text-[16px] leading-relaxed text-text-dark/90">
              <FormattedText text={post.closing} />
            </p>

            <div className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
              <h3 className="font-poppins text-lg font-semibold text-text-dark">
                Doğru broker ile işlem yapın
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Piyasa gelişmelerini takip ederken, regülasyon, maliyet, platform
                ve para çekme güvenilirliği kriterlerine göre karşılaştırılmış
                brokerlere göz atın.
              </p>
              <Link
                href="/#brokers"
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
              >
                Broker Sıralamasını Gör
              </Link>
            </div>

            <p className="mt-10 text-xs leading-relaxed text-text-muted">
              Bu içerik genel bilgilendirme amaçlıdır ve yatırım tavsiyesi
              niteliği taşımaz. Yatırım kararlarınızı vermeden önce kendi
              araştırmanızı yapmanız ve gerekirse bir uzmana danışmanız önerilir.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
