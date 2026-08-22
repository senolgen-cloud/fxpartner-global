import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Footer from "@/components/Footer";
import ComplaintForm from "@/components/ComplaintForm";
import { brokers } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";

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
    title: t["page.complaint.title"],
    description: t["page.complaint.description"],
    alternates: {
      canonical: localePath(locale, "/complaint"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/complaint")])
      ),
    },
  };
}

export default function ComplaintPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Şikayet Bildir", url: `${SITE_URL}/complaint` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Şikayetler
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Bir aracı kurumla sorun mu yaşadınız?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Bize ne olduğunu anlatın. Her şikayeti inceliyor, 48 saat
              içinde aracı kurumla iletişime geçmeye çalışıyor ve
              bulgularımızı size e-posta ile bildiriyoruz.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-2xl px-6 py-16">
            <ComplaintForm brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))} />
            <p className="mt-8 text-xs leading-relaxed text-text-muted">
              FXPARTNER bir düzenleyici kurum değildir ve bir aracı kurumu
              yanıt vermeye veya sizi tazmin etmeye zorlayamaz. Doğrulanmış
              şikayetleri ilgili aracı kuruma iletir ve incelemelerimizde
              gördüğümüz eğilimleri yayınlarız. Resmi/hukuki işlem için
              yerel finansal düzenleyici kurumunuzla iletişime geçin.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
