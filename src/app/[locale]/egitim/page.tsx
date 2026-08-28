import type { Metadata } from "next";
import { tr, trLocale, trf } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { educationPosts } from "@/db/schema";
import { asc } from "drizzle-orm";
import { topicsWithVisual } from "@/lib/educationVisuals";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { pickTranslation } from "@/lib/translateContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// One constant for the link preview and the picture on the page, so the two
// can never drift into showing different artwork for the same section.
const ACADEMY_IMAGE = "/fxpartner-akademi.png";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.egitim.title"],
    description: t["page.egitim.description"],
    alternates: {
      canonical: localePath(locale, "/egitim"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/egitim")])
      ),
    },
    openGraph: {
      title: t["page.egitim.title"],
      description: t["page.egitim.description"],
      url: `${SITE_URL}${localePath(locale, "/egitim")}`,
      type: "website",
      // The artwork is 1536x1024, a 3:2 frame. Declared at its real size
      // rather than a claimed 1200x630: a scraper that trusts the numbers
      // and gets a different shape renders a broken box, and every platform
      // crops to its own ratio anyway. Worth knowing that the ones enforcing
      // 1.91:1 take about 110px off the top and bottom, which clips the
      // eyebrow and part of the footer bar in the picture.
      images: [{ url: `${SITE_URL}${ACADEMY_IMAGE}`, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${SITE_URL}${ACADEMY_IMAGE}`],
    },
  };
}

export const revalidate = 900;

export default async function EducationIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);
  const locale = isLocale(pageLocale) ? pageLocale : defaultLocale;

  const rows = await db.query.educationPosts.findMany({
    orderBy: [asc(educationPosts.lessonNo), asc(educationPosts.publishedAt)],
    limit: 60,
  });
  const posts = rows.map((row) => ({ ...row, ...pickTranslation(row.translations, locale, row) }));

  // Which lessons carry a diagram. Built once rather than looked up per row:
  // the list is short, but the index renders sixty of them.
  const illustrated = topicsWithVisual();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Eğitim", url: `${SITE_URL}/egitim` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("FXPARTNER Akademi")}
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("İşlem disiplini, risk ve platform mekaniği")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Yön tahmini yok, seviye önerisi yok. Buradaki dersler fiyat nereye giderse gitsin geçerli olan şeyleri anlatır: pozisyon büyüklüğü, emir mekaniği ve karar alma disiplini. Yatırım tavsiyesi değildir.")}
            </p>
            {posts.length > 0 && (
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted">
                {trf("{n} ders yayında · sırayla okumak için 1. dersten başlayın", {
                  n: posts.length,
                })}
              </p>
            )}
            {/* The figures are worth their own entrance. Several of them are
                what a reader actually came for — the sizing formula, where a
                buy limit goes — and finding them means opening the one lesson
                that happens to carry them. */}
            <Link
              href="/egitim/gorsel-anlatimlar"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-5 py-2.5 text-sm font-semibold text-signal transition-colors hover:bg-signal/20"
            >
              {tr("Görsel anlatımlar")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            {posts.length === 0 ? (
              <p className="text-center text-text-muted">{tr("Henüz eğitim yazısı yayınlanmadı.")}</p>
            ) : (
              <div className="divide-y divide-hairline-light border-t border-hairline-light">
                {posts.map((p) => (
                  <Link key={p.id} href={`/egitim/${p.slug}`} className="group flex flex-col gap-1.5 py-5 sm:gap-2 sm:py-7">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-text-muted">
                      {p.lessonNo != null && (
                        <>
                          <span className="font-semibold uppercase tracking-[0.15em] text-signal">
                            {trf("Ders {n}", { n: p.lessonNo })}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>
                        {new Date(p.publishedAt).toLocaleDateString(trLocale(), {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {illustrated.has(p.topic) && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="uppercase tracking-[0.15em] text-text-muted">
                            {tr("Görsel anlatımlı")}
                          </span>
                        </>
                      )}
                    </span>
                    <h2 className="font-poppins text-lg font-semibold leading-snug text-text-dark transition-colors group-hover:text-signal sm:text-2xl">
                      {p.title}
                    </h2>
                    <p className="line-clamp-2 text-[14px] leading-relaxed text-text-muted sm:line-clamp-3 sm:text-[15px]">
                      {p.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
