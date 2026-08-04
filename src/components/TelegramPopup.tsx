"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "fxpartner-telegram-popup-dismissed";
export const TELEGRAM_DISMISS_KEY = DISMISS_KEY;
export const TELEGRAM_CLOSED_EVENT = "fxp:telegram-popup-closed";

const CHANNEL_URL = "https://t.me/fxpartnerglobal";

export default function TelegramPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
    sessionStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event(TELEGRAM_CLOSED_EVENT));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 motion-safe:animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="telegram-popup-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 font-mono text-lg text-text-on-ink-muted transition-colors hover:text-text-on-ink"
        >
          ×
        </button>

        <div className="p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-signal/15">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-6 w-6 text-signal"
                fill="currentColor"
              >
                <path d="M21.94 3.36 18.6 20.1c-.25 1.11-.9 1.38-1.83.86l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.39-8.49c.41-.36-.09-.56-.63-.2L6.02 12.9l-5.02-1.57c-1.09-.34-1.11-1.09.23-1.61L20.6 2.05c.91-.34 1.7.2 1.34 1.31Z" />
              </svg>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              FXPARTNER Telegram
            </span>
          </div>
          <h2
            id="telegram-popup-title"
            className="mt-4 font-display text-3xl font-semibold leading-tight text-text-on-ink"
          >
            Join our Telegram channel
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
            Live exchange rate moves, market analysis, and broker campaign
            alerts — posted straight from FXPARTNER, delivered to your
            phone.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="rounded-full bg-signal px-5 py-3 text-center text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
            >
              Join the Telegram Channel
            </a>
            <button
              type="button"
              onClick={close}
              className="text-center font-mono text-xs uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
