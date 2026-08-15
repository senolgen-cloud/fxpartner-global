"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "fxpartner-a2hs-dismissed";

// Chrome's non-standard pre-install event — fires only when the browser
// itself judges the page installable (valid manifest + registered service
// worker + served over HTTPS), and only on Chromium-based browsers
// (Android Chrome, desktop Chrome/Edge). Safari/Firefox never fire this;
// iOS has its own manual "Share → Add to Home Screen" flow, covered
// separately by NotificationOptIn's iOS instructions.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Bottom-left, mirroring NotificationOptIn's bottom-right — the two are
// independent browser prompts (install vs. push permission) that can both
// legitimately want to show at once; keeping them on opposite corners
// means they never visually stack on top of each other.
export default function AddToHomeScreen() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem(DISMISS_KEY)) return;

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    function onInstalled() {
      setInstalled(true);
      setTimeout(() => setVisible(false), 2500);
    }
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }

  async function install() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="a2hs-title"
      // bottom-40 (not the old bottom-16) clears LiveSupportWidget, which
      // sits at bottom-24 left-3 on every breakpoint (not desktop-only like
      // the old CommunityWidget/DesktopQuickNavFab pair was), so this needs
      // the extra clearance on mobile too, not just sm:.
      className="fixed bottom-40 left-4 z-40 w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.25s_ease-out] sm:bottom-44 sm:left-6"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            FXPARTNER Uygulaması
          </span>
          {!installed && (
            <button
              type="button"
              onClick={dismiss}
              aria-label="Kapat"
              className="shrink-0 font-mono text-base text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              ×
            </button>
          )}
        </div>
        {installed ? (
          <p id="a2hs-title" className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
            Eklendi — FXPARTNER&apos;ı artık ana ekranından açabilirsin. 🎉
          </p>
        ) : (
          <>
            <p id="a2hs-title" className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
              FXPARTNER&apos;ı ana ekranına ekle — tek dokunuşla aç, bildirimleri
              daha güvenilir al.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={install}
                className="flex-1 rounded-full bg-signal px-4 py-2 text-center text-xs font-medium text-on-signal transition-colors hover:bg-signal-strong"
              >
                Ana Ekrana Ekle
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted transition-colors hover:text-text-on-ink"
              >
                Şimdi değil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
