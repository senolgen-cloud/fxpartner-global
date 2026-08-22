import type { Metadata } from "next";
import { tr } from "@/lib/chrome";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import Link from "@/components/LocaleLink";
import Image from "next/image";
import Footer from "@/components/Footer";
import { brokers } from "@/data/brokers";
import { breadcrumbSchema } from "@/lib/schema";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";
const OG_IMAGE = `${SITE_URL}/campaigns/lite-finance-refer-a-friend.jpg`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.campaigns.title"],
    description: t["page.campaigns.description"],
    alternates: {
      canonical: localePath(locale, "/campaigns"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/campaigns")])
      ),
    },
    openGraph: {
      url: `${SITE_URL}/campaigns`,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1136, height: 757 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE],
    },
  };
}

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const campaigns = brokers.filter((b) => b.promotion);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Kampanyalar", url: `${SITE_URL}/campaigns` },
            ])
          ),
        }}
      />
      <main className="flex-1 bg-paper-high">
        <section className="bg-ink text-text-on-ink">
          <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
              Kampanyalar
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              {tr("Güncel broker kampanyaları")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-on-ink-muted">
              {tr("FXPARTNER partner brokerlarının aktif referans ve yatırım kampanyaları, değiştikçe tek bir yerde toplanıyor. Şartlar brokera ve ülkeye göre değişir — katılmadan önce her zaman güncel koşulları doğrulayın.")}
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-6 py-16">
            {campaigns.length === 0 ? (
              <p className="text-[15px] text-text-muted">
                {tr("Şu anda aktif kampanya yok — yakında tekrar kontrol edin.")}
              </p>
            ) : (
              <div className="divide-y divide-hairline-light border-t border-hairline-light">
                {campaigns.map((broker) => (
                  <div key={broker.slug} id={broker.slug} className="scroll-mt-24 py-10">
                    <div className="flex items-center gap-3">
                      {broker.logo && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-hairline-light bg-white p-1.5">
                          <Image
                            src={broker.logo}
                            alt={broker.name}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-gold">
                          {broker.promotion!.tag}
                        </span>
                        <h2 className="notranslate font-display text-2xl font-semibold text-text-dark">
                          {broker.name}
                        </h2>
                      </div>
                    </div>

                    {broker.promotion!.image && (
                      <div className="relative mt-6 aspect-[1672/941] w-full max-w-2xl overflow-hidden rounded-2xl border border-hairline-light">
                        <Image
                          src={broker.promotion!.image}
                          alt={broker.promotion!.title}
                          fill
                          sizes="(min-width: 768px) 672px, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <h3 className="mt-5 font-display text-xl font-semibold text-text-dark">
                      {broker.promotion!.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-dark/90">
                      {broker.promotion!.intro}
                    </p>

                    <ol className="mt-5 space-y-3">
                      {broker.promotion!.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-[15px] text-text-dark/90">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-xs text-text-dark">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={broker.promotion!.ctaUrl ?? broker.referralUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
                      >
                        {broker.promotion!.ctaLabel ?? `${broker.name} Hesabı Aç`}
                      </a>
                      {broker.promotion!.contactEmail && (
                        <a
                          href={`mailto:${broker.promotion!.contactEmail}`}
                          className="rounded-full border border-hairline-light px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-text-dark"
                        >
                          Referans Linkiniz İçin {broker.name}&apos;a E-posta Gönderin
                        </a>
                      )}
                      <Link
                        href={`/brokers/${broker.slug}`}
                        className="rounded-full border border-hairline-light px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-text-dark"
                      >
                        {broker.name} Tam İnceleme →
                      </Link>
                    </div>

                    <p className="mt-5 text-xs leading-relaxed text-text-muted">
                      {broker.promotion!.note}
                    </p>
                  </div>
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
