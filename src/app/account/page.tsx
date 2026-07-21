import Header from "@/components/Header";
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
  pending: "Pending Verification",
  verified: "Verified",
  rejected: "Not Eligible",
};

const CASHBACK_STATUS_CLASS: Record<CashbackAccountStatus, string> = {
  pending: "text-gold",
  verified: "text-emerald-600",
  rejected: "text-alert",
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  new: "Received",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
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
      <Header />
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
                Account
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
                Sign out
              </button>
            </form>
          </div>

          <section className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-text-dark">
              Profile
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Optional — shown next to your comments on broker reviews.
            </p>
            <form action={updateCountry} className="mt-4 flex flex-wrap items-center gap-3">
              <select
                name="country"
                defaultValue={user.country ?? ""}
                className="rounded-xl border border-hairline-light bg-paper-high px-3 py-2 text-sm text-text-dark outline-none focus:border-signal"
              >
                <option value="">No country set</option>
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
                Save
              </button>
            </form>
          </section>

          <section className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-text-dark">
              FXPARTNER VIP Telegram Group
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              As a registered member, you get access to the VIP Telegram
              group. The link below is single-use and expires in 24 hours.
            </p>
            <VipInviteClientTrigger action={generateVipLink} />
          </section>

          <section className="mt-10 rounded-2xl border border-hairline-light bg-paper p-6">
            <h2 className="font-display text-xl font-semibold text-text-dark">
              Forex Cashback
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Link a trading account with a participating broker to start
              tracking cashback. Amounts are recorded manually from our
              partner dashboard, not calculated automatically.
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
                            Account {acc.accountNumber}
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
              Your Complaints
            </h2>
            {myComplaints.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">
                You haven&apos;t filed a complaint yet. Have an issue with a
                broker?{" "}
                <a href="/complaint" className="text-signal hover:text-signal-strong">
                  Submit a complaint
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
                        {new Date(c.createdAt).toLocaleDateString("en-US", {
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
