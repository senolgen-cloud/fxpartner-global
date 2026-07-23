"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const primaryLinks = [
  { href: "/#brokers", label: "Broker Rankings" },
  { href: "/categories", label: "Categories" },
  { href: "/blog", label: "Blog" },
];

const resourceLinks = [
  {
    href: "/cashback",
    label: "Cashback",
    description: "Rebate programs from partner brokers",
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    description: "Active referral and deposit promotions",
  },
  {
    href: "/blacklist",
    label: "Risk Warnings",
    description: "Brokers that need extra due diligence",
  },
  {
    href: "/complaint",
    label: "Complaint",
    description: "Report an issue with a broker",
  },
];

export default function HeaderNav({
  signedIn,
  accountHref,
}: {
  signedIn: boolean;
  accountHref: string;
}) {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <nav className="hidden items-center gap-7 md:flex">
        {primaryLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            {link.label}
          </a>
        ))}
        <div className="relative" ref={resourcesRef}>
          <button
            type="button"
            onClick={() => setResourcesOpen((v) => !v)}
            aria-expanded={resourcesOpen}
            className="flex items-center gap-1.5 text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            Resources
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M1 1l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {resourcesOpen && (
            <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-hairline bg-ink-soft p-2 shadow-2xl motion-safe:animate-[popIn_0.15s_ease-out]">
              {resourceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setResourcesOpen(false)}
                  className="block rounded-xl px-4 py-3 transition-colors hover:bg-ink"
                >
                  <span className="block text-sm font-medium text-text-on-ink">
                    {link.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-text-on-ink-muted">
                    {link.description}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="hidden items-center gap-3 border-l border-hairline pl-3 md:flex">
        <Link
          href={accountHref}
          className="text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
        >
          {signedIn ? "My Account" : "Sign In"}
        </Link>
        <a
          href="#brokers"
          className="rounded-full bg-signal px-4 py-2 text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
        >
          Compare Brokers
        </a>
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        className="flex h-9 w-9 items-center justify-center text-text-on-ink md:hidden"
      >
        {mobileOpen ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M1 1l16 16M17 1L1 17"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
            <path
              d="M0 1h20M0 7h20M0 13h20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full border-b border-hairline bg-ink px-6 py-6 md:hidden">
          <div className="flex flex-col gap-1">
            {[...primaryLinks, ...resourceLinks].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
            <Link
              href={accountHref}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              {signedIn ? "My Account" : "Sign In"}
            </Link>
            <a
              href="#brokers"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-signal px-4 py-2.5 text-center text-sm font-medium text-paper-high transition-colors hover:bg-signal-strong"
            >
              Compare Brokers
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
