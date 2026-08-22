import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import HeroBrokerSearch from "@/components/HeroBrokerSearch";
import NewsletterSignup from "@/components/NewsletterSignup";
import {
  getBulletinTitle,
  isoToBulletinSlug,
  technicalAnalysisPosts,
} from "@/data/technicalAnalysis";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const INSTAGRAM_URL = "https://www.instagram.com/fxpartner_global/";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.instagram.title"],
    description: t["page.instagram.description"],
    alternates: {
      canonical: localePath(locale, "/instagram"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/instagram")])
      ),
    },
  };
}

// Bio-link landing page. Instagram flags redirect chains and affiliate
// hops, so this page is the ONLY destination the bio link points at:
// every onward link from here stays on our own domain (or goes to a
// channel we actually own). Nothing here sells signals, VIP tiers or
// copytrade returns — see docs/instagram-strategy.md for why that
// content is deliberately kept off the Instagram funnel.

// Newest bulletin day first. ISO strings sort lexicographically, so a
// plain string sort is correct here and avoids Date/timezone parsing.
const bulletinDates = [...new Set(technicalAnalysisPosts.map((p) => p.publishedAt))]
  .sort()
  .reverse();
const latestDate: string | undefined = bulletinDates[0];
const latestPosts = latestDate
  ? technicalAnalysisPosts.filter((p) => p.publishedAt === latestDate).slice(0, 4)
  : [];

// Formatted from the ISO parts rather than through Date, so the rendered
// day can never shift by one under a different server timezone.
function formatTrDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

const tools = [
  {
    href: "/broker-lookup",
    icon: "🔎",
    title: "Broker Sorgula",
    body: "Aracı kurumun regülasyon durumunu, lisans numarasını ve şikayet geçmişini kontrol edin.",
  },
  {
    href: "/blacklist",
    icon: "⚠️",
    title: "Risk Uyarı Listesi",
    body: "Bağımsız güven puanı düşük veya tekrarlayan şikayet örüntüsü olan aracı kurumlar.",
  },
  {
    href: "/pozisyon-hesaplayici",
    icon: "🧮",
    title: "Pozisyon Hesaplayıcı",
    body: "Bakiyenize ve stop mesafenize göre lot büyüklüğünü ve risk tutarını hesaplayın.",
  },
  {
    href: "/ekonomik-takvim",
    icon: "🗓️",
    title: "Ekonomik Takvim",
    body: "Haftanın veri açıklamaları, beklentiler ve önceki dönem rakamları tek ekranda.",
  },
  {
    href: "/brokers",
    icon: "📊",
    title: "Broker Karşılaştırma",
    body: "Regülasyon, spread, komisyon ve platform desteğine göre sıralanmış incelemeler.",
  },
  {
    href: "/haber-bulteni",
    icon: "📰",
    title: "Haber Bülteni",
    body: "Piyasayı hareket ettiren gelişmeler, kaynağıyla birlikte günlük derleme.",
  },
];

const transparency = [
  {
    title: "Instagram'da sinyal paylaşmıyoruz",
    body: "Sosyal medyada işlem talimatı vermiyoruz. Paylaştığımız içerik piyasada ne olduğunu anlatan bilgi ve eğitim içeriğidir.",
  },
  {
    title: "Kazanç ekran görüntüsü yayınlamıyoruz",
    body: "Kâr tablosu, bakiye görseli veya getiri vaadi paylaşmıyoruz. Kaldıraçlı işlemlerde kayıp da sonucun bir parçasıdır.",
  },
  {
    title: "Ücretli iş birliğini etiketliyoruz",
    body: "Bir içerik sponsorluysa bunu açıkça belirtiyoruz. Broker incelemelerimizin kriterleri ve kaynakları sitede açık.",
  },
];

export default async function InstagramLandingPage({
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
              { name: "Instagram", url: `${SITE_URL}/instagram` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-ink text-text-on-ink">
        {/* Hero */}
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-hairline bg-ink-soft px-4 py-1.5 text-xs font-medium tracking-wide text-signal transition-colors hover:border-signal"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
              </svg>
              @fxpartner_global
            </a>
            <h1 className="mt-5 font-poppins text-3xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              Instagram&apos;dan geldiniz.{" "}
              <span className="text-signal">Aradığınız her şey burada.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-text-on-ink-muted">
              {tr("FXPARTNER, forex aracı kurumlarını regülasyon, maliyet ve şikayet kayıtlarına göre inceleyen bağımsız bir kaynaktır. Aşağıdaki araçların tamamı ücretsizdir; hesap açmanıza gerek yok.")}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-text-on-ink-muted">
              {tr("Bu sayfadaki hiçbir içerik yatırım tavsiyesi değildir. CFD ve kaldıraçlı işlemler yüksek risk taşır; yatırdığınız tutarın tamamını kaybedebilirsiniz.")}
            </p>
          </div>
        </section>

        {/* Broker search — the single most-asked question from social traffic */}
        <section className="border-b border-hairline bg-ink-soft">
          <div className="mx-auto max-w-2xl px-6 py-14">
            <h2 className="text-center font-display text-lg font-semibold">
              {tr("Aracı kurumunuz regüle mi?")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-text-on-ink-muted">
              {tr("İsmi yazın — lisans durumunu, denetleyen kurumu ve bilinen şikayet örüntülerini gösterelim.")}
            </p>
            <div className="mt-6">
              <HeroBrokerSearch />
            </div>
          </div>
        </section>

        {/* Latest technical bulletin */}
        {latestDate && (
          <section className="border-b border-hairline">
            <div className="mx-auto max-w-5xl px-6 py-16">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
                    {tr("Günlük Bülten")}
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-semibold">
                    {getBulletinTitle(latestDate)}
                  </h2>
                </div>
                <Link
                  href={`/teknik-analiz/${isoToBulletinSlug(latestDate)}`}
                  className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
                >
                  {tr("Bülteni Oku")}
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {latestPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/teknik-analiz/${isoToBulletinSlug(post.publishedAt)}`}
                    className="rounded-2xl border border-hairline bg-ink-soft p-5 transition-colors hover:border-signal"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-base font-semibold">{post.instrument}</span>
                      <span className="font-mono text-[11px] uppercase tracking-wide text-text-on-ink-muted">
                        {post.timeframe}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
                      {post.headline}
                    </p>
                  </Link>
                ))}
              </div>

              {bulletinDates.length > 1 && (
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-on-ink-muted">
                    {tr("Önceki günler")}
                  </span>
                  {bulletinDates.slice(1, 6).map((iso) => (
                    <Link
                      key={iso}
                      href={`/teknik-analiz/${isoToBulletinSlug(iso)}`}
                      className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[11px] text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
                    >
                      {formatTrDate(iso)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Free tools */}
        <section className="border-b border-hairline bg-ink-soft">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Ücretsiz Araçlar")}
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              {tr("Instagram'da bahsettiğimiz her şey")}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="rounded-2xl border border-hairline bg-ink p-6 transition-colors hover:border-signal"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal/15 text-lg">
                    {tool.icon}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">{tool.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Editorial transparency — the positioning the account is built on */}
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Yayın İlkelerimiz")}
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              {tr("Instagram hesabımızda neyi paylaşmayız?")}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {transparency.map((item) => (
                <div key={item.title} className="rounded-2xl border border-hairline bg-ink-soft p-6">
                  <h3 className="font-display text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">{item.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-text-on-ink-muted">
              Nasıl çalıştığımızı ve gelir modelimizi{" "}
              <Link href="/about" className="text-signal underline-offset-4 hover:underline">
                {tr("Hakkımızda")}
              </Link>{" "}
              sayfasında açıklıyoruz. Bir aracı kurumla sorun yaşadıysanız{" "}
              <Link href="/complaint" className="text-signal underline-offset-4 hover:underline">
                {tr("şikayet kaydı")}
              </Link>{" "}
              {tr("açabilirsiniz.")}
            </p>
          </div>
        </section>

        {/* Channels */}
        <section className="border-b border-hairline bg-ink-soft">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Bağlantıda Kalın")}
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              {tr("Günlük bülteni kaçırmayın")}
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-hairline bg-ink p-6 md:col-span-1">
                <h3 className="font-display text-base font-semibold">📧 E-posta bülteni</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
                  {tr("Günlük teknik bülten ve broker güncellemeleri doğrudan e-postanıza. Spam yok, tek tıkla çıkabilirsiniz.")}
                </p>
                <div className="mt-4">
                  <NewsletterSignup source="instagram-landing" />
                </div>
              </div>

              <a
                href="https://t.me/fxpartnerglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-hairline bg-ink p-6 transition-colors hover:border-signal"
              >
                <h3 className="font-display text-base font-semibold">📣 Telegram kanalı</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
                  {tr("Bülten yayınlandığında ilk bildirim burada. @fxpartnerglobal")}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-signal">
                  {tr("Kanala katıl →")}
                </span>
              </a>

              <a
                href="https://x.com/fxpartner_TR"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-hairline bg-ink p-6 transition-colors hover:border-signal"
              >
                <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X (Twitter)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
                  {tr("Piyasa haberleri ve veri açıklamaları anlık akışta. @fxpartner_TR")}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-signal">
                  Takip et →
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Risk disclosure */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-14">
            <div className="rounded-2xl border border-alert/40 bg-alert/5 p-6">
              <h2 className="font-display text-base font-semibold text-text-on-ink">
                {tr("Risk Uyarısı")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                {tr("Kaldıraçlı forex ve CFD işlemleri yüksek risk taşır ve her yatırımcı için uygun değildir. Kaldıraç, kâr kadar zararı da büyütür; yatırdığınız sermayenin tamamını kaybetme ihtimaliniz vardır. Bu sitedeki içerikler genel bilgilendirme amaçlıdır, kişiye özel yatırım tavsiyesi veya alım-satım önerisi değildir. İşlem yapmadan önce bilgi ve tecrübenizi değerlendirin, gerekirse bağımsız bir uzmandan destek alın.")}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-on-ink-muted">
                Ayrıntılar için{" "}
                <Link href="/terms" className="underline underline-offset-4">
                  {tr("Kullanım Koşulları")}
                </Link>{" "}
                ve{" "}
                <Link href="/privacy" className="underline underline-offset-4">
                  {tr("Gizlilik Politikası")}
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
