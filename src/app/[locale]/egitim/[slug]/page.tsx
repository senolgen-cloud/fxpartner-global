import type { Metadata } from "next";
import { tr, trLocale } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { educationPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { pickTranslation } from "@/lib/translateContent";
import { defaultLocale, htmlLang, isLocale, type Locale } from "@/lib/i18n";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

async function getPost(slug: string) {
  return db.query.educationPosts.findFirst({ where: eq(educationPosts.slug, slug) });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const copy = pickTranslation(post.translations, locale, post);
  return {
    title: copy.title,
    description: copy.excerpt,
    alternates: { canonical: `/egitim/${post.slug}` },
    openGraph: {
      title: copy.title,
      description: copy.excerpt,
      url: `${SITE_URL}/egitim/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
    },
  };
}

export const revalidate = 900;

export default async function EducationPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale: pageLocale } = await params;
  const locale: Locale = isLocale(pageLocale) ? pageLocale : defaultLocale;
  setServerLocale(locale);

  const post = await getPost(slug);
  if (!post) notFound();

  const copy = pickTranslation(post.translations, locale, post);

  // Blocks separated by blank lines; single newlines inside a block are kept
  // by whitespace-pre-line, because the emoji bullet lists these posts are
  // written in are one block of several lines and collapsing them would run
  // the list into a paragraph.
  const blocks = copy.body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  // The rendered language is whichever copy actually came back — a post whose
  // translation failed falls back to Turkish, and saying lang="en" over
  // Turkish prose misreports it to crawlers and screen readers alike.
  const rendered = copy === post ? defaultLocale : locale;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: copy.title,
            description: copy.excerpt,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.publishedAt.toISOString(),
            url: `${SITE_URL}/egitim/${post.slug}`,
            inLanguage: htmlLang[rendered],
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
              { name: "Eğitim", url: `${SITE_URL}/egitim` },
              { name: copy.title, url: `${SITE_URL}/egitim/${post.slug}` },
            ])
          ),
        }}
      />
      <main lang={htmlLang[rendered]} className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <Link
              href="/egitim"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              {tr("← Tüm eğitim yazıları")}
            </Link>
            <p className="mt-6 font-mono text-xs text-text-on-ink-muted">
              {post.publishedAt.toLocaleDateString(trLocale(), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="mt-3 font-poppins text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              {copy.title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {copy.excerpt}
            </p>
          </div>
        </section>

        <section>
          <article className="mx-auto max-w-3xl px-6 py-16">
            {blocks.map((b, i) => (
              <p
                key={i}
                className={`whitespace-pre-line text-[16px] leading-relaxed text-text-dark/90 ${i > 0 ? "mt-5" : ""}`}
              >
                {b}
              </p>
            ))}

            <p className="mt-10 text-sm leading-relaxed text-text-muted">
              {tr("Bu içerik genel bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk taşır.")}
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
