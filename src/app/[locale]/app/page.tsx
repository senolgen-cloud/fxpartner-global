import type { Metadata } from "next";
import Image from "next/image";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import InstallAppButtons from "@/components/InstallAppButtons";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";
import { trData } from "@/lib/localizeContent";

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
    title: t["page.app.title"],
    description: t["page.app.description"],
    alternates: {
      canonical: localePath(locale, "/app"),
      languages: Object.fromEntries(locales.map((l) => [hreflangCode[l], localePath(l, "/app")])),
    },
    openGraph: {
      title: t["page.app.title"],
      description: t["page.app.description"],
      url: `${SITE_URL}${localePath(locale, "/app")}`,
      images: [{ url: `${SITE_URL}/fxpartner-hero-app.png`, width: 1671, height: 941 }],
    },
  };
}

// The three facts the page is built on. Every store-app page in this
// industry opens with a row of App Store and Play badges; this app has
// neither, and pretending otherwise would be both a lie and a worse
// argument than the truth — there is nothing to download, nothing to
// update, and nothing to sign up for before you can look.
const FACTS = [
  {
    label: "Mağaza yok",
    body: "App Store veya Play Store üzerinden aranmaz. Tarayıcıdan kurulur, ana ekranda kendi simgesiyle durur.",
  },
  {
    label: "İndirme yok",
    body: "Ayrı bir uygulama paketi inmez. Güncelleme de istemez — her açılışta zaten güncel sürümü açarsınız.",
  },
  {
    label: "Hesap gerekmez",
    body: "Kurmak için üye olmanız gerekmiyor. Sinyalleri takip etmek istediğinizde ücretsiz üyelik yeterli.",
  },
];

// Everything here is a page that already exists and does what the line
// says. A feature list on an app page is a promise, and the fastest way
// to break one is to write it before the feature.
const FEATURES: { title: string; body: string; href: string; cta: string }[] = [
  {
    title: "Canlı işlem sinyalleri",
    body: "Gerçek bir MT5 hesabından açılan pozisyonlar, giriş, zarar durdur ve kâr al seviyeleriyle birlikte — ve kapandığında sonucuyla.",
    href: "/signals",
    cta: "Sinyalleri gör",
  },
  {
    title: "Anlık bildirimler",
    body: "Yeni sinyal, güncellenen pozisyon, günlük analiz ve haber bülteni yayınlandığında telefonunuza bildirim düşer.",
    href: "/kurulum",
    cta: "Bildirimleri aç",
  },
  {
    title: "Ekonomik takvim",
    body: "CPI, tarım dışı istihdam ve faiz kararları; beklenti ile açıklanan rakam yan yana, açıklandığı anda.",
    href: "/ekonomik-takvim",
    cta: "Takvimi aç",
  },
  {
    title: "Yapay zeka asistanı",
    body: "Piyasa, enstrüman ve platform sorularınızı sorun. Yön tahmini vermez; ne bildiğini ve neyi bilmediğini söyler.",
    href: "/ai-asistan",
    cta: "Asistanı dene",
  },
  {
    title: "Broker karşılaştırma",
    body: "Regülasyon, maliyet, platform ve para çekme eksenlerinde puanlanmış broker sıralaması — ve şikayet kayıtları.",
    href: "/brokerlar",
    cta: "Sıralamayı gör",
  },
  {
    title: "Günlük analiz ve bülten",
    body: "Teknik analiz bültenleri ve günün finans gündemini derleyen haber bülteni, her gün sitede.",
    href: "/piyasa-analizi",
    cta: "Analizleri oku",
  },
];

const PLATFORMS = [
  {
    name: "iPhone / iPad",
    how: "Safari'de açın, Paylaş simgesine dokunun, \"Ana Ekrana Ekle\" deyin. Bildirimler yalnızca bu adımdan sonra çalışır.",
  },
  {
    name: "Android",
    how: "Chrome'da açın, sağ üstteki menüden \"Uygulamayı yükle\" seçeneğine dokunun.",
  },
  {
    name: "Windows / macOS",
    how: "Chrome veya Edge'in adres çubuğundaki yükle simgesine tıklayın. Uygulama kendi penceresinde açılır.",
  },
];

const faqs = [
  {
    q: "Bu gerçek bir uygulama mı?",
    a: "Kurulduktan sonra ana ekranınızda kendi simgesiyle durur, tarayıcı çubuğu olmadan tam ekran açılır ve bildirim gönderebilir. Teknik olarak bir web uygulamasıdır (PWA), bu yüzden App Store veya Play Store'da listelenmez.",
  },
  {
    q: "Kurmak ücretli mi?",
    a: "Hayır. Kurulum ücretsizdir ve üyelik gerektirmez. Forex sinyallerini takip etmek için ücretsiz üyelik yeterlidir; GOLD, endeks, kripto ve enerji sinyalleri paketlere bağlıdır.",
  },
  {
    q: "Telefonumda ne kadar yer kaplar?",
    a: "Ayrı bir uygulama paketi indirilmediği için mağazadan kurulan bir uygulamaya kıyasla çok küçük bir yer kaplar; sakladığı şey tarayıcının zaten tuttuğu önbellektir.",
  },
  {
    q: "Güncelleme yapmam gerekir mi?",
    a: "Hayır. Uygulamayı her açtığınızda sitenin güncel sürümü açılır; bekleyen bir güncelleme veya sürüm farkı olmaz.",
  },
  {
    q: "iPhone'da bildirim gelmiyor, neden?",
    a: "iOS'ta bildirimler yalnızca uygulama ana ekrana eklendikten sonra çalışır — Safari sekmesinden asla çalışmaz. Ekledikten sonra uygulamayı ana ekrandan açın ve bildirim iznini orada verin.",
  },
];

export default async function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  setServerLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Uygulama", url: `${SITE_URL}${localePath(locale, "/app")}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(trData(faqs))) }}
      />

      <main className="flex-1 bg-paper-high">
        {/* Hero. The product shot is the argument — one account on a laptop
            and a phone at once — so it gets the width on desktop and sits
            under the copy on a phone, where a side-by-side would shrink
            both halves into illegibility. */}
        <section className="relative overflow-hidden bg-ink text-text-on-ink">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-signal/20 blur-[120px]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                {tr("FXPARTNER Uygulaması")}
              </span>
              <h1 className="mt-4 font-poppins text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                {tr("Uygulama mağazasına uğramanıza gerek yok.")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
                {tr(
                  "FXPARTNER telefonunuzun ana ekranına birkaç dokunuşla eklenir ve gerçek bir uygulama gibi açılır: kendi simgesi, tam ekran ve bildirimler. İndirilecek bir paket, beklenecek bir güncelleme yok."
                )}
              </p>
              <div className="mt-8">
                <InstallAppButtons />
              </div>
              <p className="mt-4 font-mono text-xs text-text-on-ink-muted">
                {tr("Adım adım anlatım için")}{" "}
                <Link href="/kurulum" className="text-signal underline underline-offset-4">
                  {tr("kurulum rehberi")}
                </Link>
                .
              </p>
            </Reveal>

            <Reveal delay={120}>
              <Image
                src="/fxpartner-hero-app.png"
                alt={tr("FXPARTNER uygulaması bilgisayar ve telefon ekranında")}
                width={1671}
                height={941}
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="h-auto w-full"
              />
            </Reveal>
          </div>
        </section>

        {/* The signature band: what this app is instead of a store listing.
            Hairlines rather than cards — three statements a reader can take
            in at a glance, not three boxes competing for attention. */}
        <section className="border-y border-hairline-light bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-hairline-light">
              {trData(FACTS).map((fact, i) => (
                <Reveal key={fact.label} delay={i * 90} className={i > 0 ? "sm:ps-8" : "sm:pe-8"}>
                  <p className="font-poppins text-xl font-semibold text-text-dark">{fact.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{fact.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What it does. Every card links to the page that already does it,
            so the list is checkable rather than promised. */}
        <section className="bg-paper-high">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <Reveal>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">
                {tr("Uygulamada ne var")}
              </span>
              <h2 className="mt-3 font-poppins text-3xl font-semibold text-text-dark md:text-4xl">
                {tr("Ana ekranınızdaki tek simgede")}
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {trData(FEATURES).map((feature, i) => (
                <Reveal key={feature.href + feature.title} delay={(i % 2) * 90}>
                  <Link
                    href={feature.href}
                    className="group flex h-full flex-col rounded-2xl border border-hairline-light bg-paper p-6 transition-colors hover:border-signal"
                  >
                    <h3 className="font-poppins text-lg font-semibold text-text-dark">
                      {feature.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                      {feature.body}
                    </p>
                    <span className="mt-4 font-mono text-xs uppercase tracking-[0.15em] text-signal">
                      {feature.cta} →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Platforms. One line each, then the guide — the full walkthrough
            already exists at /kurulum and duplicating it here would give us
            two copies to keep in step with the browsers. */}
        <section className="border-t border-hairline-light bg-paper">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <Reveal>
              <h2 className="font-poppins text-3xl font-semibold text-text-dark">
                {tr("Her cihazda aynı uygulama")}
              </h2>
              <p className="mt-3 max-w-2xl text-text-muted">
                {tr("Kurulum cihaza göre bir iki adım değişir; kurulan uygulama aynıdır.")}
              </p>
            </Reveal>

            <div className="mt-8 divide-y divide-hairline-light border-y border-hairline-light">
              {trData(PLATFORMS).map((platform) => (
                <div key={platform.name} className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <p className="font-poppins font-semibold text-text-dark">{platform.name}</p>
                  <p className="text-sm leading-relaxed text-text-muted">{platform.how}</p>
                </div>
              ))}
            </div>

            <Link
              href="/kurulum"
              className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
            >
              {tr("Adım adım kurulum rehberi")}
            </Link>
          </div>
        </section>

        <section className="border-t border-hairline-light bg-paper-high">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <Reveal>
              <h2 className="font-poppins text-3xl font-semibold text-text-dark">
                {tr("Sık sorulanlar")}
              </h2>
            </Reveal>
            <dl className="mt-8 divide-y divide-hairline-light border-y border-hairline-light">
              {trData(faqs).map((faq) => (
                <div key={faq.q} className="py-5">
                  <dt className="font-poppins font-semibold text-text-dark">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-text-muted">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <Reveal>
              <h2 className="font-poppins text-3xl font-semibold md:text-4xl">
                {tr("Şimdi ana ekranınıza ekleyin")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-text-on-ink-muted">
                {tr("Bir dakika sürmez ve geri almak için simgeyi silmeniz yeterli.")}
              </p>
              <div className="mt-8 flex justify-center">
                <InstallAppButtons />
              </div>
            </Reveal>
            <p className="mt-10 text-xs leading-relaxed text-text-on-ink-muted">
              {tr(
                "FXPARTNER bir aracı kurum değildir ve emir iletimine aracılık etmez; içerikleri eğitim ve bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk içerir."
              )}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
