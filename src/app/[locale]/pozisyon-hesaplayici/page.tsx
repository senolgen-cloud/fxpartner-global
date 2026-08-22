import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Footer from "@/components/Footer";
import PositionSizeCalculator from "@/components/PositionSizeCalculator";
import { getLiveFxRates } from "@/lib/positionSize";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.pozisyon-hesaplayici.title"],
    description: t["page.pozisyon-hesaplayici.description"],
    alternates: {
      canonical: localePath(locale, "/pozisyon-hesaplayici"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/pozisyon-hesaplayici")])
      ),
    },
  };
}

export const revalidate = 300;

const faqs = [
  {
    q: "Pozisyon büyüklüğü nasıl hesaplanır?",
    a: "Riske edeceğiniz tutar (hesap bakiyesi × risk yüzdesi), stop loss mesafenizin (pip) para birimi karşılığına bölünerek işlem büyüklüğü (lot) bulunur. Bu, sabit bir lot büyüklüğü yerine her işlemde aynı oranda risk almanızı sağlar.",
  },
  {
    q: "Standart, mini ve mikro lot arasındaki fark nedir?",
    a: "1 standart lot 100.000 birim, 1 mini lot 10.000 birim, 1 mikro lot 1.000 birimdir. Küçük hesaplarda mikro/mini lot kullanmak, riski hesap büyüklüğüne uygun şekilde ölçeklendirmenizi sağlar.",
  },
  {
    q: "İşlem başına yüzde kaç risk almalıyım?",
    a: "Çoğu risk yönetimi yaklaşımı işlem başına %1-2 risk önerir. Hesaplayıcıdaki 'X üst üste kayıptan sonra bakiye' satırı, daha yüksek risk oranlarının art arda gelen kayıplarda hesabı ne kadar hızlı eritebileceğini gösterir.",
  },
  {
    q: "Kurlar nereden geliyor?",
    a: "Hesaplayıcı, ECB referans kurlarına dayanan canlı döviz kurlarını kullanır ve birkaç dakikada bir güncellenir. Kesin fiyatlar brokerinize göre küçük farklılıklar gösterebilir.",
  },
];

export default async function PositionSizeCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const rates = await getLiveFxRates();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Pozisyon Büyüklüğü Hesaplayıcı", url: `${SITE_URL}/pozisyon-hesaplayici` },
            ])
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <main lang="tr" className="flex-1 bg-ink text-text-on-ink">
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Risk Yönetimi Aracı")}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
              {tr("Pozisyon Büyüklüğü Hesaplayıcı")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-text-on-ink-muted">
              {tr("Hesap bakiyenize ve stop loss mesafenize göre, farklı risk seviyelerinde ne kadarlık bir pozisyon açmanız gerektiğini görün — canlı piyasa kurlarıyla hesaplanır.")}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <PositionSizeCalculator rates={rates} />

          <p className="mt-6 text-center text-xs leading-relaxed text-text-on-ink-muted">
            {tr("Bu araç yalnızca bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaldıraçlı ürünlerde işlem yapmak sermayenizin tamamını kaybetmenize yol açabilir — pozisyon büyüklüğünüzü her zaman kendi risk toleransınıza göre belirleyin.")}
          </p>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <h2 className="text-2xl font-semibold md:text-3xl">Sık sorulan sorular</h2>
            <div className="mt-8 divide-y divide-hairline border-t border-hairline">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-on-ink">
                    {faq.q}
                    <span className="shrink-0 font-mono text-sm text-text-on-ink-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-text-on-ink-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
