import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SignalsBoard from "@/components/SignalsBoard";
import HeroProductShot from "@/components/HeroProductShot";
import LiveMarketsGrid from "@/components/LiveMarketsGrid";
import RotatingBrokerAd from "@/components/RotatingBrokerAd";
import SponsoredLeaderboard from "@/components/SponsoredLeaderboard";
import VipCtaBanner from "@/components/VipCtaBanner";
import { db } from "@/db";
import { vipSubscriptions } from "@/db/schema";
import { getSponsoredBrokerPool } from "@/data/brokers";
import { eq, and } from "drizzle-orm";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { optionalSession } from "@/lib/optionalSession";
import { type AccessTier } from "@/lib/vip";
import { maskLockedActiveSignal } from "@/lib/signalAccess";
import { getDictionary } from "@/lib/dictionary";
import { tr } from "@/lib/chrome";
import { trData } from "@/lib/localizeContent";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";
import { getSignalPeriods } from "@/lib/signalPeriods";
import { loadOptional } from "@/lib/dbOptional";
import { cachedSignalBoard, type SignalJson } from "@/lib/cachedReads";
import DataUnavailable from "@/components/DataUnavailable";

const sponsoredBrokers = getSponsoredBrokerPool("signals");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";
const OG_IMAGE = `${SITE_URL}/signals-preview.png`;
const TITLE = "Canlı İşlem Sinyalleri | FXPARTNER";
const DESCRIPTION =
  "Takip edilen MT5 hesabımızdan gerçek işlem sinyalleri — açık işlemler için giriş, kâr al ve zarar durdur seviyeleri, ayrıca her işlem kapandığında doğrulanmış kazanç/kayıp sonuçları.";

const faqs = [
  {
    q: "Bunlar gerçek işlemler mi?",
    a: "Evet. Her sinyal, FXPARTNER'ın kendi takip edilen MT5 hesabında açılan gerçek bir pozisyonu yansıtır — giriş, zarar durdur ve kâr al seviyeleri işlem açıldığı anda otomatik olarak kaydedilir ve sonradan asla değiştirilmez.",
  },
  {
    q: "Bu bir yatırım tavsiyesi mi?",
    a: "Hayır. Bu sinyaller yalnızca bilgilendirme amacıyla paylaşılmaktadır. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez — pozisyon büyüklüğünü ve zarar durdur seviyelerini her zaman tek bir sinyale değil, kendi risk toleransınıza göre belirleyin.",
  },
  {
    q: "Kapanan sinyallerin sonuçlarını nereden görebilirim?",
    a: "Bu sayfadaki her sinyal, işlem kapandığında doğrulanmış kazanç/kayıp sonucunu gösteren kapalı bölümüne taşınır — hiçbir sonuç sonradan kaldırılmaz veya seçilerek gizlenmez.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale);

  return {
    title: t["page.signals.title"],
    description: t["page.signals.description"],
    alternates: {
      canonical: localePath(locale, "/signals"),
      languages: Object.fromEntries(
        locales.map((l) => [hreflangCode[l], localePath(l, "/signals")])
      ),
    },
    openGraph: {
      url: `${SITE_URL}/signals`,
      type: "website",
      images: [{ url: OG_IMAGE, width: 1448, height: 1086 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE],
    },
  };
}

// Client-side polling (SignalsBoard) keeps the page fresh after load, but
// the initial server render still needs to be a live DB read every request
// rather than a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function SignalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  // One translated copy for both consumers: the visible list and the FAQPage
  // schema. A Ukrainian page advertising Turkish questions to a crawler is
  // the same bug as showing them to a reader.
  const localFaqs = trData(faqs);

  const session = await optionalSession();

  // The board is why this page exists, so an unreadable board is the one
  // thing here worth admitting to. Everything around it — the live market
  // grid, the VIP explanation, the FAQ, the disclaimer — is worth reading
  // on its own, and a reader who came for signals is better served by a
  // page that says "back in a minute" than by an error screen that says
  // nothing and offers nowhere to go.
  const [board, subscriptionRow] = await Promise.all([
    // 250 closed, not 30: the win rate and the P/L total on this page are
    // computed from that array, so the limit decides the published figure.
    // At 30 it showed 59% while the real rate over the whole history is
    // 63.4% — the limit was making the record look worse than it is. 250
    // sits comfortably above the 123 closed trades there are today.
    loadOptional(
      "signals: board",
      { active: [] as SignalJson[], closed: [] as SignalJson[] },
      () => cachedSignalBoard(250)
    ),
    // The subscription read is its own failure: losing it must not empty
    // the board, and losing the board must not silently downgrade a paying
    // member. Failing it closed costs a VIP reader the unmasked rows for a
    // few minutes; failing it open would hand them to everybody. Not
    // cached either — it is one member's answer, not everybody's.
    session?.user?.id
      ? db.query.vipSubscriptions
          .findFirst({
            where: and(
              eq(vipSubscriptions.userId, session.user.id),
              eq(vipSubscriptions.status, "active")
            ),
          })
          .catch((err) => {
            console.error("signals: subscription unavailable, masking as free —", err);
            return null;
          })
      : Promise.resolve(null),
  ]);

  const { data: signals, unavailable: signalsUnavailable } = board;
  const { active, closed } = signals;

  // Signed out -> null (everything masked, including the free FX signals —
  // that mask is the registration prompt). Signed in with no active
  // subscription -> "free", which unlocks the FX pairs.
  const viewerTier: AccessTier | null = session?.user?.id
    ? ((subscriptionRow?.tier as AccessTier | null) ?? "free")
    : null;

  // Real masking, not just a UI overlay — a locked signal's actual entry/
  // SL/TP/volume never leaves the server in the first place.
  const maskedActive = active.map((s) => maskLockedActiveSignal(s, viewerTier));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Canlı İşlem Sinyalleri", url: `${SITE_URL}/signals` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(localFaqs)) }}
      />
      <main className="flex-1 bg-ink text-text-on-ink">
        {/* Claim, then proof — the same order the homepage hero uses. The
            eyebrow and h1 used to sit under the artwork, inside the board. */}
        <div className="mx-auto max-w-4xl px-6 pt-14 text-center md:pt-20">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-signal">
            <span aria-hidden="true" className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" />
            {tr("Canlı Sinyaller")}
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            {tr("Gerçek Zamanlı İşlem Sinyalleri")}
          </h1>
        </div>

        {signalsUnavailable && (
          <div className="mx-auto max-w-3xl px-6 pt-6">
            <DataUnavailable what={tr("Sinyal panosu")} />
          </div>
        )}
        <SignalsBoard
          initialActive={maskedActive}
          initialClosed={closed}
          liveMarkets={<LiveMarketsGrid />}
          viewerTier={viewerTier}
          periods={getSignalPeriods()}
        />

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <VipCtaBanner variant="dark" />
          </div>
        </section>

        {/* XM own creative, on our own affiliate link. GOLD24-7 sits on this
            page specifically: the board above publishes GOLD24-7 signals, so
            the reader has just seen the instrument this banner is selling. */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <SponsoredLeaderboard
              brokerSlug="xm"
              image="/campaigns/xm-gold24-7-600x90.jpg"
              alt={tr("XM GOLD24-7 — altını hafta sonu dahil her gün işleme açın")}
            />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <RotatingBrokerAd brokers={sponsoredBrokers} />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <p className="text-center font-mono text-xs leading-relaxed text-text-on-ink-muted">
              {tr("Bunlar FXPARTNER'ın kendi takip edilen MT5 hesabında açılan gerçek işlemlerdir; yalnızca bilgilendirme amacıyla paylaşılmaktadır — yatırım tavsiyesi değildir. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez; pozisyon büyüklüğünü ve zarar durdur seviyelerini her zaman kendi risk toleransınıza göre belirleyin.")}
            </p>
          </div>
        </section>

        {/* The product shot, moved down from the top of the page.

            It used to sit between the h1 and the board — a full screen of
            artwork before the first real number, on the one page a reader
            opens in order to check the numbers. Down here it closes the
            page instead of delaying it.

            No `priority`: it is below the fold now, so preloading it would
            take bandwidth from whatever is actually painting first. The
            flag is the caller's call precisely because it depends on where
            the image lands — see the note in HeroProductShot. */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <HeroProductShot />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="text-center font-display text-2xl font-semibold text-text-on-ink">
              {tr("Sık Sorulan Sorular")}
            </h2>
            <div className="mt-6 divide-y divide-hairline border-t border-hairline">
              {localFaqs.map((faq) => (
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
      <Footer showSignalsPromo={false} />
    </>
  );
}
