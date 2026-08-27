import type { Metadata } from "next";
import { tr, trf } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import PropFirmComparisonTable from "@/components/PropFirmComparisonTable";
import PropFirmFeaturedCard from "@/components/PropFirmFeaturedCard";
import { propFirmsByScore, getPropFirmScores } from "@/data/propFirms";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { trData } from "@/lib/localizeContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// Yıl başlıkta bilinçli: Türkçe SERP'in tamamı "2026 En İyi …" kalıbıyla dolu.
// Tek yerden türetiliyor ki her yıl elle güncelleme gerekmesin.
const YEAR = new Date().getFullYear();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.prop-firmalar.title"].replace("{year}", String(YEAR)),
    description: t["page.prop-firmalar.description"],
    alternates: {
      canonical: localePath(locale, "/prop-firmalar"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/prop-firmalar")])
      ),
    },
    // Hedef kelimeler: "en iyi prop firma", "prop firma karşılaştırma",
    // "funded hesap". Türkçe aramada üç kalıp da kullanılıyor.
    openGraph: {
      url: `${SITE_URL}/prop-firmalar`,
    },
  };
}

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

export default async function PropFirmalarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const ranked = trData(propFirmsByScore());
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(trData(faqs))) }}
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
              {tr("Prop Firmalar")}
            </span>
            <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {trf("{year} en iyi prop firmaları", { year: YEAR })}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Funded account veren firmaları kural seti, challenge ücreti, drawdown limitleri, kâr paylaşımı ve")}{" "}
              <strong className="text-text-on-ink">{tr("ödeme sicili")}</strong>{" "}
              {tr("üzerinden karşılaştırın. Puanlama bağımsızdır; ticari ilişkimiz olan firmalar açıkça etiketlenir ve aynı kriterlerden geçer.")}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-on-ink-muted">
              {trf("Şu an {count} firma izleniyor. Bir firmanın", { count: ranked.length })}{" "}
              <strong className="text-text-on-ink">{tr("Ödeme Doğrulandı")}</strong>{" "}
              {tr("etiketi alabilmesi için son 30 gün içinden kaynağı kayıtlı bağımsız ödeme kanıtı sunmuş olması gerekir — bu doğrulama tamamlanmadan hiçbir firma site genelinde önerilmez.")}
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
              {tr("Nasıl değerlendiriyoruz")}
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              {tr("Puanlama neye göre yapılıyor")}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-text-dark/90">
              {tr("Her prop firma dört eksende, 5 üzerinden puanlanır ve Index puanı bu dört eksenin ortalamasının 10'luk karşılığıdır. Broker puanlamamızdan ayrı bir rubrik kullanıyoruz, çünkü prop firma bir broker değildir: burada ölçtüğümüz şey kaldıraç veya minimum yatırım değil, kural setinin geçilebilirliği ve firmanın ödeme yapıp yapmadığıdır.")}
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  {tr("Kural Seti")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {tr("Kâr hedefi, günlük ve toplam drawdown oranı, drawdown'ın statik mi trailing mi olduğu, minimum işlem günü şartı. Trailing drawdown, statik olana göre belirgin şekilde zordur ve puanı düşürür.")}
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  {tr("Maliyet")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {tr("Challenge ücreti ve — çoğu karşılaştırmanın atladığı kısım — ücretin ne zaman iade edildiği. İlk ödemede iade eden bir firma, üçüncü ödemede iade edenden gerçek maliyet olarak daha ucuzdur.")}
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  {tr("Ödeme Sicili")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {tr("Kâr paylaşımı oranı, ödeme döngüsü ve en önemlisi doğrulanabilir ödeme geçmişi. Bu eksen, kapanma riskinin de ölçüldüğü yerdir: faaliyet süresi kısa olan firma, kuralları cömert olsa bile buradan puan kaybeder.")}
                </p>
              </div>
              <div className="rounded-2xl border border-hairline-light bg-paper p-6">
                <h3 className="font-poppins text-lg font-semibold text-text-dark">
                  {tr("Şeffaflık")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {tr("Kuralların ne kadar net yazıldığı, kurumsal kimliğin açıklığı, gizli kısıtların (örneğin &ldquo;en iyi gün&rdquo; kuralı, EA sınırlamaları) önceden ilan edilip edilmediği.")}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-hairline-light bg-paper p-6">
              <p className="text-sm leading-relaxed text-text-muted">
                <strong className="text-text-dark">{tr("Şu anki lider:")}</strong> {top.name} —{" "}
                {trf("{score} Index puanı.", { score: getPropFirmScores(top).composite.toFixed(1) })}{" "}
                {top.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Risk uyarısı */}
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              {tr("Önce bunu okuyun")}
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold md:text-4xl">
              {tr("Prop firmalarda gerçek riskler")}
            </h2>
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-text-on-ink-muted">
              <p>
                <strong className="text-text-on-ink">
                  {tr("Challenge’ların büyük çoğunluğu başarısızlıkla sonuçlanır.")}
                </strong>{" "}
                {tr("Bu, kötü bir trader olduğunuz anlamına gelmez; kural setleri zaten sıkı risk limitleriyle tasarlanmıştır. Challenge ücretini, kaybetmeyi göze alabileceğiniz bir tutar olarak değerlendirin.")}
              </p>
              <p>
                <strong className="text-text-on-ink">{tr("Firma kapanma riski gerçektir.")}</strong>{" "}
                {tr("2020-2026 arasında 80'den fazla prop firma kapandı. Arkasında düzenlenmiş bir broker bulunan veya uzun faaliyet geçmişi olan firmalar bu riski düşürür, ancak sıfırlamaz.")}
              </p>
              <p>
                <strong className="text-text-on-ink">{tr("Düzenleyici tablo değişiyor.")}</strong>{" "}
                {tr("İtalya'da CONSOB, prop challenge'larını manipüle edilebilir zorluk seviyeleri ve ödenmeyen kâr payları gerekçesiyle uyardı; Belçika FSMA ve İspanya CNMV benzer uyarılar yayımladı. AB'de funded-account modelinin MiFID II kapsamına alınması değerlendiriliyor. Türkiye'de ise faaliyet SPK tarafından düzenlenmemiş bir gri alandadır.")}
              </p>
              <p>
                <strong className="text-text-on-ink">{tr("Kural ihlali hesabı sıfırlar.")}</strong>{" "}
                {tr("Copy trading yasağı, EA kısıtları ve haber ticareti sınırlamaları gerçektir; ihlal durumunda birikmiş kâr ödenmeden hesap kapatılabilir. Tablodaki her firma için copy trading durumunu detay satırında gösteriyoruz.")}
              </p>
              <p className="text-sm">
                {tr("Bu sayfadaki hiçbir içerik yatırım tavsiyesi değildir. Ayrıntılar için")}{" "}
                <Link href="/terms" className="text-signal hover:text-signal-strong">
                  {tr("Kullanım Şartları")}
                </Link>{" "}
                {tr("sayfamıza bakın.")}
              </p>
            </div>
          </div>
        </section>

        {/* SSS */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Sıkça Sorulan Sorular")}
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
              {tr("Prop firmalar hakkında")}
            </h2>
            <div className="mt-8 divide-y divide-hairline-light border-t border-hairline-light">
              {trData(faqs).map((f) => (
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
                href="/prop-firmalar/indirim-kodlari"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {tr("İndirim kodları →")}
              </Link>
              <Link
                href="/pozisyon-hesaplayici"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {tr("Pozisyon hesaplayıcı →")}
              </Link>
              <Link
                href="/brokerlar"
                className="font-mono text-xs uppercase tracking-[0.15em] text-signal hover:text-signal-strong"
              >
                {tr("Broker karşılaştırması →")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
