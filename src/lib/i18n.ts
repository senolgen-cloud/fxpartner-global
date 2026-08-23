// Locale config for the /ua and /en trees.
//
// Turkish is the default and stays unprefixed: fxpartner.global/blog/x keeps
// working exactly as it did, which matters because those URLs are already out
// in Telegram posts, tweets and Google's index. Other locales live under a
// path prefix — /ua/blog/x — and src/proxy.ts rewrites the unprefixed request
// to the internal /tr/... route so the [locale] segment always has a value.

export const locales = ["tr", "ua", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

// The URL segment and the language tag are not the same string for Ukrainian:
// "ua" is the country, and it is what readers and the owner expect to type,
// while `lang` and hreflang must carry the ISO 639-1 language code "uk" or
// search engines will read the page as the wrong language.
export const htmlLang: Record<Locale, string> = {
  tr: "tr",
  ua: "uk",
  en: "en",
};

// What hreflang advertises for each tree.
export const hreflangCode: Record<Locale, string> = {
  tr: "tr",
  ua: "uk",
  en: "en",
};

// Open Graph wants language_TERRITORY, which is neither the URL segment nor
// the bare language code.
export const ogLocale: Record<Locale, string> = {
  tr: "tr_TR",
  ua: "uk_UA",
  en: "en_US",
};

// What Intl should use for dates and numbers. Separate from htmlLang because
// a bare language tag leaves the region to the runtime: "uk" alone can format
// a date differently than "uk-UA" does, and a Ukrainian reader seeing a
// month name in Turkish is exactly the bug this map exists to prevent.
export const intlLocale: Record<Locale, string> = {
  tr: "tr-TR",
  ua: "uk-UA",
  en: "en-GB",
};

export const localeLabel: Record<Locale, string> = {
  tr: "Türkçe",
  ua: "Українська",
  en: "English",
};

export const localeFlag: Record<Locale, string> = {
  tr: "🇹🇷",
  ua: "🇺🇦",
  en: "🇬🇧",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Prefixes a site-absolute path for the given locale. The default locale is
// returned untouched, so every existing href keeps producing the URL it
// always produced.
export function localePath(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path;
  if (!path.startsWith("/")) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// Splits a pathname into its locale and the path as the rest of the app
// thinks of it (i.e. without the prefix). Unprefixed paths are the default
// locale.
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split("/");
  const first = segments[1];
  if (first && isLocale(first) && first !== defaultLocale) {
    const rest = "/" + segments.slice(2).join("/");
    return { locale: first, path: rest === "/" ? "/" : rest.replace(/\/$/, "") };
  }
  return { locale: defaultLocale, path: pathname };
}

/**
 * A whole-number percentage, written the way the locale writes it.
 *
 * Turkish puts the sign first ("%65"), English and Ukrainian put it last
 * ("65%"). Hard-coding either one is wrong in the other two trees, and Intl
 * already knows the rule — it just needs the value as a fraction.
 */
export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value / 100);
}
