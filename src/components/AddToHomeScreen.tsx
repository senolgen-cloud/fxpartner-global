"use client";
import { useTr } from "@/components/useTr";
import { isStandalone } from "@/lib/standalone";
import Sheet, { SheetAction, SheetBody, SheetTitle } from "@/components/Sheet";
import { PRIORITY, useInterruptionSlot } from "@/components/interruptionSlot";

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

// Install and push permission can both become available at the same
// moment. As corner toasts they simply sat on opposite sides; as sheets
// they would land on top of each other, so both go through the shared
// interruption slot and the second one waits its turn.
export default function AddToHomeScreen() {
  const tr = useTr();
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

  const owns = useInterruptionSlot("a2hs", PRIORITY.nudge, visible);

  return (
    <Sheet
      open={owns}
      variant="passive"
      desktopAlign="end"
      onDismiss={installed ? undefined : dismiss}
      labelledBy="a2hs-title"
      footer={
        installed ? undefined : (
          <>
            <SheetAction tone="secondary" onClick={dismiss}>
              {tr("Şimdi değil")}
            </SheetAction>
            <SheetAction tone="primary" onClick={install}>
              {tr("Ana Ekrana Ekle")}
            </SheetAction>
          </>
        )
      }
    >
      <SheetTitle id="a2hs-title">
        {installed ? tr("Ana ekranına eklendi") : tr("FXPARTNER'ı ana ekranına ekle")}
      </SheetTitle>
      <SheetBody>
        {installed
          ? tr("FXPARTNER'ı artık ana ekranından açabilirsin.")
          : tr("Tek dokunuşla aç, bildirimleri daha güvenilir al.")}
      </SheetBody>
    </Sheet>
  );
}
