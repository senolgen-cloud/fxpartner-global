import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { cashbackAccounts, cashbackRecords, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { brokers } from "@/data/brokers";
import { setAccountStatus, addCashbackRecord } from "./actions";

const brokerNames = Object.fromEntries(brokers.map((b) => [b.slug, b.name]));

export default async function AdminCashbackPage() {
  const accounts = await db
    .select({
      id: cashbackAccounts.id,
      brokerSlug: cashbackAccounts.brokerSlug,
      accountNumber: cashbackAccounts.accountNumber,
      fullName: cashbackAccounts.fullName,
      email: cashbackAccounts.email,
      marketingOptIn: cashbackAccounts.marketingOptIn,
      status: cashbackAccounts.status,
      createdAt: cashbackAccounts.createdAt,
      linkedUserEmail: users.email,
    })
    .from(cashbackAccounts)
    .leftJoin(users, eq(cashbackAccounts.userId, users.id))
    .orderBy(desc(cashbackAccounts.createdAt));

  const allRecords = await db
    .select()
    .from(cashbackRecords)
    .orderBy(desc(cashbackRecords.createdAt));

  return (
    <>
      <Header />
      <main className="flex-1 bg-paper-high">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            Admin
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-dark">
            Cashback Accounts
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Verify accounts against your IB/partner dashboard, then add a
            record per period. Nothing here is calculated automatically.
          </p>

          <div className="mt-8 divide-y divide-hairline-light border-t border-hairline-light">
            {accounts.length === 0 && (
              <p className="py-8 text-sm text-text-muted">No accounts linked yet.</p>
            )}
            {accounts.map((acc) => {
              const records = allRecords.filter((r) => r.accountId === acc.id);
              return (
                <div key={acc.id} className="py-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-text-dark">
                        {brokerNames[acc.brokerSlug] || acc.brokerSlug} · {acc.accountNumber}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {acc.fullName} · {acc.email}
                        {acc.linkedUserEmail ? " · has FXPARTNER account" : " · no account (lead)"}
                        {acc.marketingOptIn ? " · opted in to marketing" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(["pending", "verified", "rejected"] as const).map((s) => (
                        <form key={s} action={setAccountStatus.bind(null, acc.id, s)}>
                          <button
                            type="submit"
                            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                              acc.status === s
                                ? "border-text-dark bg-text-dark text-paper-high"
                                : "border-hairline-light text-text-muted hover:border-text-dark"
                            }`}
                          >
                            {s}
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>

                  {records.length > 0 && (
                    <div className="mt-3 space-y-1 rounded-lg bg-paper p-3">
                      {records.map((r) => (
                        <div key={r.id} className="flex justify-between text-xs text-text-muted">
                          <span>{r.period}{r.note ? ` · ${r.note}` : ""}</span>
                          <span className="font-mono text-text-dark">${r.amountUsd}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <form action={addCashbackRecord} className="mt-3 flex flex-wrap gap-2">
                    <input type="hidden" name="accountId" value={acc.id} />
                    <input
                      name="period"
                      placeholder="2026-07"
                      required
                      className="w-28 rounded-lg border border-hairline-light bg-paper-high px-2.5 py-1.5 text-xs outline-none focus:border-signal"
                    />
                    <input
                      name="amountUsd"
                      placeholder="Amount USD"
                      required
                      className="w-28 rounded-lg border border-hairline-light bg-paper-high px-2.5 py-1.5 text-xs outline-none focus:border-signal"
                    />
                    <input
                      name="note"
                      placeholder="Note (optional)"
                      className="flex-1 rounded-lg border border-hairline-light bg-paper-high px-2.5 py-1.5 text-xs outline-none focus:border-signal"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
                    >
                      Add Record
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
