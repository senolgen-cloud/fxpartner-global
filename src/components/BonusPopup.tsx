"use client";

import { useEffect, useState } from "react";
import { getBrokerBySlug } from "@/data/brokers";

const DISMISS_KEY = "fxpartner-xm-bonus-popup-dismissed";

export default function BonusPopup() {
  const [open, setOpen] = useState(false);
  const broker = getBrokerBySlug("xm");

  useEffect(() => {
    if (!broker) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [broker]);

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
  }

  if (!open || !broker) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 motion-safe:animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bonus-popup-title"
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
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
            {broker.name} Promotion
          </span>
          <h2
            id="bonus-popup-title"
            className="mt-3 font-display text-3xl font-semibold leading-tight text-text-on-ink"
          >
            100% bonus for new accounts
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">
            New investors who open a {broker.name}{" "}
            account with the FXPARTNER partner code get a 100% deposit
            bonus. The bonus rate varies by account type and country.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={broker.referralUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={close}
              className="rounded-full bg-signal px-5 py-3 text-center text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
            >
              Open Account and Claim Bonus
            </a>
            <button
              type="button"
              onClick={close}
              className="text-center font-mono text-xs uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              Not now
            </button>
          </div>

          <p className="mt-5 font-mono text-[10px] leading-relaxed text-text-on-ink-muted">
            Affiliate link · Check {broker.name}&apos;s official site for
            current bonus terms · Bonus campaigns may not be available in
            some regions/account types · T&amp;Cs Apply
          </p>
        </div>
      </div>
    </div>
  );
}
