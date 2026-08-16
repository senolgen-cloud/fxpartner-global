import type { Metadata } from "next";
import Footer from "@/components/Footer";
import SignalsBoard from "@/components/SignalsBoard";
import LiveMarketsGrid from "@/components/LiveMarketsGrid";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import VipCtaBanner from "@/components/VipCtaBanner";
import { db } from "@/db";
import { tradeSignals, vipSubscriptions } from "@/db/schema";
import { getSponsoredBroker } from "@/data/brokers";
import { desc, eq, and } from "drizzle-orm";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { auth } from "@/auth";
import { tierFromPriceId, type PackageTier } from "@/lib/vip";

const featuredBroker = getSponsoredBroker("signals");

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

export const metadata: Metadata = {
  title: "Canlı İşlem Sinyalleri",
  description: DESCRIPTION,
  alternates: { canonical: "/signals" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/signals`,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1448, height: 1086 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// Client-side polling (SignalsBoard) keeps the page fresh after load, but
// the initial server render still needs to be a live DB read every request
// rather than a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function SignalsPage() {
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
      limit: 30,
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

  const viewerTier = subscriptionRow
    ? ((subscriptionRow.tier as PackageTier | null) ??
      (subscriptionRow.stripePriceId ? tierFromPriceId(subscriptionRow.stripePriceId) : null))
    : null;

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <main className="flex-1 bg-ink text-text-on-ink">
        <SignalsBoard
          initialActive={active}
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
            <BrokerAdBanner broker={featuredBroker} />
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <p className="font-mono text-xs leading-relaxed text-text-on-ink-muted">
              Bunlar FXPARTNER&apos;ın kendi takip edilen MT5 hesabında açılan gerçek işlemlerdir; yalnızca
              bilgilendirme amacıyla paylaşılmaktadır — yatırım tavsiyesi değildir. Geçmiş sonuçlar gelecekteki
              sonuçları garanti etmez; pozisyon büyüklüğünü ve zarar durdur seviyelerini her zaman kendi risk
              toleransınıza göre belirleyin.
            </p>
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="font-display text-2xl font-semibold text-text-on-ink">
              Sık Sorulan Sorular
            </h2>
            <div className="mt-6 divide-y divide-hairline border-t border-hairline">
              {faqs.map((faq) => (
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
