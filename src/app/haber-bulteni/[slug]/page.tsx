import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { breadcrumbSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

async function getBulletin(slug: string) {
  return db.query.newsBulletins.findFirst({ where: eq(newsBulletins.slug, slug) });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bulletin = await getBulletin(slug);
  if (!bulletin) return {};
  return {
    title: bulletin.title,
    description: bulletin.excerpt,
    alternates: { canonical: `/haber-bulteni/${bulletin.slug}` },
    openGraph: {
      title: bulletin.title,
      description: bulletin.excerpt,
      url: `${SITE_URL}/haber-bulteni/${bulletin.slug}`,
      type: "article",
      publishedTime: bulletin.publishedAt.toISOString(),
    },
  };
}

export const revalidate = 900;

export default async function NewsBulletinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bulletin = await getBulletin(slug);
  if (!bulletin) notFound();

  const sources: string[] = JSON.parse(bulletin.sources || "[]");
  const paragraphs = bulletin.body.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: bulletin.title,
            description: bulletin.excerpt,
            datePublished: bulletin.publishedAt.toISOString(),
            dateModified: bulletin.publishedAt.toISOString(),
            url: `${SITE_URL}/haber-bulteni/${bulletin.slug}`,
            author: { "@type": "Organization", name: "FXPARTNER" },
            publisher: { "@type": "Organization", name: "FXPARTNER" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Haber Bülteni", url: `${SITE_URL}/haber-bulteni` },
              { name: bulletin.title, url: `${SITE_URL}/haber-bulteni/${bulletin.slug}` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Link
              href="/haber-bulteni"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ← Tüm bültenler
            </Link>
            <p className="mt-6 font-mono text-xs text-text-on-ink-muted">
              {bulletin.publishedAt.toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="mt-3 font-poppins text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              {bulletin.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {bulletin.excerpt}
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={`text-[16px] leading-relaxed text-text-dark/90 ${i > 0 ? "mt-4" : ""}`}
              >
                {p}
              </p>
            ))}

            <p className="mt-10 text-sm leading-relaxed text-text-muted">
              Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.
            </p>

            {sources.length > 0 && (
              <div className="mt-6 rounded-xl border border-hairline-light bg-paper p-4">
                <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
                  Kaynaklar
                </h3>
                <p className="mt-2 text-sm text-text-dark/80">{sources.join(" · ")}</p>
              </div>
            )}

            <div className="mt-10">
              <ShareButtons title={bulletin.title} text={bulletin.excerpt} locale="tr" />
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
