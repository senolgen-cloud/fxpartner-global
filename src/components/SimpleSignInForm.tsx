"use client";

import { useActionState } from "react";
import { submitLogin, type SimpleSignInState } from "@/app/[locale]/account/login/simple-actions";

const initialState: SimpleSignInState = { ok: false };

export default function SimpleSignInForm() {
  const [state, formAction, pending] = useActionState(submitLogin, initialState);

  const fieldClass =
    "mt-2 w-full rounded-xl border border-text-on-ink-muted/25 bg-ink px-4 py-3 text-sm text-text-on-ink outline-none transition-colors placeholder:text-text-on-ink-muted/50 focus:border-signal focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--signal)_25%,transparent)]";
  const labelClass = "font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted";

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      <div>
        <label className={labelClass}>E-posta</label>
        <input
          name="email"
          type="email"
          required
          placeholder="siz@ornek.com"
          className={fieldClass}
        />
      </div>

      {state.error && <p className="text-sm text-alert">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-signal px-5 py-3 text-sm font-semibold text-ink shadow-[0_0_24px_-4px_var(--signal)] transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
      </button>
    </form>
  );
}
