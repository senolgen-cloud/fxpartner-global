"use client";
import { useTr } from "@/components/useTr";

import { useEffect, useState } from "react";

const DISMISS_KEY = "fxpartner-notification-optin-dismissed";

// Push's VAPID application server key must be sent to the browser as a
// raw Uint8Array, not the base64url string it's stored/generated as.
function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// A small, dismissible corner prompt (not a full-screen modal like
// BonusPopup) — sitewide, since this is the site's general encouragement
// to enable notifications outside the broker-specific bonus popup.
// Some browsers (observed on Edge/Windows) can leave
// Notification.requestPermission() or pushManager.subscribe() pending
// indefinitely — no resolve, no reject — if the OS-level notification
// permission dialog gets stuck or never surfaces. Racing every attempt
// against this timeout means the button always recovers instead of
// staying on "Açılıyor..." forever.
const ENABLE_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

// iOS Safari only exposes the Notification/Push APIs at all once the site
// has been added to the Home Screen (iOS 16.4+) — in a normal Safari tab
// `window.Notification` doesn't exist, so the old guard below silently
// hid the whole prompt for every iPhone visitor with no explanation. This
// detects that specific case so we can show "Add to Home Screen first"
// guidance instead of just never appearing.
function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function NotificationOptIn() {
  const tr = useTr();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [needsIosInstall, setNeedsIosInstall] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    if (isIos() && !isStandalone()) {
      setNeedsIosInstall(true);
      const timer = setTimeout(() => setVisible(true), 7000);
      return () => clearTimeout(timer);
    }

    if (typeof Notification === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;

    const timer = setTimeout(() => setVisible(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      dismiss();
      return;
    }

    setBusy(true);
    setError(false);
    try {
      const permission = await withTimeout(Notification.requestPermission(), ENABLE_TIMEOUT_MS);
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const registration = await withTimeout(navigator.serviceWorker.register("/sw.js"), ENABLE_TIMEOUT_MS);
      const subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        }),
        ENABLE_TIMEOUT_MS
      );

      await withTimeout(
        fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        }),
        ENABLE_TIMEOUT_MS
      );

      dismiss();
    } catch {
      // Timed out or genuinely failed — surface it and let the visitor
      // retry, rather than silently dismissing (they'd have no idea it
      // didn't work) or leaving the button stuck on "Açılıyor...".
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="notification-optin-title"
      // sm:bottom-40 clears QuickAccessHub's FAB (bottom-24, h-14) sitting
      // in the same corner on desktop — on mobile there's no competing
      // widget at bottom-16, so that offset stays as-is.
      className="fixed bottom-16 right-4 z-40 w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.25s_ease-out] sm:bottom-40 sm:right-6"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            FXPARTNER Bildirimleri
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Kapat"
            className="shrink-0 font-mono text-base text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            ×
          </button>
        </div>
        {needsIosInstall ? (
          <>
            <p
              id="notification-optin-title"
              className="mt-2 text-sm leading-relaxed text-text-on-ink-muted"
            >
              iPhone'da bildirim alabilmek için önce FXPARTNER'ı ana ekranına eklemen gerekiyor:{" "}
              <span className="text-text-on-ink">Paylaş</span> (
              <span aria-hidden="true">⬆️</span>) →{" "}
              <span className="text-text-on-ink">&quot;Ana Ekrana Ekle&quot;</span>. Ekledikten
              sonra uygulamayı ana ekrandan aç, bildirimler orada açılabilir.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={dismiss}
                className="w-full rounded-full border border-hairline px-4 py-2 text-center text-xs font-medium text-text-on-ink-muted transition-colors hover:text-text-on-ink"
              >
                {tr("Anladım")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              id="notification-optin-title"
              className="mt-2 text-sm leading-relaxed text-text-on-ink-muted"
            >
              {tr("Yeni piyasa analizi, haber ve broker kampanyaları yayınlandığında anında tarayıcı bildirimi al.")}
            </p>
            {error && (
              <p className="mt-2 text-xs text-alert">
                {tr("Bildirim izni alınamadı. Tarayıcınızın site ayarlarından bildirim izninin engellenmediğini kontrol edip tekrar deneyin.")}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={enable}
                disabled={busy}
                className="flex-1 rounded-full bg-signal px-4 py-2 text-center text-xs font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
              >
                {busy ? "Açılıyor..." : error ? "Tekrar Dene" : "Bildirimleri Aç"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
              >
                {tr("Şimdi değil")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
