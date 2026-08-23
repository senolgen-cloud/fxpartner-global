import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SignalsBoard from "@/components/SignalsBoard";
import LiveMarketsGrid from "@/components/LiveMarketsGrid";
import RotatingBrokerAd from "@/components/RotatingBrokerAd";
import VipCtaBanner from "@/components/VipCtaBanner";
import { db } from "@/db";
import { tradeSignals, vipSubscriptions } from "@/db/schema";
import { getSponsoredBrokerPool } from "@/data/brokers";
import { desc, eq, and } from "drizzle-orm";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { auth } from "@/auth";
import { type AccessTier } from "@/lib/vip";
import { maskLockedActiveSignal } from "@/lib/signalAccess";
import { getDictionary } from "@/lib/dictionary";
import { tr } from "@/lib/chrome";
import { trData } from "@/lib/localizeContent";
import { defaultLocale, hreflangCode, isLocale, type Locale, localePath, locales } from "@/lib/i18n";
import { setServerLocale } from "@/lib/serverLocale";

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

  const session = await auth();

  const [active, closed, subscriptionRow] = await Promise.all([
    db.query.tradeSignals.findMany({
      where: eq(tradeSignals.status, "active"),
      orderBy: desc(tradeSignals.createdAt),
      limit: 30,
    }),
    db.query.tradeSignals.findMany({
      where: eq(tradeSignals.status, "closed"),
      orderBy: desc(tradeSignals.closedAt),
      // 30 değil 250: sayfadaki kazanma oranı ve K/Z toplamı bu diziden
      // hesaplanıyor, yani limit doğrudan yayınlanan rakamı belirliyordu.
      // 30'da kalırken halka %59 gösteriyordu; tüm geçmiş üzerinden gerçek
      // oran %63,4. Kısacası limit, performansı olduğundan kötü gösteriyordu.
      // 250, mevcut 123 kapanmış işlemin rahatça üstünde ve satır sayısı
      // sayfayı zorlamıyor.
      limit: 250,
    }),
    session?.user?.id
      ? db.query.vipSubscriptions.findFirst({
          where: and(
            eq(vipSubscriptions.userId, session.user.id),
            eq(vipSubscriptions.status, "active")
          ),
        })
      : Promise.resolve(null),
  ]);

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
        <SignalsBoard
          initialActive={maskedActive}
          initialClosed={closed}
          liveMarkets={<LiveMarketsGrid />}
          viewerTier={viewerTier}
        />

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <VipCtaBanner variant="dark" />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <RotatingBrokerAd brokers={sponsoredBrokers} />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <p className="font-mono text-xs leading-relaxed text-text-on-ink-muted">
              {tr("Bunlar FXPARTNER'ın kendi takip edilen MT5 hesabında açılan gerçek işlemlerdir; yalnızca bilgilendirme amacıyla paylaşılmaktadır — yatırım tavsiyesi değildir. Geçmiş sonuçlar gelecekteki sonuçları garanti etmez; pozisyon büyüklüğünü ve zarar durdur seviyelerini her zaman kendi risk toleransınıza göre belirleyin.")}
            </p>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="font-display text-2xl font-semibold text-text-on-ink">
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
      <Footer />
    </>
  );
}
