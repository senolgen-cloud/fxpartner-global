"use client";

import { useActionState } from "react";
import { useTr } from "@/components/useTr";
import type { SimpleSignInState } from "@/app/[locale]/account/login/simple-actions";

const initial: SimpleSignInState = { ok: false };

/**
 * Email in, magic link out.
 *
 * The old registration form asked for full name, phone, email and broker
 * before it would send a link — four fields to receive an email. Everything
 * except the address can be filled in later from /account, and asking for a
 * phone number before someone has even seen the inside of the product is the
 * single most reliable way to lose them.
 *
 * `country` stays because it is one tap, it is the field the signals and
 * broker availability actually depend on, and it is optional.
 */
export default function EmailSignInForm({
  action,
  submitLabel,
  countries,
}: {
  action: (state: SimpleSignInState, formData: FormData) => Promise<SimpleSignInState>;
  submitLabel: string;
  countries?: { code: string; name: string }[];
}) {
  const tr = useTr();
  const [state, formAction, pending] = useActionState(action, initial);

  const field =
    "mt-2 w-full rounded-xl border border-hairline bg-ink px-4 py-3.5 text-[15px] text-text-on-ink outline-none transition-all placeholder:text-text-on-ink-muted/50 focus:border-signal focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--signal)_20%,transparent)]";
  const label = "font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted";

  if (state.ok) {
    return (
      <div className="mt-8 rounded-2xl border border-signal/40 bg-signal/5 p-6">
        <p className="font-display text-lg font-semibold text-text-on-ink">
          {tr("Bağlantı yolda.")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
          {tr("E-postanızı kontrol edin ve içindeki butona dokunun. Bağlantı 24 saat geçerli ve tek kullanımlık. Gelmediyse spam klasörüne bakın.")}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div>
        <label htmlFor="email" className={label}>
          {tr("E-posta")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="siz@ornek.com"
          className={field}
        />
      </div>

      {countries && (
        <div>
          <label htmlFor="country" className={label}>
            {tr("Ülke")}{" "}
            <span className="normal-case tracking-normal text-text-on-ink-muted/60">
              {tr("(isteğe bağlı)")}
            </span>
          </label>
          <select id="country" name="country" defaultValue="" className={field}>
            <option value="">{tr("Belirtmek istemiyorum")}</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-signal px-5 py-3.5 text-[15px] font-semibold text-on-signal shadow-[0_0_28px_-6px_var(--signal)] transition-colors hover:bg-signal-strong disabled:opacity-60"
      >
        {pending ? tr("Gönderiliyor…") : submitLabel}
      </button>

      <p className="text-xs leading-relaxed text-text-on-ink-muted">
        {tr("Şifre yok. Her girişte e-postanıza tek kullanımlık bir bağlantı gönderilir.")}
      </p>
    </form>
  );
}
