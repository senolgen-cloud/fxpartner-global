import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import BrokerList from "@/components/BrokerList";
import ComparisonTable from "@/components/ComparisonTable";
import HeroBrokerSearch from "@/components/HeroBrokerSearch";
import { brokers, brokerCategories, categoryInfo, getBrokerScores } from "@/data/brokers";
import { lookupBrokers } from "@/data/brokerLookup";
import { getBrokerReviewStats } from "@/lib/brokerReviews";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Yıl başlıkta bilinçli: bu nişte Türkçe SERP'in tamamı "2026 En İyi …"
// kalıbıyla dolu ve kullanıcı tazelik sinyali arıyor. Tek yerden türetiliyor
// ki her yıl başında elle güncelleme gerekmesin ve başlıkla gövde metni
// birbirinden ayrı düşmesin.
const YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  // Hedef kelimeler: "en iyi forex broker", "forex broker karşılaştırma",
  // "forex aracı kurumları". Türkçe aramada hem "broker" hem "aracı kurum"
  // kullanılıyor — ikisi de başlıkta/gövdede geçiyor.
  title: `${YEAR} En İyi Forex Brokerleri — Karşılaştırma ve Bağımsız Puanlama`,
  description: `${brokers.length} forex brokeri regülasyon, işlem maliyeti, platform ve para çekme deneyimi üzerinden bağımsız olarak puanlandı. Aracı kurum karşılaştırması, gerçek kullanıcı yorumları ve risk uyarıları.`,
  alternates: { canonical: "/brokerlar" },
  openGraph: {
    title: `${YEAR} En İyi Forex Brokerleri — FXPARTNER Karşılaştırması`,
    description: `${brokers.length} aracı kurum, aynı kriterlerle puanlandı. Ortaklık puanlamayı değiştirmez.`,
    url: `${SITE_URL}/brokerlar`,
  },
};

// AEO: cevap motorlarının alıntılayabileceği düz metin cevaplar. Sorular
// gerçek Türkçe arama kalıplarıyla yazıldı ("hangi broker", "güvenilir mi",
// "ne kadar para gerekir"), pazarlama diliyle değil.
const faqs = [
  {
    q: "Türkiye'de en iyi forex brokeri hangisi?",
    a: "Tek bir 'en iyi' broker yoktur; doğru broker işlem tarzınıza göre değişir. Düşük maliyet önceliğinizse dar spread ve komisyon yapısına, yeni başlıyorsanız düşük minimum yatırım ve Türkçe desteğe, büyük hacimle çalışıyorsanız regülasyon gücüne ve para çekme geçmişine bakmalısınız. FXPARTNER'da her broker dört eksende puanlanır: regülasyon, maliyet, platform ve para çekme. Bu puanlama ticari ilişkilerden bağımsızdır — ortak olduğumuz brokerlar da herkesle aynı kriterlerden geçer.",
  },
  {
    q: "Forex brokeri seçerken nelere dikkat etmeliyim?",
    a: "Sırasıyla dört şeye: (1) Regülasyon — brokerın hangi kurumdan lisanslı olduğu ve sizin hesabınızın hangi tüzel kişilik altında açıldığı. Bir grubun AB lisansı olması, sizi offshore bir şirkete kaydediyorsa sizi korumaz. (2) Gerçek işlem maliyeti — spread, komisyon ve swap birlikte hesaplanmalı. (3) Para çekme deneyimi — şikayetlerin büyük çoğunluğu buradan çıkar; hesap açmadan önce küçük bir çekme testi yapmak en pratik yöntemdir. (4) Platform ve araçlar. FXPARTNER'ın Index puanı bu dört ekseni tek sayıda birleştirir.",
  },
  {
    q: "Forex'e başlamak için ne kadar para gerekir?",
    a: "Listemizdeki brokerların minimum yatırım tutarları birbirinden çok farklı; bazıları çift haneli dolar tutarlarıyla hesap açmaya izin verirken bazıları çok daha yüksek başlangıç tutarı ister. Ancak asıl soru minimum tutar değil, risk yönetimidir: hesap ne kadar küçükse, işlem başına risk oranı o kadar kritik hale gelir. Pozisyon büyüklüğünüzü hesaplamak için pozisyon hesaplayıcımızı kullanabilirsiniz.",
  },
  {
    q: "Yurt dışı forex brokerleri Türkiye'de yasal mı?",
    a: "Türkiye'de yerleşik kişilerin kendi inisiyatifleriyle yurt dışında yerleşik kurumlarda hesap açması ve işlem yapması yasak değildir. Ancak yurt dışı kurumların Türkiye'ye yönelik pazarlama faaliyeti yapması izinsiz sermaye piyasası faaliyeti sayılır. FXPARTNER bir aracı kurum değil, bağımsız bir karşılaştırma ve inceleme platformudur. Bu sayfadaki hiçbir içerik yatırım tavsiyesi değildir.",
  },
  {
    q: "FXPARTNER brokerları nasıl puanlıyor?",
    a: "Her broker dört eksende puanlanır ve Index puanı bunların ortalamasıdır: regülasyon (lisansların gücü ve hangi tüzel kişiliğin hesabınızı tuttuğu), maliyet (spread, komisyon ve swap birlikte), platform (desteklenen platformlar ve araçlar) ve para çekme (bildirilen çekim deneyimi ve şikayet örüntüleri). Reklam ve komisyon gelirleri platformu finanse eder ancak daha iyi bir puan satın almaz; ortaklıklarımız her zaman sayfa üzerinde açıkça belirtilir.",
  },
  {
    q: "Prop firma ile forex brokeri arasındaki fark nedir?",
    a: "Forex brokerinde kendi paranızı yatırır ve kendi sermayenizle işlem yaparsınız; kâr da zarar da tamamen sizindir. Prop firmada ise bir değerlendirme sürecini (challenge) geçerek şirketin sermayesiyle işlem yaparsınız ve kârın anlaşılan yüzdesini alırsınız. Prop firmalar broker gibi lisanslanmaz ve kendi kural setleri vardır. İkisi farklı ürünlerdir; sitemizde ayrı bölümlerde ve ayrı kriterlerle değerlendirilir.",
  },
];

export default async function BrokerlarPage() {
  const reviewStats = await getBrokerReviewStats();
  const ranked = [...brokers].sort((a, b) => a.rank - b.rank);
  const top = ranked[0];
  const trackedRegulators = new Set([
    ...brokers.flatMap((b) => b.regulators),
    ...lookupBrokers.flatMap((b) => b.regulators ?? []),
  ]).size;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Forex Brokerleri", url: `${SITE_URL}/brokerlar` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      {/* AEO: sıralamanın kendisi makine tarafından okunabilir olsun ki cevap
          motorları listeyi tek tek broker sayfalarını taramadan alıntılayabilsin. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${YEAR} En İyi Forex Brokerleri`,
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: ranked.length,
            itemListElement: ranked.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: b.name,
              description: b.tagline,
              url: `${SITE_URL}/brokers/${b.slug}`,
            })),
          }),
        }}
      />

      <main className="flex-1 bg-paper-high">
        {/* Hero */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Forex Brokerleri
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {YEAR} en iyi forex brokerleri
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {brokers.length} aracı kurum; regülasyon gücü, gerçek işlem maliyeti,
              platform desteği ve para çekme deneyimi üzerinden bağımsız olarak
              puanlandı. Aynı kriterler herkese uygulanır.
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              <strong className="text-text-on-ink">Ortaklık, puanlamayı değiştirmez.</strong>{" "}
              Platformu reklam ve komisyon gelirleri finanse eder — bu gelir asla daha iyi
              bir puan satın almaz. Ticari ilişkimiz olan brokerlar sayfa üzerinde açıkça
              belirtilir.
            </p>
            <div className="mt-8">
              <HeroBrokerSearch />
            </div>
          </div>
        </section>

        {/* Sıralı liste */}
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-6 pb-20">
            <BrokerList brokers={ranked} reviewStats={reviewStats} />
          </div>
        </section>

        {/* Karşılaştırma tablosu — "forex broker karşılaştırma" hedefi */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-6xl px-6 pb-20">
            <h2 className="font-poppins text-3xl font-semibold md:text-4xl">
              Forex broker karşılaştırma tablosu
            </h2>
            <p className="mt-4 max-w-2xl text-text-on-ink-muted">
              Minimum yatırım, kaldıraç, regülasyon ve platform desteğini yan yana
              karşılaştırın. Kategoriye göre filtreleyebilirsiniz.
            </p>
            <div className="mt-8">
              <ComparisonTable />
            </div>
          </div>
        </section>

        {/* Kategoriler — long-tail iç linkleme */}
        <section>
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              İhtiyaca göre
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              Profilinize uygun brokeri bulun
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brokerCategories.map((cat) => {
                const info = categoryInfo[cat];
                const count = brokers.filter((b) =>
                  b.categories.includes(cat)
                ).length;
                return (
                  <Link
                    key={cat}
                    href={`/categories/${info.slug}`}
                    className="rounded-2xl border border-hairline-light bg-paper p-5 transition-colors hover:border-signal"
                  >
                    <h3 className="font-poppins text-base font-semibold text-text-dark">
                      {info.label}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-text-muted">
                      {info.description}
                    </p>
                    <span className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.1em] text-signal">
                      {count} broker →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Nasıl seçilir — AEO gövdesi */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              Nasıl seçilir
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold md:text-4xl">
              Forex brokeri seçerken bakılacak dört şey
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="font-poppins text-lg font-semibold">1. Regülasyon</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
                  Sadece &ldquo;lisanslı mı&rdquo; değil, <strong className="text-text-on-ink">sizin
                  hesabınızın hangi tüzel kişilik altında açıldığı</strong> önemli. Bir
                  grubun AB lisansı olması, sizi offshore bir şirkete kaydediyorsa o lisans
                  sizi korumaz. İncelemelerimizde bu ayrımı ayrıca belirtiyoruz. Şu an
                  takip ettiğimiz düzenleyici kurum sayısı: {trackedRegulators}.
                </p>
              </div>
              <div>
                <h3 className="font-poppins text-lg font-semibold">
                  2. Gerçek işlem maliyeti
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
                  Spread tek başına yanıltıcıdır. Komisyon ve gecelik taşıma maliyeti
                  (swap) ile birlikte hesaplanmalı. &ldquo;Sıfır komisyon&rdquo; genelde
                  spreadin geniş olduğu anlamına gelir.
                </p>
              </div>
              <div>
                <h3 className="font-poppins text-lg font-semibold">3. Para çekme deneyimi</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
                  Şikayetlerin büyük çoğunluğu buradan çıkar. En pratik yöntem: hesap
                  açtıktan sonra küçük bir tutarla çekim testi yapmak. Tekrarlayan,
                  kaynaklı çekim şikayeti olan brokerları{" "}
                  <Link href="/blacklist" className="text-signal hover:text-signal-strong">
                    risk uyarıları
                  </Link>{" "}
                  sayfamızda işaretliyoruz.
                </p>
              </div>
              <div>
                <h3 className="font-poppins text-lg font-semibold">4. Platform ve araçlar</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-text-on-ink-muted">
                  MT4, MT5, cTrader veya brokerın kendi platformu. Kullandığınız EA veya
                  gösterge varsa platform desteği belirleyici olur.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-hairline bg-ink-soft/60 p-6">
              <p className="text-sm leading-relaxed text-text-on-ink-muted">
                <strong className="text-text-on-ink">Şu anki lider:</strong> {top.name} —{" "}
                {getBrokerScores(top).composite.toFixed(1)} Index puanı. {top.summary}
              </p>
            </div>
          </div>
        </section>

        {/* SSS */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Sıkça Sorulan Sorular
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              Forex brokerleri hakkında
            </h2>
            <div className="mt-8 divide-y divide-hairline-light border-t border-hairline-light">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <h3 className="font-poppins text-base font-semibold text-text-dark">
                    {f.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-5">
              <Link
                href="/prop-firmalar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Prop firma karşılaştırması →
              </Link>
              <Link
                href="/cashback"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Cashback programları →
              </Link>
              <Link
                href="/pozisyon-hesaplayici"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Pozisyon hesaplayıcı →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
