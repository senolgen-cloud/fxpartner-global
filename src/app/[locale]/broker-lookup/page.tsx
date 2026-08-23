import type { Metadata } from "next";
import { tr, trf } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Footer from "@/components/Footer";
import BrokerLookupSearch from "@/components/BrokerLookupSearch";
import BrokerLookupFullIndex from "@/components/BrokerLookupFullIndex";
import { lookupBrokers } from "@/data/brokerLookup";
import { faqSchema } from "@/lib/schema";
import { trData } from "@/lib/localizeContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.broker-lookup.title"],
    description: t["page.broker-lookup.description"],
    alternates: {
      canonical: localePath(locale, "/broker-lookup"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/broker-lookup")])
      ),
    },
  };
}

const lookupFaqs = [
  {
    q: "FXPARTNER'ın aracı kurum sorgulamasında 'Doğrulanmış / Düzenlenmiş' ne anlama gelir?",
    a: "Aracı kurumun gerçek Tier-1 ve/veya çoklu yargı bölgesi düzenleyici lisanslarına sahip olduğu ve araştırmamız sırasında ona yönelik büyük bir düzenleyici uyarısı bulunmadığı anlamına gelir.",
  },
  {
    q: "FXPARTNER'ın aracı kurum sorgulamasında 'Dikkat' ne anlama gelir?",
    a: "Aracı kurum meşru ve faaliyette görünüyor, ancak hesap açmadan önce daha derinlemesine araştırma yapmak için özel bir sebep var — örneğin yalnızca offshore lisans, bir düzenleyici uyarısı, bırakılmış bir lisans veya dikkate değer bir şikayet örüntüsü.",
  },
  {
    q: "FXPARTNER'ın aracı kurum sorgulamasında 'Yüksek Risk' ne anlama gelir?",
    a: "Aracı kurum, resmi bir düzenleyici uyarısında veya yetkisiz firma listesinde adı geçiyor ya da belgelenmiş bir dolandırıcılık/klon örüntüsüyle eşleşiyor. Bu, ona yaklaşmadan önce daha fazla araştırma yapmanız gerektiğine dair bir sinyaldir — hukuki bir dolandırıcılık tespiti değildir.",
  },
  {
    q: "'Dikkat' veya 'Yüksek Risk' etiketi hukuki bir dolandırıcılık suçlaması mı?",
    a: "Hayır. Her iki etiket de somut, belgelenmiş bir bulguyu yansıtır — bir düzenleyici uyarısı, doğrulanmış lisanssız durum veya tekrarlayan bir şikayet örüntüsü — cezai dolandırıcılık suçlaması değildir. İşlem yapmadan önce her zaman bir aracı kurumun güncel durumunu doğrudan ilgili düzenleyicinin resmi web sitesinden teyit edin.",
  },
  {
    q: "Bir aracı kurum FXPARTNER'ın sorgulama veritabanında henüz yoksa ne olur?",
    a: "Bu, güvenilir olduğu anlamına gelmez — henüz araştırmadığımız anlamına gelir. Lisanslı olduğunu teyit etmek için aracı kurumun adını kendi ülkenizin düzenleyicisinde (veya FCA, ASIC, CySEC'te) arayın ve tekrarlayan şikayet örüntülerini kontrol etmek için adını bağımsız inceleme sitelerinde \"scam\" veya \"withdrawal\" kelimeleriyle birlikte arayın.",
  },
];

export default async function BrokerLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const highRiskCount = trData(lookupBrokers).filter((b) => b.verdict === "high-risk").length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(trData(lookupFaqs))) }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Aracı Kurum Sorgulama")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Hesap açmadan önce herhangi bir aracı kurumu kontrol edin")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-on-ink-muted">
              {trf(
                "{count} aracı kurum arasında arama yapın — büyük düzenlenmiş isimlerden resmi düzenleyici uyarı listelerinde adı geçen firmalara kadar — ve her biri için dürüst, kaynaklı bir değerlendirme görün.",
                { count: lookupBrokers.length }
              )}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-16">
            <BrokerLookupSearch initialQuery={q || ""} />

            <div className="mt-14 rounded-2xl border border-hairline-light bg-paper p-6">
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">{tr("Bunu nasıl okumalı:")}</strong>{" "}
                Değerlendirmeler resmi düzenleyici uyarı listelerinden (FCA,
                CySEC, BaFin, CONSOB, FINMA, Türkiye&apos;nin SPK&apos;sı),
                bağımsız güven puanı kaynaklarından ve kendi editoryal
                incelemelerimizden oluşturulur.
                &ldquo;Yüksek Risk&rdquo; etiketi somut, belgelenmiş bir
                bulguyu yansıtır — bir düzenleyici uyarısı, doğrulanmış
                lisanssız durum veya tekrarlayan bir şikayet örüntüsü —
                cezai dolandırıcılık suçlaması değildir. Düzenleyici uyarı
                listeleri haftalık olarak değişir; işlem yapmadan önce her
                {tr("zaman bir aracı kurumun güncel durumunu ilgili düzenleyicinin resmi web sitesinden teyit edin.")}{" "}
                {trf("Şu anda yüksek risk olarak işaretlenmiş {count} aracı kurumu takip ediyoruz.", {
                  count: highRiskCount,
                })}
              </p>
            </div>

            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold text-text-dark">
                {tr("Sıkça Sorulan Sorular")}
              </h2>
              <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
                {trData(lookupFaqs).map((faq) => (
                  <details key={faq.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-text-dark">
                      {faq.q}
                      <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[15px] leading-relaxed text-text-muted">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <BrokerLookupFullIndex />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
