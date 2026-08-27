"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_NUMBER = "380930071903";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const TELEGRAM_URL = "https://t.me/fxpartner_ET";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.15h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.93 1.36-.5.06-1.11.09-1.79-.11-.41-.13-.94-.3-1.61-.6-2.84-1.23-4.69-4.1-4.83-4.29-.14-.19-1.16-1.54-1.16-2.94s.73-2.09.99-2.37c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.3-.28.47-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.69-.81.88-1.09.19-.28.37-.23.63-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M21.94 4.6 18.6 20.24c-.25 1.13-.9 1.4-1.82.87l-5.04-3.72-2.43 2.34c-.27.27-.5.5-1.02.5l.36-5.15L18.5 6.5c.42-.37-.09-.58-.65-.21L6.4 13.5 1.4 11.94c-1.1-.34-1.11-1.1.23-1.62L20.55 3.4c.9-.34 1.7.2 1.39 1.2z" />
    </svg>
  );
}

// Sitewide floating "Canlı Destek" button — left side, deliberately opposite
// the right-edge QuickAccessHub FAB so it never stacks with it. Same
// bottom-24 rail as that widget so it sits above the mobile bottom nav /
// ticker on every breakpoint.
export default function LiveSupportWidget() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div
      ref={rootRef}
      data-behind-sheet
      className="fixed bottom-24 left-3 z-30 flex flex-col items-start gap-2.5"
    >
      {open && (
        <div className="flex flex-col items-start gap-2.5 motion-safe:animate-[popIn_0.15s_ease-out]">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-full border border-hairline bg-ink py-2 ps-3 pe-4 text-sm font-medium text-text-on-ink shadow-xl transition-colors hover:border-signal hover:text-signal"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
              <WhatsAppIcon />
            </span>
            WhatsApp
          </a>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-full border border-hairline bg-ink py-2 ps-3 pe-4 text-sm font-medium text-text-on-ink shadow-xl transition-colors hover:border-signal hover:text-signal"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal/15 text-signal">
              <TelegramIcon />
            </span>
            Telegram
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Canlı destek panelini kapat" : "Canlı destek panelini aç"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/30 transition-transform hover:scale-105"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.08.8 3.97 2.14 5.5L3 22l5.79-1.52C10.03 20.82 11 21 12 21c5.52 0 10-4.03 10-9s-4.48-10-10-10zm0 2c4.42 0 8 3.58 8 8s-3.58 8-8 8c-.94 0-1.85-.16-2.7-.46l-.5-.18-3.29.86.87-3.2-.2-.51A7.94 7.94 0 0 1 4 11c0-4.42 3.58-9 8-9z" />
          </svg>
        )}
      </button>
    </div>
  );
}
