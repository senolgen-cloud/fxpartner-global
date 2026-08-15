"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBrokerBySlug } from "@/data/brokers";

const DISMISS_KEY = "fxpartner-bonus-popup-dismissed";

const PROMOS = [
  {
    slug: "xm",
    headline: "Yeni Hesaplara %100 Bonus",
    body: "FXPARTNER partner koduyla XM hesabı açan yeni yatırımcılar %100 yatırım bonusu kazanır. Bonus oranı hesap türüne ve ülkeye göre değişir.",
  },
  {
    slug: "avatrade",
    headline: "FXPARTNER'a Özel %15 Bonus",
    body: "FXPARTNER partner koduyla AvaTrade hesabı açan yeni yatırımcılar özel %15 yatırım bonusu kazanır. Bonus oranı hesap türüne ve ülkeye göre değişir.",
  },
  {
    slug: "lite-finance",
    headline: "FXPARTNER'a Özel %20 Bonus",
    body: "FXPARTNER partner koduyla Lite Finance hesabı açan yeni yatırımcılar özel %20 yatırım bonusu kazanır. Bonus oranı hesap türüne ve ülkeye göre değişir.",
  },
  {
    slug: "tickmill",
    headline: "30$ Hoş Geldin Bonusu",
    body: "FXPARTNER partner koduyla Tickmill hesabı açan yeni yatırımcılar 30$ hoş geldin bonusu talep edebilir. Bonus uygunluğu hesap türüne ve ülkeye göre değişir.",
  },
] as const;

// Shown only on the review page of a broker that actually has a promo
// below (see /brokers/[slug]/page.tsx) — no more sitewide random-broker
// popup stacked behind the Telegram one, which is what made every fresh
// visit feel like a wall of back-to-back popups.
export default function BonusPopup({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  const promo = PROMOS.find((p) => p.slug === slug);
  const broker = promo ? getBrokerBySlug(promo.slug) : undefined;

  useEffect(() => {
    if (!promo) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const timer = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(timer);
  }, [promo]);

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
          aria-label="Kapat"
          className="absolute right-4 top-4 font-mono text-lg text-text-on-ink-muted transition-colors hover:text-text-on-ink"
        >
          ×
        </button>

        <div className="p-7">
          <div className="flex items-center gap-3">
            {broker.logo && (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white p-2">
                <Image
                  src={broker.logo}
                  alt={broker.name}
                  fill
                  sizes="44px"
                  className="object-contain"
                />
              </div>
            )}
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              <span className="notranslate">{broker.name} </span>Kampanyası
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
              className="rounded-full bg-signal px-5 py-3 text-center text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
            >
              Hesap Aç ve Bonusu Al
            </a>
            <button
              type="button"
              onClick={close}
              className="text-center font-mono text-xs uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              Şimdi değil
            </button>
          </div>

          <p className="mt-5 font-mono text-[10px] leading-relaxed text-text-on-ink-muted">
            Güncel bonus koşulları için {broker.name}&apos;in resmi
            sitesini kontrol edin · Bonus kampanyaları bazı bölgelerde/hesap
            türlerinde geçerli olmayabilir · Şartlar ve koşullar geçerlidir
          </p>
        </div>
      </div>
    </div>
  );
}
