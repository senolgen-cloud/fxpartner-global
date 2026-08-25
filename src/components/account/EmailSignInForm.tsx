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
    "w-full rounded-2xl border border-hairline-light bg-ink-soft px-5 py-[1.15rem] text-[16px] text-text-on-ink outline-none transition-all placeholder:text-text-on-ink-muted/40 hover:border-text-on-ink-muted/35 focus:border-signal focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--signal)_16%,transparent)]";
  const label = "mb-2 block text-center text-sm font-medium text-text-on-ink";

  if (state.ok) {
    return (
      <div className="mt-8 rounded-3xl border border-signal/35 bg-signal/[0.07] p-7 text-center">
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
    <form action={formAction} className="mt-7 flex flex-col gap-4">
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
        <p role="alert" className="text-center text-sm text-alert">
          {state.error}
        </p>
      )}

      <div className="mt-1 flex flex-col items-center gap-4">
        <p className="text-center text-[13px] leading-relaxed text-text-on-ink-muted">
          {tr("Şifre yok. Her girişte e-postanıza tek kullanımlık bir bağlantı gönderilir.")}
        </p>
        {/* aria-label carries the real instruction; the arrow is decoration.
            56px so it clears the 44px touch target with room to spare. */}
        <button
          type="submit"
          disabled={pending}
          aria-label={pending ? tr("Gönderiliyor…") : submitLabel}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-signal text-on-signal shadow-[0_12px_34px_-12px_var(--signal)] transition-colors hover:bg-signal-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? (
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full border-2 border-on-signal/30 border-t-on-signal motion-safe:animate-spin"
            />
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
              <path
                d="M5 12h13M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
