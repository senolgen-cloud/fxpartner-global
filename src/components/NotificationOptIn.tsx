"use client";

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

// A small, dismissible corner prompt — deliberately not another full-screen
// modal like TelegramPopup/BonusPopup, since those two already fire on
// every fresh session and a third stacked modal would be too much.
export default function NotificationOptIn() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
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
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      dismiss();
    } catch {
      dismiss();
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="notification-optin-title"
      className="fixed bottom-16 right-4 z-40 w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.25s_ease-out] sm:bottom-20 sm:right-6"
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
        <p
          id="notification-optin-title"
          className="mt-2 text-sm leading-relaxed text-text-on-ink-muted"
        >
          Yeni piyasa analizi, haber ve broker kampanyaları yayınlandığında
          anında tarayıcı bildirimi al.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="flex-1 rounded-full bg-signal px-4 py-2 text-center text-xs font-medium text-on-signal transition-colors hover:bg-signal-strong disabled:opacity-60"
          >
            {busy ? "Açılıyor..." : "Bildirimleri Aç"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
}
