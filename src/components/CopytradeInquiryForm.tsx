"use client";
import { useTr } from "@/components/useTr";

import { useActionState } from "react";
import { submitCopytradeInquiry, type CopytradeInquiryFormState } from "@/app/[locale]/copytrade/actions";

const initialState: CopytradeInquiryFormState = { ok: false };

export default function CopytradeInquiryForm() {
  const tr = useTr();
  const [state, formAction, pending] = useActionState(submitCopytradeInquiry, initialState);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-hairline-light bg-paper p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-text-dark">{tr("Talebiniz alındı")}</h2>
        <p className="mt-3 text-text-muted">
          {tr("Ekibimiz kısa süre içinde e-posta ile dönüş yaparak Copier EA kurulumunu ve mevcut kısıtlamaları/riskleri sizinle birlikte gözden geçirecek.")}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          Ad Soyad
        </label>
        <input
          name="fullName"
          required
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            {tr("E-posta")}
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            Telefon
          </label>
          <input
            name="phone"
            type="tel"
            required
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            {tr("Ülke")}
          </label>
          <input
            name="country"
            required
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
            Broker / Platform
          </label>
          <input
            name="platform"
            required
            placeholder={tr("Örn. XM, MT5")}
            className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
          />
        </div>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          {tr("Eklemek istediğiniz bir şey var mı? (opsiyonel)")}
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder={tr("Sorularınız veya risk toleransınız hakkında bilgi")}
          className="mt-2 w-full rounded-xl border border-hairline-light bg-paper px-4 py-3 text-sm text-text-dark outline-none focus:border-signal"
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
        <input type="checkbox" required className="mt-0.5" />
        {tr("Bunun bir kâr garantisi olmadığını, kendi hesabımın kontrolünün her zaman bende kaldığını ve kaybedebileceğim sermayeyle işlem yapacağımı anlıyorum.")}
      </label>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-signal px-6 py-3 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Kurulum İçin Talep Gönder"}
      </button>
    </form>
  );
}
