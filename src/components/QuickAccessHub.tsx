"use client";
import { useTr } from "@/components/useTr";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/LocaleLink";
import type { Broker } from "@/data/brokers";

const DISMISS_KEY = "fxpartner-quick-access-open";

const ICONS = {
  signals: <path d="M3 12h3l2.5-7 4 14 2.5-9L17 12h4" />,
  analysis: <path d="m3 17 5-5 4 4 8-9M14 7h6v6" />,
  compare: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  plus: <path d="M12 5v14M5 12h14" />,
} as const;

function Icon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg
      width="18"
      height="18"
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

const QUICK_LINKS = [
  { href: "/signals", label: "Sinyaller", icon: "signals" as const },
  { href: "/ai-asistan", label: "AI Asistan", icon: "analysis" as const },
  { href: "/", label: "Broker Karşılaştırmaları", icon: "compare" as const },
];

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Desktop-only, single bottom-right FAB — replaces what used to be two
// separate floating widgets (DesktopQuickNavFab + CommunityWidget) stacked
// in the same corner. One toggle now opens one panel with three sections:
// quick nav shortcuts, top brokers, and community links. Appears only after
// scrolling past the hero, same as the old quick-nav FAB did, so it never
// competes with the hero's own CTAs.
export default function QuickAccessHub({ topBrokers }: { topBrokers: Broker[] }) {
  const tr = useTr();
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") setOpen(true);
  }, []);

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

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      sessionStorage.setItem(DISMISS_KEY, next ? "1" : "0");
      return next;
    });
  }

  function close() {
    setOpen(false);
    sessionStorage.setItem(DISMISS_KEY, "0");
  }

  return (
    <div
      ref={rootRef}
      className={`fixed bottom-24 right-6 z-30 hidden flex-col items-end gap-3 transition-all duration-300 sm:flex ${
        pastHero ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {open && (
        <div className="w-[300px] rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.2s_ease-out]">
          {/* Quick nav */}
          <div className="p-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-on-ink-muted">
              {tr("Hızlı Erişim")}
            </span>
            <div className="mt-3 flex flex-col gap-1">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
                >
                  <Icon name={link.icon} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Top brokers */}
          <div className="border-t border-hairline p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
                🏆 Top Brokers
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {topBrokers.map((broker) => (
                <li key={broker.slug}>
                  <Link
                    href={`/brokers/${broker.slug}`}
                    title={`${broker.name} broker review`}
                    onClick={close}
                    className="group flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-ink-soft"
                  >
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft text-[10px] font-semibold text-text-on-ink">
                      {broker.logo ? (
                        <Image src={broker.logo} alt={`${broker.name} logo`} fill sizes="32px" className="object-contain p-1" />
                      ) : (
                        getMonogram(broker.name)
                      )}
                    </span>
                    <span className="notranslate min-w-0 flex-1 truncate text-[13px] font-medium text-text-on-ink">
                      {broker.name}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-signal">#{broker.rank}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/topluluk"
              onClick={close}
              className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-[11px] font-medium text-signal transition-colors hover:text-signal-strong"
            >
              {tr("Topluluğa Katıl")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Community links */}
          <div className="border-t border-hairline p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                📣
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-on-ink">Telegram</h3>
                <p className="truncate text-[11px] text-text-on-ink-muted">@fxpartnerglobal</p>
              </div>
              <a
                href="https://t.me/fxpartnerglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 rounded-full bg-signal px-3 py-1.5 text-[11px] font-medium text-on-signal transition-colors hover:bg-signal-strong"
              >
                {tr("Katıl")}
              </a>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-soft text-text-on-ink">
                🤖
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-on-ink">Sohbet Botu</h3>
                <p className="truncate text-[11px] text-text-on-ink-muted">Sinyaller, broker &amp; kampanyalar</p>
              </div>
              {/* ?start=site lets the bot flow tell this traffic apart from
                  people who found it inside the Telegram channel itself. */}
              <a
                href="https://t.me/fxpartner_chat_bot?start=site"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 rounded-full border border-hairline px-3 py-1.5 text-[11px] font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
              >
                {tr("Başlat")}
              </a>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-soft text-text-on-ink">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text-on-ink">X (Twitter)</h3>
                <p className="truncate text-[11px] text-text-on-ink-muted">@fxpartner_TR</p>
              </div>
              <a
                href="https://x.com/fxpartner_TR"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 rounded-full border border-hairline px-3 py-1.5 text-[11px] font-medium text-text-on-ink transition-colors hover:border-text-on-ink"
              >
                Takip Et
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Hızlı erişim panelini kapat" : "Hızlı erişim panelini aç"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-signal text-on-signal shadow-2xl shadow-signal/30 transition-transform hover:scale-105"
      >
        <Icon name="plus" className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </button>
    </div>
  );
}
