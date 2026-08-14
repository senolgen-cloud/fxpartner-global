"use client";

import { useEffect, useState } from "react";

// Same non-standard Chrome pre-install event AddToHomeScreen.tsx listens
// for — both components register their own independent listener (the
// browser dispatches to every listener, not just the first), so either UI
// can trigger the same native prompt without needing shared state.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileUA(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function PhoneIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function DesktopIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <rect x="3" y="4" width="18" height="12" rx="1.8" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function InstructionsModal({
  kind,
  ios,
  onClose,
}: {
  kind: "mobile" | "desktop";
  ios: boolean;
  onClose: () => void;
}) {
  const steps =
    kind === "mobile"
      ? ios
        ? [
            "Safari'de sağ üstteki paylaş simgesine (kare + ok) dokun.",
            "Açılan menüden \"Ana Ekrana Ekle\"yi seç.",
            "\"Ekle\"ye dokun — FXPARTNER artık bir uygulama gibi ana ekranında.",
          ]
        : [
            "Chrome'da sağ üstteki ⋮ menüsüne dokun.",
            "\"Ana ekrana ekle\" veya \"Uygulamayı yükle\"yi seç.",
            "Onaylayın — FXPARTNER artık uygulama çekmecende.",
          ]
      : [
            "Adres çubuğunun sağındaki yükle simgesine (⊕ veya ekran ikonu) tıkla.",
            "Görünmüyorsa tarayıcı menüsü (⋮) → \"FXPARTNER'ı Yükle\"yi seç.",
            "Yükle'ye tıkla — FXPARTNER artık masaüstünden/başlat menüsünden açılıyor.",
          ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-instructions-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-hairline bg-ink p-6 text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.2s_ease-out]"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            id="install-instructions-title"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal"
          >
            {kind === "mobile" ? "Telefona Yükle" : "PC'ye Yükle"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="font-mono text-base text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            ×
          </button>
        </div>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-text-on-ink-muted">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal/15 font-mono text-xs text-signal">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Hero-level, always-visible install CTAs — distinct from AddToHomeScreen's
// passive bottom-corner toast, which only appears once Chrome decides the
// page is installable and may never fire on iOS/Firefox/Safari at all. These
// buttons work everywhere: native prompt when the browser supports it,
// manual step-by-step instructions otherwise.
export default function InstallAppButtons() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [modal, setModal] = useState<"mobile" | "desktop" | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIOS());

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function handleClick(kind: "mobile" | "desktop") {
    // Only trust the native prompt when it matches the button's own
    // platform — a captured desktop prompt shouldn't fire from the mobile
    // button (and vice versa) on a device where both UAs could apply.
    const platformMatches = kind === "mobile" ? isMobileUA() : !isMobileUA();
    if (deferredEvent && platformMatches) {
      await deferredEvent.prompt();
      const choice = await deferredEvent.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredEvent(null);
        return;
      }
    }
    setModal(kind);
  }

  if (standalone) return null;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleClick("mobile")}
          className="lift-on-hover flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
        >
          <PhoneIcon />
          Telefona Yükle
        </button>
        <button
          type="button"
          onClick={() => handleClick("desktop")}
          className="lift-on-hover flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
        >
          <DesktopIcon />
          PC&apos;ye Yükle
        </button>
      </div>

      {modal && <InstructionsModal kind={modal} ios={ios} onClose={() => setModal(null)} />}
    </>
  );
}
