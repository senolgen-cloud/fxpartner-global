import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import LessonFigure from "@/components/education/LessonFigure";
import { educationVisuals } from "@/lib/educationVisuals";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

/**
 * Every Akademi figure on one page.
 *
 * The figures exist for the lessons, but they are the part of a lesson people
 * come back to — nobody rereads four hundred words to check which side of the
 * price a buy limit sits on. Collected here they are one bookmark, and they
 * are readable before the lesson that carries them has been written: the
 * queue in lib/educationTopics.ts publishes two subjects a day, so a figure
 * can wait weeks for its lesson.
 *
 * A static segment under /egitim, so it takes precedence over [slug]. A
 * generated lesson could in principle claim this slug; nothing in the
 * generator produces it, and if one ever did the lesson would be the thing
 * that disappears, which is why the name is a phrase no title would slugify
 * into.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.egitim.gorseller.title"],
    description: t["page.egitim.gorseller.description"],
    alternates: {
      canonical: localePath(locale, "/egitim/gorsel-anlatimlar"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/egitim/gorsel-anlatimlar")])
      ),
    },
    openGraph: {
      title: t["page.egitim.gorseller.title"],
      description: t["page.egitim.gorseller.description"],
      url: `${SITE_URL}${localePath(locale, "/egitim/gorsel-anlatimlar")}`,
      type: "website",
      images: [{ url: `${SITE_URL}/fxpartner-akademi.png`, width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${SITE_URL}/fxpartner-akademi.png`],
    },
  };
}

// Nothing here reads the database or the clock, so the page is as static as
// the components it renders. The hour is a concession to the copy around
// them changing, not to the figures.
export const revalidate = 3600;

export default async function EducationVisualsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Eğitim", url: `${SITE_URL}/egitim` },
              { name: "Görsel Anlatımlar", url: `${SITE_URL}/egitim/gorsel-anlatimlar` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
            <Link
              href="/egitim"
              className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              {tr("← FXPARTNER Akademi")}
            </Link>
            <h1 className="mx-auto mt-6 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Görsel anlatımlar")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Akademi derslerinin anlatmaya çalıştığı şeylerin bir kısmı cümleyle değil, şekille anlaşılıyor: bir formül, bir orantı, bir emrin fiyata göre yeri. Hepsi burada, tek sayfada.")}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            {/* A jump list, not a table of contents. Six items do not need
                numbering or a sidebar; they need to be reachable from the
                top of a long scroll on a phone. */}
            <nav aria-label={tr("Görsel anlatımlar")} className="flex flex-wrap gap-2">
              {educationVisuals.map((v) => (
                <a
                  key={v.id}
                  href={`#${v.slug}`}
                  className="rounded-full border border-hairline-light px-4 py-2 text-[13px] text-text-muted transition-colors hover:border-signal hover:text-signal"
                >
                  {tr(v.title)}
                </a>
              ))}
            </nav>

            <div className="mt-10 space-y-8">
              {educationVisuals.map((v) => (
                <LessonFigure key={v.id} visual={v} />
              ))}
            </div>

            <p className="mt-10 text-sm leading-relaxed text-text-muted">
              {tr("Buradaki şekiller mekaniği anlatır: bir hesabın nasıl yapıldığını, bir emrin nereye konduğunu, bir sürenin neyi kapsadığını. Hiçbiri yön, seviye ya da zamanlama önerisi değildir ve yatırım tavsiyesi içermez.")}
            </p>

            <div className="mt-10 rounded-2xl border border-signal/30 bg-signal/[0.06] p-6 text-center">
              <p className="font-poppins text-lg font-semibold text-text-dark">
                {tr("Şekiller derslerin içinde de var")}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-text-muted">
                {tr("Her biri, konusunu anlatan dersin başında tekrar karşınıza çıkıyor. Sırayla okumak için 1. dersten başlayın.")}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/egitim"
                  className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
                >
                  {tr("Dersleri gör")}
                </Link>
                <Link
                  href="/pozisyon-hesaplayici"
                  className="rounded-full border border-hairline px-6 py-3 text-sm font-semibold text-text-dark transition-colors hover:border-text-dark"
                >
                  {tr("Pozisyon hesaplayıcıyı aç")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
