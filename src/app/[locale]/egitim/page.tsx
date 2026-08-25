import type { Metadata } from "next";
import { tr, trLocale } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { educationPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { pickTranslation } from "@/lib/translateContent";

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
    title: t["page.egitim.title"],
    description: t["page.egitim.description"],
    alternates: {
      canonical: localePath(locale, "/egitim"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/egitim")])
      ),
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
    orderBy: [desc(educationPosts.publishedAt)],
    limit: 60,
  });
  const posts = rows.map((row) => ({ ...row, ...pickTranslation(row.translations, locale, row) }));

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
              {tr("Eğitim")}
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("İşlem disiplini, risk ve platform mekaniği")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Yön tahmini yok, seviye önerisi yok. Buradaki yazılar fiyat nereye giderse gitsin geçerli olan şeyleri anlatır: pozisyon büyüklüğü, emir mekaniği ve karar alma disiplini. Yatırım tavsiyesi değildir.")}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            {posts.length === 0 ? (
              <p className="text-center text-text-muted">{tr("Henüz eğitim yazısı yayınlanmadı.")}</p>
            ) : (
              <div className="divide-y divide-hairline-light border-t border-hairline-light">
                {posts.map((p) => (
                  <Link key={p.id} href={`/egitim/${p.slug}`} className="group flex flex-col gap-2 py-8">
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(p.publishedAt).toLocaleDateString(trLocale(), {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h2 className="font-poppins text-2xl font-semibold text-text-dark transition-colors group-hover:text-signal">
                      {p.title}
                    </h2>
                    <p className="text-[15px] leading-relaxed text-text-muted">{p.excerpt}</p>
                    <span className="mt-1 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal">
                      {tr("Yazıyı oku →")}
                    </span>
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
