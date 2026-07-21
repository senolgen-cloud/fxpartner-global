"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBrokerBySlug } from "@/data/brokers";

const DISMISS_KEY = "fxpartner-bonus-popup-dismissed";

const PROMOS = [
  {
    slug: "xm",
    headline: "100% Bonus for New Accounts",
    body: "New investors who open an XM account with the FXPARTNER partner code get a 100% deposit bonus. The bonus rate varies by account type and country.",
  },
  {
    slug: "avatrade",
    headline: "FXPARTNER-Exclusive 15% Bonus",
    body: "New investors who open an AvaTrade account with the FXPARTNER partner code get an exclusive 15% deposit bonus. The bonus rate varies by account type and country.",
  },
  {
    slug: "lite-finance",
    headline: "FXPARTNER-Exclusive 20% Bonus",
    body: "New investors who open a Lite Finance account with the FXPARTNER partner code get an exclusive 20% deposit bonus. The bonus rate varies by account type and country.",
  },
  {
    slug: "tickmill",
    headline: "$30 Welcome Bonus",
    body: "New investors who open a Tickmill account with the FXPARTNER partner code can claim a $30 welcome bonus. Bonus availability varies by account type and country.",
  },
] as const;

export default function BonusPopup() {
  const [open, setOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    setPromoIndex(Math.floor(Math.random() * PROMOS.length));
    const timer = setTimeout(() => setOpen(true), 1500);
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
  }

  const promo = promoIndex !== null ? PROMOS[promoIndex] : null;
  const broker = promo ? getBrokerBySlug(promo.slug) : undefined;

  if (!open || !promo || !broker) return null;

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
          <div className="flex items-center gap-3">
            {broker.logo && (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
                <Image
                  src={broker.logo}
                  alt={broker.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              {broker.name} Promotion
            </span>
          </div>
          <h2
            id="bonus-popup-title"
            className="mt-4 font-display text-3xl font-semibold leading-tight text-text-on-ink"
          >
            {promo.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-on-ink-muted">{promo.body}</p>

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
