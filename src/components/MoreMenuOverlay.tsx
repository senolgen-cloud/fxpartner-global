"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useMoreMenu } from "@/components/MoreMenuContext";
import { primaryLinks, resourceLinks } from "@/lib/navLinks";

// Full-screen menu, opened from either HeaderNav's tablet-width hamburger
// or MobileBottomNav's "Daha Fazla" tab (phone width) — see
// MoreMenuContext for why this needs to live outside either of those.
export default function MoreMenuOverlay({
  signedIn,
  accountHref,
}: {
  signedIn: boolean;
  accountHref: string;
}) {
  const { open, setOpen } = useMoreMenu();

  if (!open) return null;

  function close() {
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink text-text-on-ink motion-safe:animate-[fadeIn_0.15s_ease-out]">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-hairline px-4 md:h-16 md:px-6">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">Menü</span>
        <button
          type="button"
          onClick={close}
          aria-label="Menüyü kapat"
          className="flex h-9 w-9 items-center justify-center text-text-on-ink"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-5">
          <LanguageSwitcher />
        </div>
        <div className="flex flex-col gap-1">
          {[...primaryLinks, ...resourceLinks].map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-base text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-hairline pt-5">
          <Link
            href={accountHref}
            onClick={close}
            className="text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            {signedIn ? "My Account" : "Sign In"}
          </Link>
          <a
            href="#brokers"
            onClick={close}
            className="rounded-full bg-signal px-4 py-3 text-center text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
          >
            Compare Brokers
          </a>
        </div>
      </div>
    </div>
  );
}
