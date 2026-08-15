"use client";

import { useActionState } from "react";
import { linkCashbackAccount, type LinkAccountState } from "@/app/account/cashback-actions";
import { cashbackPrograms } from "@/data/cashback";

const initialState: LinkAccountState = { ok: false };

export default function CashbackLinkForm({
  brokerNames,
}: {
  brokerNames: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(linkCashbackAccount, initialState);

  if (state.ok) {
    return (
      <p className="rounded-xl border border-hairline-light bg-paper p-4 text-sm text-text-muted">
        Hesap gönderildi. Partner panelimizle doğrulayıp aktif olduğunda
        burada onaylayacağız.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Aracı Kurum
        </label>
        <select
          name="brokerSlug"
          required
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-3 py-2.5 text-sm text-text-dark outline-none focus:border-signal"
        >
          <option value="" disabled>
            Bir aracı kurum seçin
          </option>
          {cashbackPrograms.map((p) => (
            <option key={p.brokerSlug} value={p.brokerSlug}>
              {brokerNames[p.brokerSlug] || p.brokerSlug}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          İşlem Hesap Numarası
        </label>
        <input
          name="accountNumber"
          required
          placeholder="örn. 12345678"
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-3 py-2.5 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Bağlanıyor…" : "Hesabı Bağla"}
      </button>
      {state.error && <p className="text-xs text-alert sm:basis-full">{state.error}</p>}
    </form>
  );
}
