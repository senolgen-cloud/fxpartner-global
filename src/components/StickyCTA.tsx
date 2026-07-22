"use client";

import { useEffect, useState } from "react";

export default function StickyCTA({ brokerCount }: { brokerCount: number }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 640);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-all duration-300 ease-out sm:px-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-full border border-hairline bg-ink/90 py-2.5 pl-5 pr-2.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-on-ink">
            {brokerCount} broker · free comparison
          </p>
          <p className="truncate font-mono text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted">
            No account needed to browse
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="#brokers"
            className="lift-on-hover rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
          >
            Compare now
          </a>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink sm:flex"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
