"use client";
import { useTr } from "@/components/useTr";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/LocaleLink";
import { useLocalePathname } from "@/components/useLocalePathname";
import { useLocale } from "@/components/LocaleProvider";
import { localePath } from "@/lib/i18n";
import LocaleMenu from "@/components/LocaleMenu";
import HeaderBell from "@/components/HeaderBell";
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
  const tr = useTr();
  const pathname = useLocalePathname();
  const locale = useLocale();
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
      <nav className="hidden shrink-0 items-center gap-0.5 rounded-full border border-hairline bg-ink-soft/60 p-1 xl:flex">
        {primaryLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <a
              key={link.href}
              href={localePath(locale, link.href)}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-signal text-on-signal"
                  : "text-text-on-ink-muted hover:text-text-on-ink"
              }`}
            >
              {tr(link.label)}
            </a>
          );
        })}
        <div className="relative" ref={resourcesRef}>
          <button
            type="button"
            onClick={() => setResourcesOpen((v) => !v)}
            aria-expanded={resourcesOpen}
            className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-medium text-text-on-ink-muted transition-colors hover:text-text-on-ink"
          >
            {tr("Kaynaklar")}
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
            // Each item carries its own description now instead of hiding it
            // in a title attribute nobody hovers long enough to see. The
            // panel is narrower for it — three columns of bare labels were
            // 46rem of mostly empty space — and the rows stagger in rather
            // than the whole sheet appearing at once, which is what makes a
            // menu feel opened rather than switched on.
            <div className="menu-panel-in absolute end-0 top-full z-50 mt-3 grid w-[min(42rem,calc(100vw-3rem))] grid-cols-3 gap-x-2 gap-y-1 rounded-2xl border border-hairline bg-ink-soft p-3 shadow-2xl">
              {RESOURCE_GROUPS.map((group, gi) => (
                <div key={group}>
                  <span className="block px-2 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                    {tr(group)}
                  </span>
                  <div>
                    {resourceLinks
                      .filter((link) => link.group === group)
                      .map((link, li) => (
                        <a
                          key={link.href}
                          href={localePath(locale, link.href)}
                          onClick={() => setResourcesOpen(false)}
                          style={{ animationDelay: `${gi * 40 + li * 25}ms` }}
                          className="menu-item-in group/item block rounded-xl px-2 py-1.5 transition-colors hover:bg-ink"
                        >
                          <span className="block text-sm font-medium text-text-on-ink">
                            {tr(link.label)}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-text-on-ink-muted">
                            {tr(link.description)}
                          </span>
                        </a>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* The right-hand cluster. It used to be four language chips, one or
          two text links and a pill — five different visual treatments in
          about 400px, none of which agreed with the others. Now: one
          language control, the same two icons the phone header carries, and
          a single filled action, separated by one hairline. */}
      <div className="hidden items-center gap-1 border-s border-hairline ps-2 xl:flex">
        <LocaleMenu />
        {signedIn && <HeaderBell size="desktop" />}
        <Link
          href={accountHref}
          aria-label={signedIn ? tr("Hesabım") : tr("Giriş Yap")}
          title={signedIn ? tr("Hesabım") : tr("Giriş Yap")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
          </svg>
        </Link>
        {!signedIn && (
          <Link
            href="/account/register"
            className="ms-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-text-on-ink transition-colors hover:bg-ink-soft"
          >
            {tr("Kayıt Ol")}
          </Link>
        )}
        <Link
          href="/brokerlar"
          className="ms-1 inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-signal px-4 text-sm font-semibold text-on-signal transition-colors hover:bg-signal-strong"
        >
          {tr("Brokerları Karşılaştır")}
        </Link>
      </div>

      {/* Hidden below sm — the phone-width MobileBottomNav's "Daha Fazla"
          tab opens this same menu there instead. Visible sm-xl (tablet),
          where neither the full desktop bar nor the bottom nav apply. */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? tr("Menüyü kapat") : tr("Menüyü aç")}
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
