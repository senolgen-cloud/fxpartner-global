import { tr, trLocale } from "@/lib/chrome";
import Link from "@/components/LocaleLink";
import Footer from "@/components/Footer";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import {
  complaints as complaintsTable,
  cashbackAccounts,
  cashbackRecords,
  vipSubscriptions,
  tradeSignals,
  type ComplaintStatus,
  type CashbackAccountStatus,
  type VipSubscriptionStatus,
} from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { createVipInviteLink } from "@/lib/telegram";
import VipInviteClientTrigger from "@/components/VipInviteClientTrigger";
import CashbackLinkForm from "@/components/CashbackLinkForm";
import { updateProfile } from "./profile-actions";
import ProfileCard from "@/components/account/ProfileCard";
import { getCountries } from "@/lib/country";
import { brokers } from "@/data/brokers";
import { type PackageTier } from "@/lib/vip";
import { PACKAGE_TIER_INFO, PACKAGE_TIER_ORDER } from "@/data/packageTiers";
import { createNowPaymentsCheckout } from "@/app/[locale]/paketler/checkout-actions";
import { setServerLocale } from "@/lib/serverLocale";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { trData } from "@/lib/localizeContent";
import MemberStatement from "@/components/account/MemberStatement";
import { getRecentSignalStats } from "@/lib/signalStats";
import { users } from "@/db/schema";

const brokerNames = Object.fromEntries(brokers.map((b) => [b.slug, b.name]));

const CASHBACK_STATUS_LABEL: Record<CashbackAccountStatus, string> = {
  pending: "Doğrulama Bekliyor",
  verified: "Doğrulandı",
  rejected: "Uygun Değil",
};

const CASHBACK_STATUS_CLASS: Record<CashbackAccountStatus, string> = {
  pending: "text-gold",
  verified: "text-tick-up",
  rejected: "text-alert",
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  new: "Alındı",
  in_progress: "İşleniyor",
  resolved: "Çözüldü",
  closed: "Kapatıldı",
};

const STATUS_CLASS: Record<ComplaintStatus, string> = {
  new: "text-signal",
  in_progress: "text-gold",
  resolved: "text-tick-up",
  closed: "text-text-on-ink-muted",
};

const VIP_STATUS_LABEL: Record<VipSubscriptionStatus, string> = {
  active: "Aktif",
  past_due: "Ödeme Gecikti",
  canceled: "İptal Edildi",
  incomplete: "Tamamlanmadı",
};

const VIP_STATUS_CLASS: Record<VipSubscriptionStatus, string> = {
  active: "text-tick-up",
  past_due: "text-gold",
  canceled: "text-alert",
  incomplete: "text-text-on-ink-muted",
};

const TIER_LABEL: Record<PackageTier, string> = {
  pro: "Pro",
  vip: "VIP",
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: pageLocale } = await params;
  setServerLocale(isLocale(pageLocale) ? pageLocale : defaultLocale);

  const session = await auth();
  const user = session!.user!;

  const [myComplaints, myCashbackAccounts, subscription, latestSignal] = await Promise.all([
    db
      .select()
      .from(complaintsTable)
      .where(eq(complaintsTable.userId, user.id!))
      .orderBy(desc(complaintsTable.createdAt)),
    db
      .select()
      .from(cashbackAccounts)
      .where(eq(cashbackAccounts.userId, user.id!))
      .orderBy(desc(cashbackAccounts.createdAt)),
    db.query.vipSubscriptions.findFirst({
      where: eq(vipSubscriptions.userId, user.id!),
    }),
    db.query.tradeSignals.findFirst({
      where: eq(tradeSignals.status, "active"),
      orderBy: desc(tradeSignals.createdAt),
    }),
  ]);

  const myCashbackRecords = myCashbackAccounts.length
    ? await db
        .select()
        .from(cashbackRecords)
        .where(
          inArray(
            cashbackRecords.accountId,
            myCashbackAccounts.map((a) => a.id)
          )
        )
        .orderBy(desc(cashbackRecords.createdAt))
    : [];

  const activeSignalsCount = await db
    .select({ id: tradeSignals.id })
    .from(tradeSignals)
    .where(eq(tradeSignals.status, "active"));

  const subscriptionTier: PackageTier | null = (subscription?.tier as PackageTier | null) ?? null;
  const isActiveVip = subscription?.status === "active";

  const [signalStats, userRow] = await Promise.all([
    getRecentSignalStats("all", 30),
    db.query.users.findFirst({ where: eq(users.id, user.id!) }),
  ]);

  // Cashback is stored as text to keep the decimal exact on the way in, so it
  // is summed as a number only here, at the point of display.
  const cashbackTotal = myCashbackRecords.reduce((sum, r) => {
    const n = Number(r.amountUsd);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  async function generateVipLink() {
    "use server";
    const s = await auth();
    if (!s?.user) throw new Error("Not signed in");
    const link = await createVipInviteLink(s.user.name || s.user.email || "member");
    return link;
  }

  return (
    <>
      <main className="flex-1 bg-ink text-text-on-ink">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <MemberStatement
            name={user.name ?? null}
            email={user.email ?? null}
            memberSince={userRow?.createdAt ?? new Date()}
            tier={isActiveVip && subscriptionTier ? subscriptionTier : "free"}
            openPositions={activeSignalsCount.length}
            hitRate={signalStats?.winRate ?? null}
            hitRateTrades={signalStats?.trades ?? 0}
            cashbackUsd={cashbackTotal}
            accent={userRow?.accentColor ?? null}
            action={
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-hairline px-4 py-2 text-sm text-text-on-ink-muted transition-colors hover:border-text-on-ink hover:text-text-on-ink"
                >
                  {tr("Çıkış yap")}
                </button>
              </form>
            }
          />

          {/* VIP membership status */}
          <section className="mt-8 rounded-2xl border border-hairline bg-ink-soft p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-text-on-ink">
                  {tr("Üyelik Durumu")}
                </h2>
                {subscription ? (
                  <p className="mt-1 text-sm text-text-on-ink-muted">
                    {subscriptionTier ? TIER_LABEL[subscriptionTier] : "Paket"} paketi ·{" "}
                    <span className={VIP_STATUS_CLASS[subscription.status]}>
                      {trData(VIP_STATUS_LABEL)[subscription.status]}
                    </span>
                    {subscription.currentPeriodEnd &&
                      ` · ${subscription.currentPeriodEnd.toLocaleDateString(trLocale(), {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })} tarihine kadar`}
                  </p>
                ) : (
                  // Not "you have nothing" — a signed-in account IS the free
                  // tier, and saying so is what makes the upgrade an upgrade
                  // rather than a first purchase.
                  <p className="mt-1 text-sm text-text-on-ink-muted">
                    <span className="text-tick-up">Ücretsiz üyelik</span> · Anlık
                    push bildirimleri ve cashback açık.
                  </p>
                )}
              </div>
              {!isActiveVip && (
                <Link
                  href="/paketler"
                  className="shrink-0 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
                >
                  {tr("Paketleri İncele →")}
                </Link>
              )}
            </div>

            {/* What the current package includes, plus a renew/upgrade
                path — a subscriber shouldn't have to go re-read /paketler
                to know what they're actually paying for. */}
            {isActiveVip && subscriptionTier && (
              <div className="mt-6 border-t border-hairline pt-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  {trData(PACKAGE_TIER_INFO)[subscriptionTier].name} Paketinize Dahil
                </h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {trData(PACKAGE_TIER_INFO)[subscriptionTier].features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text-on-ink-muted">
                      <span className="mt-0.5 text-tick-up">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={createNowPaymentsCheckout.bind(null, subscriptionTier)}>
                    <button
                      type="submit"
                      className="rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
                    >
                      ₿ Paketi Yenile
                    </button>
                  </form>
                  {subscriptionTier !== "vip" && (
                    <Link
                      href="/paketler"
                      className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
                    >
                      {trData(PACKAGE_TIER_INFO)[PACKAGE_TIER_ORDER[PACKAGE_TIER_ORDER.indexOf(subscriptionTier) + 1]].name}
                      {tr("'e Yükselt →")}
                    </Link>
                  )}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-text-on-ink-muted">
                  {tr("Kripto ödemede otomatik yenileme yoktur — süreniz dolmadan önce \"Paketi Yenile\"ye tıklayarak erişiminizi kesintisiz sürdürebilirsiniz.")}
                </p>
              </div>
            )}
          </section>

          {/* Quick access: Signals + AI Assistant */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/signals"
              className="group rounded-2xl border border-hairline bg-ink-soft p-6 transition-colors hover:border-signal"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-signal">
                  <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
                  {tr("Canlı")}
                </span>
                <span className="font-mono text-xs text-text-on-ink-muted">
                  {activeSignalsCount.length} aktif
                </span>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-text-on-ink">
                Sinyaller
              </h3>
              {latestSignal ? (
                <p className="mt-1 text-sm text-text-on-ink-muted">
                  Son sinyal:{" "}
                  <span className="notranslate text-text-on-ink">{latestSignal.pair}</span>{" "}
                  {latestSignal.direction}
                </p>
              ) : (
                <p className="mt-1 text-sm text-text-on-ink-muted">{tr("Gerçek MT5 hesabından anlık sinyaller.")}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-signal transition-colors group-hover:text-signal-strong">
                {tr("Sinyalleri Gör →")}
              </span>
            </Link>

            <Link
              href="/ai-asistan"
              className="group rounded-2xl border border-hairline bg-ink-soft p-6 transition-colors hover:border-signal"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-signal">
                  🤖 Yapay Zeka
                </span>
                {!(subscriptionTier === "pro" || subscriptionTier === "vip") && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    🔒 Pro+
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-text-on-ink">
                AI Asistan
              </h3>
              <p className="mt-1 text-sm text-text-on-ink-muted">
                {tr("Piyasalar, CPI, brokerlar ve stratejiler hakkında anında yanıt alın.")}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-signal transition-colors group-hover:text-signal-strong">
                {subscriptionTier === "pro" || subscriptionTier === "vip" ? "Soru Sor →" : "Yükselt →"}
              </span>
            </Link>
          </div>

          <div className="mt-10">
            <ProfileCard
              action={updateProfile}
              initialName={user.name ?? ""}
              initialAccent={userRow?.accentColor ?? "signal"}
              initialCountry={user.country ?? ""}
              initialBroker={userRow?.preferredBroker ?? ""}
              email={user.email ?? ""}
              countries={getCountries(isLocale(pageLocale) ? pageLocale : defaultLocale)}
              brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))}
            />
          </div>

          <section className="mt-10 rounded-2xl border border-hairline bg-ink-soft p-6">
            <h2 className="font-display text-xl font-semibold text-text-on-ink">
              FXPARTNER VIP Telegram Grubu
            </h2>
            <p className="mt-2 text-sm text-text-on-ink-muted">
              {tr("Kayıtlı bir üye olarak VIP Telegram grubuna erişiminiz var. Aşağıdaki bağlantı tek kullanımlıktır ve 24 saat içinde geçerliliğini yitirir.")}
            </p>
            <VipInviteClientTrigger action={generateVipLink} />
          </section>

          <section className="mt-10 rounded-2xl border border-hairline bg-ink-soft p-6">
            <h2 className="font-display text-xl font-semibold text-text-on-ink">
              Forex Cashback
            </h2>
            <p className="mt-2 text-sm text-text-on-ink-muted">
              {tr("Kazanç iadesini takip etmeye başlamak için katılımcı bir aracı kurumla bir işlem hesabı bağlayın. Tutarlar partner panelimizden manuel olarak kaydedilir, otomatik hesaplanmaz.")}
            </p>
            <div className="mt-4">
              <CashbackLinkForm brokerNames={brokerNames} />
            </div>

            {myCashbackAccounts.length > 0 && (
              <div className="mt-6 divide-y divide-hairline border-t border-hairline">
                {myCashbackAccounts.map((acc) => {
                  const records = myCashbackRecords.filter((r) => r.accountId === acc.id);
                  return (
                    <div key={acc.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-text-on-ink">
                            {brokerNames[acc.brokerSlug] || acc.brokerSlug}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-text-on-ink-muted">
                            Hesap {acc.accountNumber}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs uppercase tracking-[0.1em] ${CASHBACK_STATUS_CLASS[acc.status]}`}
                        >
                          {trData(CASHBACK_STATUS_LABEL)[acc.status]}
                        </span>
                      </div>
                      {records.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {records.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between text-xs text-text-on-ink-muted"
                            >
                              <span>{r.period}{r.note ? ` · ${r.note}` : ""}</span>
                              <span className="tabular-stat font-mono font-medium text-text-on-ink">
                                ${r.amountUsd}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-text-on-ink">
              {tr("Şikayetleriniz")}
            </h2>
            {myComplaints.length === 0 ? (
              <p className="mt-4 text-sm text-text-on-ink-muted">
                {tr("Henüz bir şikayet göndermediniz. Bir brokerla ilgili sorun mu yaşıyorsunuz?")}{" "}
                <Link href="/complaint" className="text-signal hover:text-signal-strong">
                  {tr("Şikayet gönderin")}
                </Link>
                .
              </p>
            ) : (
              <div className="mt-4 divide-y divide-hairline border-t border-hairline">
                {myComplaints.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-text-on-ink">{c.brokerName}</p>
                      <p className="mt-1 text-xs text-text-on-ink-muted">
                        {new Date(c.createdAt).toLocaleDateString(trLocale(), {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`font-mono text-xs uppercase tracking-[0.1em] ${STATUS_CLASS[c.status]}`}>
                      {trData(STATUS_LABEL)[c.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
