"use client";
import { useTr } from "@/components/useTr";

import { useActionState } from "react";
import { submitCashbackLead, type CashbackLeadState } from "@/app/actions/cashbackLead";

const initialState: CashbackLeadState = { ok: false };

const fieldClass =
  "w-full rounded-xl border border-hairline bg-ink/60 px-4 py-3 text-sm text-text-on-ink placeholder:text-text-on-ink-muted outline-none transition-shadow focus:border-signal focus:shadow-[0_0_0_4px_rgba(47,111,240,0.18)]";

export default function HeroCashbackForm() {
  const tr = useTr();
  const [state, formAction, pending] = useActionState(submitCashbackLead, initialState);

  return (
    <div className="dashboard-glass relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-ink-soft to-ink p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.08)] md:p-8">
      {state.ok ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tick-up/15">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-tick-up"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="mt-4 font-poppins text-xl font-semibold text-text-on-ink">
            Listeye eklendiniz
          </h3>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-on-ink-muted">
            {tr("Kısa süre içinde sizinle iletişime geçerek bir broker seçmenize ve cashback takibinizi kurmanıza yardımcı olacağız.")}
          </p>
        </div>
      ) : (
        <>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gold">
            {tr("Cashback Programı")}
          </span>
          <h3 className="mt-2 font-poppins text-2xl font-bold leading-tight text-text-on-ink">
            {tr("Her işlemde nakit iade kazanın")}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
            {tr("Bilgilerinizi bırakın, broker hesabınızda cashback takibini sizin için kuralım — ek ücret yok, gizli şart yok.")}
          </p>

          <form action={formAction} className="mt-6 flex flex-col gap-3.5">
            <input name="fullName" placeholder="Ad Soyad" required className={fieldClass} />
            <input
              name="phone"
              type="tel"
              placeholder={tr("Telefon numarası")}
              required
              className={fieldClass}
            />
            <input
              name="email"
              type="email"
              placeholder="E-posta adresi"
              required
              className={fieldClass}
            />

            {state.error && <p className="text-sm text-alert">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="lift-on-hover mt-1 rounded-full bg-gradient-to-b from-signal to-signal-strong px-6 py-3 text-sm font-medium text-on-signal shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-shadow hover:shadow-lg hover:shadow-signal/30 disabled:opacity-60"
            >
              {pending ? "Gönderiliyor…" : "Cashback'imi Al"}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-text-on-ink-muted">
            {tr("Bu bilgileri yalnızca cashback'inizi kurmak ve onaylamak için kullanacağız — spam yok.")}
          </p>
        </>
      )}
    </div>
  );
}
