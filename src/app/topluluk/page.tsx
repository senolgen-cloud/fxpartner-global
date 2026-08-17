import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import SentimentPoll from "@/components/SentimentPoll";
import UpgradeGate from "@/components/UpgradeGate";
import { db } from "@/db";
import { comments as commentsTable, users as usersTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getBrokerBySlug } from "@/data/brokers";
import { flagEmoji } from "@/lib/country";
import { breadcrumbSchema } from "@/lib/schema";
import { getViewerAccess } from "@/lib/tierAccess";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fxpartner.global";

export const metadata: Metadata = {
  title: "Topluluk",
  description:
    "FXPARTNER'ın küresel yatırımcı topluluğu — gerçek broker yorumları, piyasa beklenti anketi ve resmi Telegram/X kanalları.",
  alternates: { canonical: "/topluluk" },
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const { signedIn } = await getViewerAccess();

  const recentComments = signedIn
    ? await db
        .select({
          id: commentsTable.id,
          body: commentsTable.body,
          rating: commentsTable.rating,
          brokerSlug: commentsTable.brokerSlug,
          createdAt: commentsTable.createdAt,
          userName: usersTable.name,
          userCountry: usersTable.country,
        })
        .from(commentsTable)
        .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
        .orderBy(desc(commentsTable.createdAt))
        .limit(20)
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Ana Sayfa", url: SITE_URL },
              { name: "Community", url: `${SITE_URL}/topluluk` },
            ])
          ),
        }}
      />
      <main lang="tr" className="flex-1 bg-ink text-text-on-ink">
        <section className="border-b border-hairline">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-hairline bg-ink-soft px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-signal">
              👥 Küresel Yatırımcı Topluluğu
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold md:text-5xl">
              Aktif Trader <span className="text-signal">Topluluğu &amp; Analizler</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-text-on-ink-muted">
              Gerçek broker değerlendirmelerini keşfedin, piyasa beklenti anketine katılın ve resmi
              sosyal kanallarımıza katılarak anlık bilgilere ulaşın.
            </p>
          </div>
        </section>

        {!signedIn && (
          <section className="mx-auto max-w-2xl px-6 py-16">
            <UpgradeGate
              eyebrow="Üyelere Özel"
              title="Topluluğu görmek için giriş yapın"
              description="Broker değerlendirmelerini, piyasa beklenti anketini ve topluluk kanallarımızı görmek için ücretsiz bir hesapla giriş yapmanız yeterli."
              signedIn={false}
            />
          </section>
        )}

        {signedIn && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                💬 Son Broker Değerlendirmeleri
              </h2>
              <div className="mt-6 space-y-4">
                {recentComments.length === 0 ? (
                  <p className="rounded-2xl border border-hairline bg-ink-soft p-6 text-sm text-text-on-ink-muted">
                    Henüz bir değerlendirme yok — ilk yorumu bırakan siz olun.
                  </p>
                ) : (
                  recentComments.map((c) => {
                    const broker = getBrokerBySlug(c.brokerSlug);
                    return (
                      <div key={c.id} className="rounded-2xl border border-hairline bg-ink-soft p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-text-on-ink">
                              {c.userName || "FXPARTNER kullanıcısı"}
                            </span>
                            {c.userCountry && <span aria-hidden="true">{flagEmoji(c.userCountry)}</span>}
                            {c.rating && (
                              <span className="font-mono text-xs text-gold">{c.rating}/5</span>
                            )}
                          </div>
                          {broker && (
                            <Link
                              href={`/brokers/${broker.slug}`}
                              className="notranslate shrink-0 rounded-full border border-hairline px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-text-on-ink-muted transition-colors hover:border-signal hover:text-signal"
                            >
                              {broker.name}
                            </Link>
                          )}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">{c.body}</p>
                        <p className="mt-3 font-mono text-[11px] text-text-on-ink-muted">
                          {c.createdAt.toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-hairline bg-ink-soft p-6">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                  📈 Piyasa Duygu Eğilimi (Sentiment)
                </h2>
                <p className="mt-2 text-xs text-text-on-ink-muted">
                  EUR/USD ve Altın için gerçek zamanlı topluluk beklenti oylaması.
                </p>
                <div className="mt-5">
                  <SentimentPoll />
                </div>
              </div>

              <div className="rounded-2xl border border-hairline bg-ink-soft p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                    📣
                  </span>
                  <div>
                    <h3 className="font-semibold text-text-on-ink">Resmi Telegram Kanalı</h3>
                    <p className="text-xs text-text-on-ink-muted">@fxpartnerglobal</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-text-on-ink-muted">
                  Anlık sinyal bildirimleri, kırılma uyarıları ve gün içi analizler için Telegram
                  kanalımıza katılın.
                </p>
                <a
                  href="https://t.me/fxpartnerglobal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-full bg-signal px-4 py-2.5 text-center text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
                >
                  Telegram&apos;a Katıl
                </a>
              </div>

              <div className="rounded-2xl border border-hairline bg-ink-soft p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-text-on-ink">
                    🤖
                  </span>
                  <div>
                    <h3 className="font-semibold text-text-on-ink">Sohbet Botu</h3>
                    <p className="text-xs text-text-on-ink-muted">@fxpartner_chat_bot</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-text-on-ink-muted">
                  Sinyalleri, broker karşılaştırmalarını ve aktif kampanyaları Telegram&apos;da
                  sohbet üzerinden anında sorup öğrenin.
                </p>
                <a
                  href="https://t.me/fxpartner_chat_bot?start=site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-full border border-hairline px-4 py-2.5 text-center text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
                >
                  Botu Başlat
                </a>
              </div>

              <div className="rounded-2xl border border-hairline bg-ink-soft p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-text-on-ink">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-text-on-ink">Resmi X (Twitter) Hesabı</h3>
                    <p className="text-xs text-text-on-ink-muted">@fxpartner_TR</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-text-on-ink-muted">
                  Piyasa haberleri, ekonomik veriler ve en güncel duyurular için X hesabımızı takip
                  edin.
                </p>
                <a
                  href="https://x.com/fxpartner_TR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-full border border-hairline px-4 py-2.5 text-center text-sm font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
                >
                  X&apos;te Takip Et
                </a>
              </div>
            </div>
          </div>
        </section>
        )}
      </main>
      <Footer />
    </>
  );
}
