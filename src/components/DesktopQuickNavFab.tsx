"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ICONS = {
  signals: <path d="M3 12h3l2.5-7 4 14 2.5-9L17 12h4" />,
  analysis: <path d="m3 17 5-5 4 4 8-9M14 7h6v6" />,
  compare: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  plus: <path d="M12 5v14M5 12h14" />,
} as const;

function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

const LINKS = [
  { href: "/signals", label: "Sinyaller", icon: "signals" as const },
  { href: "/ai-asistan", label: "AI Asistan", icon: "analysis" as const },
  { href: "/", label: "Broker Karşılaştırmaları", icon: "compare" as const },
];

// Desktop-only counterpart to MobileBottomNav's Sinyaller/Analiz/Broker
// tabs (that component is sm:hidden; this is hidden below sm) — same
// three core-service shortcuts, expressed as a scroll-triggered FAB since
// a fixed bottom tab bar reads as a mobile-app pattern on desktop, not a
// web one. Appears only after scrolling past the hero, so it never
// competes with the hero's own CTAs.
export default function DesktopQuickNavFab() {
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setPastHero(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!pastHero) setOpen(false);
  }, [pastHero]);

  return (
    <div
      ref={rootRef}
      className={`fixed bottom-24 right-6 z-40 hidden flex-col items-end gap-3 transition-all duration-300 sm:flex ${
        pastHero ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {open && (
        <div className="flex flex-col items-end gap-2 motion-safe:animate-[popIn_0.15s_ease-out]">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-full border border-hairline bg-ink py-2 pl-4 pr-3 text-sm font-medium text-text-on-ink shadow-xl transition-colors hover:border-signal hover:text-signal"
            >
              {link.label}
              <Icon name={link.icon} />
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Hızlı menüyü kapat" : "Hızlı menüyü aç"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-signal text-on-signal shadow-2xl shadow-signal/30 transition-transform hover:scale-105"
      >
        <Icon name="plus" className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}
