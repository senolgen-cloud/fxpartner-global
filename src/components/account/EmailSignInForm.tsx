"use client";

import { useActionState } from "react";
import { useTr } from "@/components/useTr";
import { useLocale } from "@/components/LocaleProvider";
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
 *
 * The styling follows the reference we were pointed at: generous rounded
 * fields, sentence-case labels sitting directly above them, one column, and a
 * pill for the primary action. Not its palette, though — that reference is a
 * white page, and this form sits between a dark header and a dark footer, so
 * a white panel would read as a page that failed to load rather than a soft
 * one. Soft here is the shape and the spacing, in the colours the site has.
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
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, initial);

  // py-4 and rounded-2xl rather than py-3.5 and rounded-xl: the difference is
  // small in the class name and most of the difference in how the form feels.
  const field =
    "w-full rounded-2xl border border-hairline-light bg-ink/70 px-5 py-4 text-[15px] text-text-on-ink outline-none transition-all placeholder:text-text-on-ink-muted/45 hover:border-text-on-ink-muted/35 focus:border-signal focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--signal)_16%,transparent)]";
  const label = "mb-2 block text-sm font-medium text-text-on-ink";

  if (state.ok) {
    return (
      <div className="mt-8 rounded-3xl border border-signal/35 bg-signal/[0.07] p-7">
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
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {/* Where the magic link should land. Read here rather than in the
          action: a server action runs as its own request and does not
          inherit the page's locale. */}
      <input type="hidden" name="locale" value={locale} />
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
            <span className="font-normal text-text-on-ink-muted/70">
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
        className="mt-1 w-full rounded-full bg-signal px-5 py-4 text-[15px] font-semibold text-on-signal shadow-[0_10px_30px_-10px_var(--signal)] transition-colors hover:bg-signal-strong disabled:cursor-not-allowed disabled:opacity-55"
      >
        {pending ? tr("Gönderiliyor…") : submitLabel}
      </button>

      <p className="text-center text-xs leading-relaxed text-text-on-ink-muted">
        {tr("Şifre yok. Her girişte e-postanıza tek kullanımlık bir bağlantı gönderilir.")}
      </p>
    </form>
  );
}
