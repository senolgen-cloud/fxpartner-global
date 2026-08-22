import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import TechnicalAnalysisCard from "@/components/TechnicalAnalysisCard";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import VipCtaBanner from "@/components/VipCtaBanner";
import ShareButtons from "@/components/ShareButtons";
import {
  technicalAnalysisPosts,
  getBulletinTitle,
  isoToBulletinSlug,
  bulletinSlugToIso,
} from "@/data/technicalAnalysis";
import { getSponsoredBroker } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

function postsForDate(iso: string) {
  return technicalAnalysisPosts.filter((p) => p.publishedAt === iso);
}

export function generateStaticParams() {
  const dates = new Set(technicalAnalysisPosts.map((p) => p.publishedAt));
  return Array.from(dates).map((iso) => ({ date: isoToBulletinSlug(iso) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const iso = bulletinSlugToIso(date);
  if (!iso) return {};
  const posts = postsForDate(iso);
  if (posts.length === 0) return {};

  const title = getBulletinTitle(iso);
  const description = `${posts.map((p) => p.instrument).join(", ")} için gün içi pivot, destek/direnç seviyeleri ve teknik görünüm — ${title}.`;

  return {
    title,
    description,
    alternates: { canonical: `/teknik-analiz/${date}` },
    openGraph: {
      title: `${title} | FXPARTNER`,
      description,
      url: `${SITE_URL}/teknik-analiz/${date}`,
      type: "article",
    },
  };
}

export default async function TechnicalAnalysisBulletinPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const iso = bulletinSlugToIso(date);
  if (!iso) notFound();

  const posts = postsForDate(iso);
  if (posts.length === 0) notFound();

  const title = getBulletinTitle(iso);
  const featuredBroker = getSponsoredBroker(iso);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Teknik Analiz", url: `${SITE_URL}/teknik-analiz` },
              { name: title, url: `${SITE_URL}/teknik-analiz/${date}` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Link
              href="/teknik-analiz"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← Tüm bültenler
            </Link>
            <p className="mt-6 font-mono text-xs text-text-on-ink-muted">
              {new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="mt-3 font-poppins text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {posts.map((p) => p.instrument).join(" · ")} için gün içi pivot, destek/direnç
              seviyeleri ve teknik görünüm — gerçek grafikler ve RSI/MACD yorumlarıyla.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <div className="mb-12">
              <BrokerAdBanner broker={featuredBroker} />
            </div>

            <div className="space-y-10">
              {posts.map((post, i) => (
                <div key={post.slug}>
                  <TechnicalAnalysisCard post={post} />
                  {/* Membership-package promo dropped in after the first
                      analysis rather than at the very top or bottom — reads
                      as part of the bulletin instead of a bolted-on banner,
                      and every bulletin has at least one post so this
                      always renders exactly once. */}
                  {i === 0 && (
                    <div className="mt-10">
                      <VipCtaBanner variant="light" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-10 text-sm leading-relaxed text-text-muted">
              Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Belirtilen
              seviyeler Trading Central kaynaklı teknik analiz verileridir ve gerçekleşmesi
              garanti edilmez.
            </p>

            <div className="mt-10">
              <ShareButtons title={title} text={posts.map((p) => p.headline).join(" · ")} locale="tr" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
