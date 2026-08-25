import type { Metadata } from "next";
import { tr, trLocale, trf } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { educationPosts } from "@/db/schema";
import { and, asc, desc, eq, gt, isNotNull, lt } from "drizzle-orm";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { pickTranslation } from "@/lib/translateContent";
import { defaultLocale, htmlLang, isLocale, type Locale } from "@/lib/i18n";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

async function getPost(slug: string) {
  return db.query.educationPosts.findFirst({ where: eq(educationPosts.slug, slug) });
}

/**
 * The lesson either side of this one.
 *
 * By lesson number rather than date, because the number is what the reader
 * is being walked through — and a post written later can carry an earlier
 * number if a subject was retried after failing its policy checks.
 */
async function getNeighbours(lessonNo: number | null) {
  if (lessonNo == null) return { prev: null, next: null };
  const [prev, next] = await Promise.all([
    db.query.educationPosts.findFirst({
      where: and(isNotNull(educationPosts.lessonNo), lt(educationPosts.lessonNo, lessonNo)),
      orderBy: desc(educationPosts.lessonNo),
      columns: { slug: true, title: true, lessonNo: true },
    }),
    db.query.educationPosts.findFirst({
      where: and(isNotNull(educationPosts.lessonNo), gt(educationPosts.lessonNo, lessonNo)),
      orderBy: asc(educationPosts.lessonNo),
      columns: { slug: true, title: true, lessonNo: true },
    }),
  ]);
  return { prev: prev ?? null, next: next ?? null };
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
  const neighbours = post ? await getNeighbours(post.lessonNo) : { prev: null, next: null };

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
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted">
              {post.lessonNo != null && (
                <>
                  <span className="text-signal">
                    {trf("FXPARTNER Akademi · Ders {n}", { n: post.lessonNo })}
                  </span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="normal-case tracking-normal">
                {post.publishedAt.toLocaleDateString(trLocale(), {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
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
              {tr("Bu içerik eğitim ve bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. FXPARTNER bir aracı kurum değildir ve yatırım hizmeti sunmaz.")}
            </p>

            {/* The next lesson, named. A bare "next" arrow asks the reader to
                take a chance; the title tells them what they would be
                reading, which is the only honest reason to click. */}
            {(neighbours.prev || neighbours.next) && (
              <nav
                aria-label={tr("Dersler arası gezinme")}
                className="mt-12 grid gap-4 border-t border-hairline-light pt-8 sm:grid-cols-2"
              >
                {neighbours.prev ? (
                  <Link
                    href={`/egitim/${neighbours.prev.slug}`}
                    className="group rounded-2xl border border-hairline-light p-5 transition-colors hover:border-signal"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                      {trf("← Ders {n}", { n: neighbours.prev.lessonNo ?? 0 })}
                    </span>
                    <span className="mt-1.5 block font-poppins text-[15px] font-semibold leading-snug text-text-dark transition-colors group-hover:text-signal">
                      {neighbours.prev.title}
                    </span>
                  </Link>
                ) : (
                  <span aria-hidden="true" className="hidden sm:block" />
                )}
                {neighbours.next && (
                  <Link
                    href={`/egitim/${neighbours.next.slug}`}
                    className="group rounded-2xl border border-hairline-light p-5 text-right transition-colors hover:border-signal"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-signal">
                      {trf("Ders {n} →", { n: neighbours.next.lessonNo ?? 0 })}
                    </span>
                    <span className="mt-1.5 block font-poppins text-[15px] font-semibold leading-snug text-text-dark transition-colors group-hover:text-signal">
                      {neighbours.next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}

            {/* One invitation, not three. What the account actually gives a
                reader of these pages is the live board the lessons describe —
                so that is what it offers, rather than a generic sign-up. */}
            <aside className="mt-8 rounded-2xl border border-signal/30 bg-signal/[0.06] p-6 text-center">
              <p className="font-poppins text-lg font-semibold text-text-dark">
                {tr("Burada okuduğunuzu canlı tahtada görün")}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-text-muted">
                {tr("Açık ve kapanmış işlemler, giriş ve stop seviyeleriyle birlikte yayında. Ücretsiz üyelikle bildirimleri de açabilirsiniz.")}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/signals"
                  className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
                >
                  {tr("Canlı sinyalleri gör")}
                </Link>
                <Link
                  href="/account/register"
                  className="rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-text-dark transition-colors hover:border-text-dark"
                >
                  {tr("Ücretsiz üye ol")}
                </Link>
              </div>
            </aside>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
