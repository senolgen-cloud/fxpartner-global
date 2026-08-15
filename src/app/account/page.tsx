import Footer from "@/components/Footer";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import {
  complaints as complaintsTable,
  cashbackAccounts,
  cashbackRecords,
  type ComplaintStatus,
  type CashbackAccountStatus,
} from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { createVipInviteLink } from "@/lib/telegram";
import VipInviteClientTrigger from "@/components/VipInviteClientTrigger";
import CashbackLinkForm from "@/components/CashbackLinkForm";
import { updateCountry } from "./profile-actions";
import { COUNTRIES } from "@/lib/country";
import { brokers } from "@/data/brokers";

const brokerNames = Object.fromEntries(brokers.map((b) => [b.slug, b.name]));

const CASHBACK_STATUS_LABEL: Record<CashbackAccountStatus, string> = {
  pending: "Doğrulama Bekliyor",
  verified: "Doğrulandı",
  rejected: "Uygun Değil",
};

const CASHBACK_STATUS_CLASS: Record<CashbackAccountStatus, string> = {
  pending: "text-gold",
  verified: "text-emerald-600",
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
  resolved: "text-emerald-600",
  closed: "text-text-muted",
};

export default async function AccountPage() {
  const session = await auth();
  const user = session!.user!;

  const myComplaints = await db
    .select()
    .from(complaintsTable)
    .where(eq(complaintsTable.userId, user.id!))
    .orderBy(desc(complaintsTable.createdAt));

  const myCashbackAccounts = await db
    .select()
    .from(cashbackAccounts)
    .where(eq(cashbackAccounts.userId, user.id!))
    .orderBy(desc(cashbackAccounts.createdAt));

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

  async function generateVipLink() {
    "use server";
    const s = await auth();
    if (!s?.user) throw new Error("Not signed in");
    const link = await createVipInviteLink(s.user.name || s.user.email || "member");
    return link;
  }

  return (
    <>
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Hesap
              </span>
              <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">
                {user.name || user.email}
              </h1>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full border border-hairline-light px-4 py-2 text-sm text-text-dark transition-colors hover:border-text-dark"
              >
                Çıkış yap
              </button>
            </form>
          </div>

          <section className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-text-dark">
              Profil
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              İsteğe bağlı — aracı kurum incelemelerindeki yorumlarınızın
              yanında gösterilir.
            </p>
            <form action={updateCountry} className="mt-4 flex flex-wrap items-center gap-3">
              <select
                name="country"
                defaultValue={user.country ?? ""}
                className="rounded-xl border border-hairline-light bg-paper-high px-3 py-2 text-sm text-text-dark outline-none focus:border-signal"
              >
                <option value="">Ülke belirtilmedi</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-full border border-hairline-light px-4 py-2 text-sm text-text-dark transition-colors hover:border-text-dark"
              >
                Kaydet
              </button>
            </form>
          </section>

          <section className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-text-dark">
              FXPARTNER VIP Telegram Grubu
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Kayıtlı bir üye olarak VIP Telegram grubuna erişiminiz var.
              Aşağıdaki bağlantı tek kullanımlıktır ve 24 saat içinde
              geçerliliğini yitirir.
            </p>
            <VipInviteClientTrigger action={generateVipLink} />
          </section>

          <section className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-text-dark">
              Forex Cashback
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Kazanç iadesini takip etmeye başlamak için katılımcı bir aracı
              kurumla bir işlem hesabı bağlayın. Tutarlar partner panelimizden
              manuel olarak kaydedilir, otomatik hesaplanmaz.
            </p>
            <div className="mt-4">
              <CashbackLinkForm brokerNames={brokerNames} />
            </div>

            {myCashbackAccounts.length > 0 && (
              <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
                {myCashbackAccounts.map((acc) => {
                  const records = myCashbackRecords.filter((r) => r.accountId === acc.id);
                  return (
                    <div key={acc.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-text-dark">
                            {brokerNames[acc.brokerSlug] || acc.brokerSlug}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-text-muted">
                            Hesap {acc.accountNumber}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs uppercase tracking-[0.1em] ${CASHBACK_STATUS_CLASS[acc.status]}`}
                        >
                          {CASHBACK_STATUS_LABEL[acc.status]}
                        </span>
                      </div>
                      {records.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {records.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between text-xs text-text-muted"
                            >
                              <span>{r.period}{r.note ? ` · ${r.note}` : ""}</span>
                              <span className="tabular-stat font-mono font-medium text-text-dark">
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
            <h2 className="font-display text-xl font-semibold text-text-dark">
              Şikayetleriniz
            </h2>
            {myComplaints.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">
                Henüz bir şikayet göndermediniz. Bir brokerla ilgili sorun mu yaşıyorsunuz?{" "}
                <a href="/complaint" className="text-signal hover:text-signal-strong">
                  Şikayet gönderin
                </a>
                .
              </p>
            ) : (
              <div className="mt-4 divide-y divide-hairline-light border-t border-hairline-light">
                {myComplaints.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-text-dark">{c.brokerName}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(c.createdAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`font-mono text-xs uppercase tracking-[0.1em] ${STATUS_CLASS[c.status]}`}>
                      {STATUS_LABEL[c.status]}
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
