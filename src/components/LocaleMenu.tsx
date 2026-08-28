"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { useTr } from "@/components/useTr";
import { localeFlag, localeLabel, localePath, locales, splitLocale } from "@/lib/i18n";

// The language switch as one control instead of four.
//
// It used to print every locale as its own chip — TR UA EN AR sitting in a
// row. Four chips to express one setting, and three of them were noise to
// any given reader: the header's whole right-hand side was a language
// switch nobody uses more than once. This shows the current language and
// opens the rest.
//
// next/link directly, not LocaleLink — this is the one control whose entire
// job is to leave the current locale, so prefixing it again would pin the
// reader where they already are.
export default function LocaleMenu() {
  const tr = useTr();
  const current = useLocale();
  const { path } = splitLocale(usePathname());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={tr("Dil")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-text-on-ink-muted transition-colors hover:bg-ink-soft hover:text-text-on-ink"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
        </svg>
        <span className="notranslate font-mono text-[11px] uppercase tracking-[0.1em]">
          {current}
        </span>
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-hairline bg-ink-soft p-1 shadow-2xl motion-safe:animate-[popIn_0.15s_ease-out]">
          {locales.map((locale) => {
            const active = locale === current;
            return (
              <Link
                key={locale}
                href={localePath(locale, path)}
                hrefLang={locale}
                aria-current={active ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-signal/15 text-signal"
                    : "text-text-on-ink-muted hover:bg-ink hover:text-text-on-ink"
                }`}
              >
                <span aria-hidden="true">{localeFlag[locale]}</span>
                <span className="notranslate flex-1">{localeLabel[locale]}</span>
                {active && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
