import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { newsBulletins } from "@/db/schema";
import { desc } from "drizzle-orm";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

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
    title: t["page.haber-bulteni.title"],
    description: t["page.haber-bulteni.description"],
    alternates: {
      canonical: localePath(locale, "/haber-bulteni"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/haber-bulteni")])
      ),
    },
  };
}

export const revalidate = 900;

export default async function NewsBulletinIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const bulletins = await db.query.newsBulletins.findMany({
    orderBy: [desc(newsBulletins.publishedAt)],
    limit: 50,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Haber Bülteni", url: `${SITE_URL}/haber-bulteni` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Haber Bülteni")}
            </span>
            <h1 className="mt-4 max-w-2xl font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Günün piyasa gelişmeleri, tek yerde")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Farklı kaynaklardan derlenen haberleri özgün yorumla bir araya getiriyoruz. Yatırım tavsiyesi değildir.")}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            {bulletins.length === 0 ? (
              <p className="text-text-muted">Henüz bülten yayınlanmadı.</p>
            ) : (
              <div className="divide-y divide-hairline-light border-t border-hairline-light">
                {bulletins.map((b) => (
                  <Link
                    key={b.id}
                    href={`/haber-bulteni/${b.slug}`}
                    className="group flex flex-col gap-2 py-8"
                  >
                    <span className="font-mono text-xs text-text-muted">
                      {new Date(b.publishedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h2 className="font-poppins text-2xl font-semibold text-text-dark transition-colors group-hover:text-signal">
                      {b.title}
                    </h2>
                    <p className="text-[15px] leading-relaxed text-text-muted">{b.excerpt}</p>
                    <span className="mt-1 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal">
                      {tr("Bülteni oku →")}
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
