"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Broker } from "@/data/brokers";

const DISMISS_KEY = "fxpartner-community-widget-open";

function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Sitewide floating panel (every page, via layout.tsx) — collapsed to a
// small tab by default so it never competes with a page's own primary CTA
// (e.g. the broker review page's sticky "Open Account" sticker at the same
// right edge). Top 3 brokers instead of the sentiment poll here, since
// that poll already lives on /topluluk and doesn't need a second copy.
export default function CommunityWidget({ topBrokers }: { topBrokers: Broker[] }) {
  // Always starts closed on both server and client render — reading
  // sessionStorage synchronously in useState would make the very first
  // client render disagree with the server-rendered HTML (hydration
  // mismatch), so the stored preference is only applied after mount.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") setOpen(true);
  }, []);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      sessionStorage.setItem(DISMISS_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="fixed bottom-24 right-3 z-30 hidden sm:block">
      {open && (
        <div className="mb-3 w-[300px] rounded-2xl border border-hairline bg-ink text-text-on-ink shadow-2xl motion-safe:animate-[popIn_0.2s_ease-out]">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
                🏆 Top Brokers
              </span>
              <button
                type="button"
                onClick={toggle}
                aria-label="Kapat"
                className="font-mono text-base text-text-on-ink-muted transition-colors hover:text-text-on-ink"
              >
                ×
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {topBrokers.map((broker) => (
                <li key={broker.slug}>
                  <Link
                    href={`/brokers/${broker.slug}`}
                    className="group flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-ink-soft"
                  >
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft text-[10px] font-semibold text-text-on-ink">
                      {broker.logo ? (
                        <Image src={broker.logo} alt="" fill sizes="32px" className="object-contain p-1" />
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
              className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-[11px] font-medium text-signal transition-colors hover:text-signal-strong"
            >
              Topluluğa Katıl
              <span aria-hidden="true">→</span>
            </Link>
          </div>

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
                Katıl
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
                Başlat
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
        aria-label={open ? "Topluluk panelini kapat" : "Topluluk panelini aç"}
        className="ml-auto flex items-center gap-2 rounded-full border border-hairline bg-ink px-4 py-2.5 text-xs font-medium text-text-on-ink shadow-xl transition-colors hover:border-signal hover:text-signal"
      >
        👥 Topluluk
      </button>
    </div>
  );
}
