"use client";
import { useTr } from "@/components/useTr";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterFormState } from "@/lib/newsletter-actions";

// Sitewide, once-per-visitor. Deliberately a long delay (unlike
// BonusPopup's 1.5s) so it never stacks with the broker-specific bonus
// popup or the Telegram prompt — by 45s those have already been seen and
// dismissed or acted on. Dismissing hides it for 30 days; subscribing
// hides it forever (both stored client-side, no server round-trip needed
// just to remember that).
const DISMISS_KEY = "fxpartner-newsletter-popup-dismissed-until";
const SUBSCRIBED_KEY = "fxpartner-newsletter-popup-subscribed";
const SHOW_DELAY_MS = 45000;
const DISMISS_DAYS = 30;

const initialState: NewsletterFormState = { ok: false };

export default function NewsletterPopup() {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() < dismissedUntil) return;

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.ok) {
      localStorage.setItem(SUBSCRIBED_KEY, "1");
    }
  }, [state.ok]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 motion-safe:animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Kapat"
          className="absolute right-4 top-4 font-mono text-lg text-text-on-ink-muted transition-colors hover:text-text-on-ink"
        >
          ×
        </button>

        <div className="p-7">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            {tr("FXPARTNER Kurucusundan Bir Not")}
          </span>

          {state.ok ? (
            <>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-text-on-ink">
                {tr("Teşekkürler, aramıza hoş geldin.")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
                {tr("Yalnızca gerçekten değerli bulacağını düşündüğümüz şeyleri göndereceğiz — spam yok.")}
              </p>
            </>
          ) : (
            <>
              <h2
                id="newsletter-popup-title"
                className="mt-4 font-display text-2xl font-semibold leading-tight text-text-on-ink"
              >
                {tr("FXPARTNER'ı ziyaret ettiğin için teşekkür ederim.")}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-on-ink-muted">
                <p>
                  {tr("Bu platformu, forex piyasasında gerçekten güvenilir bilgiye ulaşmanın zor olduğunu görerek kurduk. Zamanını ayırıp bizi keşfettiğin için gerçekten minnettarım.")}
                </p>
                <p>
                  {tr("Seninle bağlantımızı sürdürmek istersen, bültenimize abone olmanı rica ederim — yeni sinyaller, piyasa analizleri ve broker kampanyaları hakkında, yalnızca gerçekten işine yarayacak güncellemeleri paylaşıyoruz.")}
                </p>
                <p className="text-text-on-ink">
                  Erdem Torun
                  <br />
                  <span className="text-text-on-ink-muted">{tr("FXPARTNER Kurucusu")}</span>
                </p>
              </div>

              <form action={formAction} className="mt-6 flex flex-col gap-3">
                <input type="hidden" name="source" value="popup" />
                <div>
                  <label htmlFor="newsletter-popup-email" className="text-xs font-medium text-text-on-ink">
                    {tr("E-posta")}
                  </label>
                  <input
                    id="newsletter-popup-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    className="mt-1.5 w-full rounded-full border border-hairline bg-ink-soft px-4 py-2.5 text-sm text-text-on-ink outline-none focus:border-signal"
                  />
                </div>
                {state.error && <p className="text-xs text-alert">{state.error}</p>}
                <div className="mt-1 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="font-mono text-xs uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
                  >
                    {tr("Şimdi değil")}
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-full bg-signal px-6 py-2.5 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
                  >
                    {pending ? "…" : tr("Gönder")}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
