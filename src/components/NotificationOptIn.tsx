"use client";
import { useTr } from "@/components/useTr";
import { useLocale } from "@/components/LocaleProvider";
import Sheet, { SheetAction, SheetBody, SheetNote, SheetTitle } from "@/components/Sheet";
import { PRIORITY, useInterruptionSlot } from "@/components/interruptionSlot";

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
  const locale = useLocale();
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
          // The page's own locale rides along with the subscription. Without
          // it the server has no way to know which language this phone
          // should be spoken to in, and every push went out in Turkish.
          body: JSON.stringify({ ...subscription.toJSON(), locale }),
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

  const owns = useInterruptionSlot("push", PRIORITY.nudge, visible);

  // Two different asks share this sheet. On an iPhone that has not been
  // installed to the home screen there is no permission to grant yet —
  // WebKit only offers push to an installed app — so the sheet explains
  // the one step that has to happen first instead of showing a button
  // that cannot work.
  return (
    <Sheet
      open={owns}
      variant="passive"
      desktopAlign="end"
      onDismiss={dismiss}
      labelledBy="notification-optin-title"
      footer={
        needsIosInstall ? (
          <SheetAction tone="secondary" onClick={dismiss}>
            {tr("Anladım")}
          </SheetAction>
        ) : (
          <>
            <SheetAction tone="secondary" onClick={dismiss}>
              {tr("Şimdi değil")}
            </SheetAction>
            <SheetAction tone="primary" onClick={enable} disabled={busy}>
              {busy ? tr("Açılıyor...") : error ? tr("Tekrar Dene") : tr("Bildirimleri Aç")}
            </SheetAction>
          </>
        )
      }
    >
      <SheetTitle id="notification-optin-title">
        {needsIosInstall ? tr("Önce ana ekrana ekle") : tr("Bildirimleri aç")}
      </SheetTitle>
      {needsIosInstall ? (
        <SheetBody>
          {tr("iPhone'da bildirim alabilmek için önce FXPARTNER'ı ana ekranına eklemen gerekiyor:")}{" "}
          <span className="text-text-on-ink">{tr("Paylaş")}</span> →{" "}
          <span className="text-text-on-ink">{tr("Ana Ekrana Ekle")}</span>.{" "}
          {tr("Ekledikten sonra uygulamayı ana ekrandan aç, bildirimler orada açılabilir.")}
        </SheetBody>
      ) : (
        <>
          <SheetBody>
            {tr("Yeni piyasa analizi, haber ve broker kampanyaları yayınlandığında anında tarayıcı bildirimi al.")}
          </SheetBody>
          {error && (
            <SheetNote>
              <span className="text-alert">
                {tr("Bildirim izni alınamadı. Tarayıcınızın site ayarlarından bildirim izninin engellenmediğini kontrol edip tekrar deneyin.")}
              </span>
            </SheetNote>
          )}
        </>
      )}
    </Sheet>
  );
}
