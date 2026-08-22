"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { localeFlag, localeLabel, localePath, locales, splitLocale } from "@/lib/i18n";

// Switches between the real translated trees, not the Google Translate
// widget: these are server-rendered pages that a crawler can read, so the
// switch is a plain link to the same page in the other locale rather than a
// cookie that rewrites the DOM after load.
//
// next/link directly, not LocaleLink — this is the one component whose whole
// job is to leave the current locale, so prefixing it again would pin the
// reader where they already are.
export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const current = useLocale();
  const { path } = splitLocale(usePathname());

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={localePath(locale, path)}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              active
                ? "bg-signal text-on-signal"
                : "text-text-on-ink-muted hover:text-text-on-ink"
            }`}
          >
            <span aria-hidden="true">{localeFlag[locale]}</span>
            <span className="notranslate">{localeLabel[locale]}</span>
          </Link>
        );
      })}
    </div>
  );
}
