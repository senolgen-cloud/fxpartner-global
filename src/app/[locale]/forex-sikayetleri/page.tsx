import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { trData } from "@/lib/localizeContent";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Footer from "@/components/Footer";
import ComplaintForm from "@/components/ComplaintForm";
import { brokers } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

// The three steps the creative sets out, in the page's own words. The copy
// tracks the lead paragraph above rather than the banner's badge — see the
// note at the render site for why step three does not promise a deadline.
const complaintSteps: { title: string; body: string }[] = [
  {
    title: "Şikayetiniz incelenir",
    body: "Gelen her şikayeti okuyup değerlendiriyoruz; hangi brokerla ilgili olduğuna bakmaksızın.",
  },
  {
    title: "Aracı kuruma iletilir",
    body: "48 saat içinde ilgili aracı kurumla iletişime geçmeye çalışıyoruz.",
  },
  {
    title: "Sonuç size bildirilir",
    body: "Bulgularımızı e-posta ile size iletiyoruz; incelemelerimizde gördüğümüz eğilimleri de yayınlıyoruz.",
  },
];

const complaintAssurances: string[] = [
  "Bağımsız inceleme",
  "Şeffaf süreç",
  "Güvenli iletişim",
];

// The share card, one per language tree. All four 1672x941, the house
// creative size.
//
// A designed banner has its headline baked into the pixels, so one file
// cannot serve four trees: a reader sharing /ar/forex-sikayetleri would
// otherwise post a card written in Turkish. Every locale the site has runs
// its own artwork, and Record<Locale, string> is what makes that a compile
// error to forget — add a fifth locale and this stops building until it has
// a card.
//
// ASCII filenames on purpose. The four were uploaded under public/şikayet/
// with their own headlines as filenames — one of them containing an Arabic
// question mark — and an OG URL is fetched by Facebook's, X's and
// Telegram's crawlers rather than by a browser that has already normalised
// the address. A non-ASCII path is exactly where that breaks; same
// reasoning as the note in lib/ogPoster.tsx.
const OG_IMAGE_BY_LOCALE: Record<Locale, string> = {
  tr: "forex-sikayet-fxpartner",
  en: "complaint-forex-fxpartner-global",
  ua: "forex-skarga-fxpartner-ua",
  ar: "forex-shakwa-fxpartner-ar",
};

const ogImageFor = (locale: Locale) =>
  `${SITE_URL}/sikayet/${OG_IMAGE_BY_LOCALE[locale]}.png`;

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
      canonical: localePath(locale, "/forex-sikayetleri"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/forex-sikayetleri")])
      ),
    },
    openGraph: {
      title: t["page.complaint.title"],
      description: t["page.complaint.description"],
      url: `${SITE_URL}${localePath(locale, "/forex-sikayetleri")}`,
      type: "website",
      images: [{ url: ogImageFor(locale), width: 1672, height: 941 }],
    },
    twitter: { card: "summary_large_image", images: [ogImageFor(locale)] },
  };
}

export default async function ComplaintPage({
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
              { name: "Forex Şikayetleri", url: `${SITE_URL}/forex-sikayetleri` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              {tr("Şikayetler")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Bir aracı kurumla sorun mu yaşadınız?")}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("Bize ne olduğunu anlatın. Her şikayeti inceliyor, 48 saat içinde aracı kurumla iletişime geçmeye çalışıyor ve bulgularımızı size e-posta ile bildiriyoruz.")}
            </p>
          </div>
        </section>

        <section className="border-b border-hairline bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 pb-16">
            <ol className="grid gap-4 sm:grid-cols-3">
              {trData(complaintSteps).map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-hairline bg-ink-soft/30 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-signal/30 bg-signal/10 font-mono text-xs text-signal">
                      {i + 1}
                    </span>
                    <h2 className="font-poppins text-sm font-semibold uppercase tracking-[0.06em] text-text-on-ink">
                      {step.title}
                    </h2>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-text-on-ink-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>

            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-hairline px-5 py-4 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              {trData(complaintAssurances).map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-2xl px-6 py-16">
            <ComplaintForm brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))} />
            <p className="mt-8 text-xs leading-relaxed text-text-muted">
              {tr("FXPARTNER bir düzenleyici kurum değildir ve bir aracı kurumu yanıt vermeye veya sizi tazmin etmeye zorlayamaz. Doğrulanmış şikayetleri ilgili aracı kuruma iletir ve incelemelerimizde gördüğümüz eğilimleri yayınlarız. Resmi/hukuki işlem için yerel finansal düzenleyici kurumunuzla iletişime geçin.")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
