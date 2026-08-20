"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useMoreMenu } from "@/components/MoreMenuContext";
import { primaryLinks, resourceLinks, type ResourceGroup } from "@/lib/navLinks";

const RESOURCE_GROUPS: ResourceGroup[] = ["İçerik", "Kazanç Programları", "Araçlar ve Güven"];

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNav({
  signedIn,
  accountHref,
}: {
  signedIn: boolean;
  accountHref: string;
}) {
  const pathname = usePathname();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const { open: mobileOpen, setOpen: setMobileOpen } = useMoreMenu();
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
    <div className="flex shrink-0 items-center gap-3">
      <nav className="hidden shrink-0 items-center gap-1 rounded-full border border-hairline bg-ink-soft/60 p-1 xl:flex">
        {primaryLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <a
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-signal text-on-signal"
                  : "text-text-on-ink-muted hover:text-text-on-ink"
              }`}
            >
              {link.label}
            </a>
          );
        })}
        <div className="relative" ref={resourcesRef}>
          <button
            type="button"
            onClick={() => setResourcesOpen((v) => !v)}
            aria-expanded={resourcesOpen}
            className="flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            Kaynaklar
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
            <div className="absolute right-0 top-full mt-3 grid w-[min(46rem,calc(100vw-3rem))] grid-cols-3 gap-1 rounded-2xl border border-hairline bg-ink-soft p-4 shadow-2xl motion-safe:animate-[popIn_0.15s_ease-out]">
              {RESOURCE_GROUPS.map((group) => (
                <div key={group}>
                  <span className="block px-2 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    {group}
                  </span>
                  <div className="mt-2">
                    {resourceLinks
                      .filter((link) => link.group === group)
                      .map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          title={link.description}
                          onClick={() => setResourcesOpen(false)}
                          className="block rounded-xl px-2 py-2 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink"
                        >
                          {link.label}
                        </a>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="hidden items-center gap-3 border-l border-hairline pl-3 xl:flex">
        <LanguageSwitcher />
        {signedIn ? (
          <Link
            href={accountHref}
            className="whitespace-nowrap text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            Hesabım
          </Link>
        ) : (
          <>
            <Link
              href="/account/login"
              className="whitespace-nowrap text-sm text-text-on-ink-muted transition-colors hover:text-text-on-ink"
            >
              Giriş Yap
            </Link>
            <Link
              href="/account/register"
              className="whitespace-nowrap rounded-full border border-hairline px-3.5 py-1.5 text-sm font-medium text-text-on-ink transition-colors hover:border-signal hover:text-signal"
            >
              Kayıt Ol
            </Link>
          </>
        )}
        <Link
          href="/brokerlar"
          className="whitespace-nowrap rounded-full bg-signal px-4 py-2 text-sm font-medium text-on-signal transition-colors hover:bg-signal-strong"
        >
          Brokerları Karşılaştır
        </Link>
      </div>

      {/* Hidden below sm — the phone-width MobileBottomNav's "Daha Fazla"
          tab opens this same menu there instead. Visible sm-xl (tablet),
          where neither the full desktop bar nor the bottom nav apply. */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={mobileOpen}
        className="hidden h-9 w-9 items-center justify-center text-text-on-ink sm:flex xl:hidden"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path
            d="M0 1h20M0 7h20M0 13h20"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
