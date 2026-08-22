import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { createNowPaymentsCheckout } from "./checkout-actions";
import { lookupBrokers } from "@/data/brokerLookup";
import { breadcrumbSchema } from "@/lib/schema";
import type { PackageTier } from "@/lib/vip";
import { PACKAGE_TIER_INFO, PACKAGE_TIER_ORDER, FREE_TIER_INFO } from "@/data/packageTiers";
import { getDictionary } from "@/lib/dictionary";
import { tr } from "@/lib/chrome";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const trackedBrokerCount = lookupBrokers.length;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.paketler.title"],
    description: t["page.paketler.description"],
    alternates: {
      canonical: localePath(locale, "/paketler"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/paketler")])
      ),
    },
  };
}

const topFeatures = [
  { icon: "signal", title: "Anlık Sinyaller", sub: "Entry • SL • TP" },
  { icon: "chart", title: "Uzman Analizler", sub: "Günlük & Haftalık" },
  { icon: "shield", title: "Risk Yönetimi", sub: "Strateji & Disiplin" },
  { icon: "ai", title: "AI Destekli Analiz", sub: "Akıllı Piyasa Takibi" },
  { icon: "telegram", title: "Telegram VIP", sub: "Anlık Bildirimler" },
] as const;

const TIER_ACCENT: Record<PackageTier, string> = {
  pro: "text-signal",
  vip: "text-gold",
};
const TIER_CTA_LABEL: Record<PackageTier, string> = {
  pro: "Pro'ya Katıl",
  vip: "VIP'e Katıl",
};

const tiers = PACKAGE_TIER_ORDER.map((tier) => ({
  tier,
  ...PACKAGE_TIER_INFO[tier],
  accent: TIER_ACCENT[tier],
  ctaLabel: TIER_CTA_LABEL[tier],
  featured: tier === "pro",
}));

const partnerLogos = [
  { slug: "xm", name: "XM Global", src: "/brokers/xm.png" },
  { slug: "lite-finance", name: "Lite Finance", src: "/brokers/lite-finance.png" },
  { slug: "avatrade", name: "AvaTrade", src: "/brokers/avatrade.jpg" },
  { slug: "fxpro", name: "FxPro", src: "/brokers/fxpro.png" },
];

function FeatureIcon({ name }: { name: (typeof topFeatures)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "signal":
      return (
        <svg {...common} className="h-6 w-6">
          <path d="M4 20V10M11 20V4M18 20v-7" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} className="h-6 w-6">
          <path d="m3 17 5-5 4 4 8-9M14 7h6v6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} className="h-6 w-6">
          <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common} className="h-6 w-6">
          <path d="M9 3.5A2.5 2.5 0 0 1 11.5 6v.2A2.5 2.5 0 0 1 14 9v.3a2.6 2.6 0 0 1 2 2.5 2.6 2.6 0 0 1-1.4 2.3 2.6 2.6 0 0 1-2.4 3.6H12a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 9 3.5Z" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common} className="h-6 w-6" fill="currentColor" stroke="none">
          <path d="M21.94 4.6 18.6 20.24c-.25 1.13-.9 1.4-1.82.87l-5.04-3.72-2.43 2.34c-.27.27-.5.5-1.02.5l.36-5.15L18.5 6.5c.42-.37-.09-.58-.65-.21L6.4 13.5 1.4 11.94c-1.1-.34-1.11-1.1.23-1.62L20.55 3.4c.9-.34 1.7.2 1.39 1.2z" />
        </svg>
      );
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function PaketlerPage({
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
              { name: "Paketler", url: `${SITE_URL}/paketler` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-ink text-text-on-ink">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-hairline">
          <div
            aria-hidden="true"
            className="hero-glow-signal pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-signal/25 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="hero-glow-gold pointer-events-none absolute -right-16 top-10 h-[360px] w-[360px] rounded-full bg-gold/20 blur-[110px]"
          />
          <div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
              Profesyonel Forex Deneyimi
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              Sinyaller. <span className="text-signal">Analiz.</span> Strateji.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-text-on-ink-muted">
              {tr("Gerçek MT5 hesabımızdan gelen anlık sinyaller, uzman piyasa analizleri ve profesyonel risk yönetimi — ihtiyacına uygun pakette.")}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {topFeatures.map((f) => (
                <div key={f.title} className="flex flex-col items-center gap-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-ink-soft text-signal">
                    <FeatureIcon name={f.icon} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-on-ink">{f.title}</p>
                    <p className="text-xs text-text-on-ink-muted">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section id="paketler" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            {/* Free tier — an account, not a purchase, so it gets a register
                link instead of a checkout form. Rendered inline rather than
                folded into `tiers` because it has no price and no tier id to
                hand to createNowPaymentsCheckout. */}
            <div className="relative flex flex-col rounded-2xl border border-hairline bg-ink-soft/60 p-8">
              <h2 className="font-display text-2xl font-bold text-tick-up">{FREE_TIER_INFO.name}</h2>
              <p className="mt-2 text-sm text-text-on-ink-muted">{FREE_TIER_INFO.blurb}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-text-on-ink">$0</span>
                <span className="text-sm text-text-on-ink-muted">/ süresiz</span>
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {FREE_TIER_INFO.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-text-on-ink-muted">
                    <span className="text-tick-up">
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/account/register"
                className="mt-8 w-full rounded-full border border-hairline px-6 py-3 text-center text-sm font-semibold text-text-on-ink transition-colors hover:border-tick-up hover:text-tick-up"
              >
                {tr("Ücretsiz Hesap Aç →")}
              </Link>
            </div>

            {tiers.map((t) => (
              <div
                key={t.tier}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  t.featured
                    ? "border-signal bg-ink-soft shadow-[0_0_0_1px_color-mix(in_srgb,var(--signal)_35%,transparent),0_0_60px_-20px_var(--signal)] lg:-translate-y-3"
                    : "border-hairline bg-ink-soft/60"
                }`}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-signal px-4 py-1 text-xs font-semibold uppercase tracking-wide text-on-signal">
                    {tr("En Çok Tercih Edilen")}
                  </span>
                )}
                <h2 className={`font-display text-2xl font-bold ${t.accent}`}>{t.name}</h2>
                <p className="mt-2 text-sm text-text-on-ink-muted">{t.blurb}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-text-on-ink">${t.price}</span>
                  <span className="text-sm text-text-on-ink-muted">/ aylık</span>
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-on-ink-muted">
                      <span className={t.accent}>
                        <CheckIcon />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* NOWPayments (crypto) is the only checkout rail — Stripe
                    doesn't operate in Turkey, so there is no card path to
                    offer alongside it. */}
                <form action={createNowPaymentsCheckout.bind(null, t.tier)} className="mt-8">
                  <button
                    type="submit"
                    className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                      t.featured
                        ? "bg-signal text-on-signal hover:bg-signal-strong"
                        : "border border-hairline text-text-on-ink hover:border-text-on-ink"
                    }`}
                  >
                    ₿ {t.ctaLabel} →
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

        {/* Trust bar — only real, verifiable figures, no invented stats */}
        <section className="border-y border-hairline bg-ink-soft">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-10 text-center sm:grid-cols-4">
            <div>
              <div className="font-display text-2xl font-semibold">{trackedBrokerCount}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                Takip Edilen Broker
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold">Gerçek MT5</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                Tracked Hesap
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold">7/24</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                Destek
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-semibold">₿ Kripto</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                {tr("Güvenli Ödeme")}
              </div>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-hairline bg-ink-soft p-8 text-center md:flex-row md:text-left">
            <div>
              <p className="font-display text-2xl font-semibold">
                Piyasayı takip etmek yerine,{" "}
                <span className="text-signal">sistemli takip edin.</span>
              </p>
              <p className="mt-2 text-sm text-text-on-ink-muted">
                {tr("FXPARTNER ile profesyonel forex deneyiminizi bugün başlatın.")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <a
                href="#paketler"
                className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
              >
                {tr("Paketleri İncele")}
              </a>
              <a
                href="https://t.me/fxpartnerglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-on-ink-muted hover:text-signal"
              >
                t.me/fxpartnerglobal
              </a>
            </div>
          </div>
        </section>

        {/* Partner brokers */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-5xl px-6 py-14 text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
              {tr("Güvenilir Broker Ortakları")}
            </span>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {partnerLogos.map((p) => (
                <Link
                  key={p.slug}
                  href={`/brokers/${p.slug}`}
                  title={`${p.name} review`}
                  className="relative h-8 w-24 grayscale transition-all hover:grayscale-0"
                >
                  <Image src={p.src} alt={p.name} fill sizes="96px" className="object-contain" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-14">
          <p className="text-center text-xs leading-relaxed text-text-on-ink-muted">
            {tr("Forex işlemleri yüksek risk içerir ve tüm yatırımcılar için uygun olmayabilir. Yatırım yapmadan önce riskleri anlamanız önemlidir. Geçmiş performans gelecekteki sonuçların garantisi değildir.")}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
