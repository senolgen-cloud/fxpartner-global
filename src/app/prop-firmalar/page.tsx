import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PropFirmComparisonTable from "@/components/PropFirmComparisonTable";
import PropFirmFeaturedCard from "@/components/PropFirmFeaturedCard";
import { propFirmsByScore, getPropFirmScores } from "@/data/propFirms";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Yıl başlıkta bilinçli: Türkçe SERP'in tamamı "2026 En İyi …" kalıbıyla dolu.
// Tek yerden türetiliyor ki her yıl elle güncelleme gerekmesin.
const YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  // Hedef kelimeler: "en iyi prop firma", "prop firma karşılaştırma",
  // "funded hesap". Türkçe aramada üç kalıp da kullanılıyor.
  title: `${YEAR} En İyi Prop Firmaları — Funded Hesap Karşılaştırması`,
  description: `Prop firmalarını (funded hesap) challenge kuralları, drawdown limitleri, ücretler, kâr paylaşımı ve ödeme sicili üzerinden karşılaştırın. Bağımsız puanlama, kaynaklı veri, indirim kodları. Prop firma nedir, hangisi güvenilir?`,
  alternates: { canonical: "/prop-firmalar" },
  openGraph: {
    title: `${YEAR} En İyi Prop Firmaları — FXPARTNER Karşılaştırması`,
    description:
      "Funded hesap veren firmalar, ödeme sicili dahil bağımsız kriterlerle puanlandı.",
    url: `${SITE_URL}/prop-firmalar`,
  },
};

// AEO notu: bu cevaplar kasıtlı olarak Türkçe ve statik HTML içinde. Sitenin
// diğer dilleri client-side Google Translate ile servis ediliyor ve AI/arama
// crawler'ları o çeviriyi hiç görmüyor — dolayısıyla alıntılanabilir cevabın
// kaynak dilde ve sunucuda render edilmiş olması gerekiyor. Sorular gerçek
// arama kalıplarıyla yazıldı, pazarlama diliyle değil.
const faqs = [
  {
    q: "Prop firma (funded account) nedir?",
    a: "Prop firma, trader'a kendi sermayesini riske atmadan bir şirketin sermayesiyle işlem yapma imkânı veren kuruluştur. Trader önce 'challenge' veya 'evaluation' adı verilen bir sınavı geçer: belirlenen kâr hedefine, günlük ve toplam zarar limitlerini aşmadan ulaşması gerekir. Başarılı olursa fonlanmış (funded) bir hesap alır ve elde ettiği kârın anlaşılan yüzdesini (genellikle %75-90) alır. Challenge ücreti tek seferlik ödenir ve çoğu firmada ilk ödemelerde iade edilir.",
  },
  {
    q: "Prop firma challenge'ı neden geçilemiyor?",
    a: "Challenge başarısızlıklarının büyük çoğunluğu kâr hedefine ulaşamamaktan değil, drawdown (zarar) limitinin aşılmasından kaynaklanır. İki ayrı limit vardır: günlük zarar limiti (tipik olarak %3-5) ve toplam zarar limiti (tipik olarak %6-10). Tek bir aşırı pozisyon her ikisini de tetikleyebilir. Bu yüzden challenge'ın asıl sınavı yön tahmini değil, pozisyon büyüklüğü yönetimidir: hesap büyüklüğüne ve firmanın limitine göre lot hesaplanmadan girilen işlemler en yaygın eleme sebebidir.",
  },
  {
    q: "1 aşamalı ve 2 aşamalı challenge arasındaki fark nedir?",
    a: "2 aşamalı (2-step) modelde iki ayrı fazı geçmeniz gerekir; genellikle birinci fazda %8-10, ikinci fazda %5 kâr hedefi vardır ve drawdown limitleri daha geniştir (tipik olarak %5 günlük / %10 toplam). 1 aşamalı (1-step) modelde tek faz vardır ve daha hızlı fonlanırsınız, ancak drawdown limitleri belirgin şekilde daha sıkıdır (tipik olarak %3 günlük / %6 toplam). Anında fonlama (instant funding) modelinde challenge yoktur, doğrudan fonlanmış hesap satın alınır; karşılığında ücret yüksek, kâr paylaşımı genelde düşüktür.",
  },
  {
    q: "Prop firma seçerken en önemli kriter nedir?",
    a: "Ödeme sicili. Kural seti ve ücret önemlidir, ancak ödemeyi yapmayan bir firmanın kuralları ne kadar cömert olursa olsun anlamsızdır. 2020-2026 arasında 80'den fazla prop firma kapandı; TrueForexFunds yaklaşık 1,2 milyon dolar ödenmemiş payout bırakarak battı, MyFundedFX Şubat 2026'da kapandı, MyForexFunds ise 2023'te CFTC tarafından kapatıldı. Bu yüzden firma seçerken faaliyet süresi, doğrulanabilir ödeme kanıtı ve firmanın arkasında düzenlenmiş bir broker olup olmadığı, indirim oranından çok daha belirleyicidir.",
  },
  {
    q: "Prop firmalarda copy trading ve sinyal kullanmak serbest mi?",
    a: "Çoğu prop firma copy trading'i açıkça yasaklar. Örneğin IC Funded, copy trading'i ve pasif yatırım stratejilerini yasaklar; EA (otomatik sistem) kullanımına ise 'hyperactivity' yaratmamak şartıyla izin verir. Sinyalleri manuel olarak uygulamak teknik olarak copy trading'den farklıdır, ancak bazı firmalar ikisini aynı maddede toplar. Bir sinyal servisi veya copy trading sistemi kullanmadan önce firmanın kural metnini okumanız, tercihen yazılı teyit almanız gerekir — kural ihlali, fonlanmış hesabın kâr birikmiş olsa bile iptal edilmesiyle sonuçlanır.",
  },
  {
    q: "Türkiye'de prop firma geliri yasal mı, vergisi var mı?",
    a: "Türkiye'de yerleşik kişilerin kendi inisiyatifleriyle yurt dışındaki firmalarda hesap açması ve işlem yapması yasak değildir; ancak prop firma faaliyeti SPK tarafından düzenlenmiş de değildir — bir gri alandır. Elde edilen gelirin yıllık gelir vergisi beyannamesinde beyan edilmesi gerekir; beyan yükümlülüğünün kapsamı kişinin yerleşiklik durumuna ve gelirin sınıflandırılmasına göre değişir. Bu bir vergi danışmanlığı değildir — kendi durumunuz için mali müşavirinize danışmanız gerekir.",
  },
];

export default function PropFirmalarPage() {
  const ranked = propFirmsByScore();
  const top = ranked[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Prop Firmalar", url: `${SITE_URL}/prop-firmalar` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      {/* AEO: sıralamanın kendisi makine tarafından okunabilir olsun ki
          cevap motorları listeyi tek tek sayfaları taramadan alıntılayabilsin. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Prop Firma Karşılaştırması",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: ranked.length,
            itemListElement: ranked.map((firm, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: firm.name,
              description: firm.tagline,
            })),
          }),
        }}
      />

      <main className="flex-1 bg-paper-high">
        {/* Hero */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              Prop Firmalar
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {YEAR} en iyi prop firmaları
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              Funded account veren firmaları kural seti, challenge ücreti, drawdown
              limitleri, kâr paylaşımı ve <strong className="text-text-on-ink">ödeme sicili</strong>{" "}
              üzerinden karşılaştırın. Puanlama bağımsızdır; ticari ilişkimiz olan
              firmalar açıkça etiketlenir ve aynı kriterlerden geçer.
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              Şu an {ranked.length} firma izleniyor. Bir firmanın{" "}
              <strong className="text-text-on-ink">Ödeme Doğrulandı</strong> etiketi
              alabilmesi için son 30 gün içinden kaynağı kayıtlı bağımsız ödeme kanıtı
              sunmuş olması gerekir — bu doğrulama tamamlanmadan hiçbir firma site
              genelinde önerilmez.
            </p>
          </div>
        </section>

        {/* Öne çıkan ortak — tablonun ÜSTÜNDE ama tablodan görsel olarak ayrı.
            Ticari yerleşim ile editoryal sıralamanın karışmaması için. */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-6xl px-6 pb-10">
            <PropFirmFeaturedCard />
          </div>
        </section>

        {/* Karşılaştırma tablosu */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-6xl px-6 pb-20">
            <PropFirmComparisonTable />
          </div>
        </section>

        {/* AEO gövdesi — alıntılanabilir düz metin cevaplar */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Nasıl değerlendiriyoruz
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              Puanlama neye göre yapılıyor
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-text-dark/90">
              Her prop firma dört eksende, 5 üzerinden puanlanır ve Index puanı bu dört
              eksenin ortalamasının 10&apos;luk karşılığıdır. Broker puanlamamızdan ayrı
              bir rubrik kullanıyoruz, çünkü prop firma bir broker değildir: burada
              ölçtüğümüz şey kaldıraç veya minimum yatırım değil, kural setinin
              geçilebilirliği ve firmanın ödeme yapıp yapmadığıdır.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Kural Seti
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Kâr hedefi, günlük ve toplam drawdown oranı, drawdown&apos;ın statik mi
                  trailing mi olduğu, minimum işlem günü şartı. Trailing drawdown,
                  statik olana göre belirgin şekilde zordur ve puanı düşürür.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Maliyet
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Challenge ücreti ve — çoğu karşılaştırmanın atladığı kısım — ücretin
                  ne zaman iade edildiği. İlk ödemede iade eden bir firma, üçüncü
                  ödemede iade edenden gerçek maliyet olarak daha ucuzdur.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Ödeme Sicili
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Kâr paylaşımı oranı, ödeme döngüsü ve en önemlisi doğrulanabilir ödeme
                  geçmişi. Bu eksen, kapanma riskinin de ölçüldüğü yerdir: faaliyet
                  süresi kısa olan firma, kuralları cömert olsa bile buradan puan kaybeder.
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  Şeffaflık
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  Kuralların ne kadar net yazıldığı, kurumsal kimliğin açıklığı,
                  gizli kısıtların (örneğin &ldquo;en iyi gün&rdquo; kuralı, EA
                  sınırlamaları) önceden ilan edilip edilmediği.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-hairline-light bg-paper p-6">
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">Şu anki lider:</strong> {top.name} —{" "}
                {getPropFirmScores(top).composite.toFixed(1)} Index puanı.{" "}
                {top.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Risk uyarısı */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              Önce bunu okuyun
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold md:text-4xl">
              Prop firmalarda gerçek riskler
            </h2>
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-text-on-ink-muted">
              <p>
                <strong className="text-text-on-ink">Challenge&apos;ların büyük
                çoğunluğu başarısızlıkla sonuçlanır.</strong> Bu, kötü bir trader
                olduğunuz anlamına gelmez; kural setleri zaten sıkı risk limitleriyle
                tasarlanmıştır. Challenge ücretini, kaybetmeyi göze alabileceğiniz bir
                tutar olarak değerlendirin.
              </p>
              <p>
                <strong className="text-text-on-ink">Firma kapanma riski gerçektir.</strong>{" "}
                2020-2026 arasında 80&apos;den fazla prop firma kapandı. Arkasında
                düzenlenmiş bir broker bulunan veya uzun faaliyet geçmişi olan firmalar
                bu riski düşürür, ancak sıfırlamaz.
              </p>
              <p>
                <strong className="text-text-on-ink">Düzenleyici tablo değişiyor.</strong>{" "}
                İtalya&apos;da CONSOB, prop challenge&apos;larını manipüle edilebilir
                zorluk seviyeleri ve ödenmeyen kâr payları gerekçesiyle uyardı; Belçika
                FSMA ve İspanya CNMV benzer uyarılar yayımladı. AB&apos;de funded-account
                modelinin MiFID II kapsamına alınması değerlendiriliyor. Türkiye&apos;de
                ise faaliyet SPK tarafından düzenlenmemiş bir gri alandadır.
              </p>
              <p>
                <strong className="text-text-on-ink">Kural ihlali hesabı sıfırlar.</strong>{" "}
                Copy trading yasağı, EA kısıtları ve haber ticareti sınırlamaları
                gerçektir; ihlal durumunda birikmiş kâr ödenmeden hesap kapatılabilir.
                Tablodaki her firma için copy trading durumunu detay satırında
                gösteriyoruz.
              </p>
              <p className="text-sm">
                Bu sayfadaki hiçbir içerik yatırım tavsiyesi değildir. Ayrıntılar için{" "}
                <Link href="/terms" className="text-signal hover:text-signal-strong">
                  Kullanım Şartları
                </Link>{" "}
                sayfamıza bakın.
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
              Prop firmalar hakkında
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

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/pozisyon-hesaplayici"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Pozisyon hesaplayıcı →
              </Link>
              <Link
                href="/brokerlar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                Broker karşılaştırması →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
