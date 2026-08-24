// Locale config for the /tr, /ua and /en trees.
//
// Every locale is prefixed, Turkish included: fxpartner.global/tr/blog/x. The
// old unprefixed URLs are still out in Telegram posts, tweets and Google's
// index, so src/proxy.ts answers them with a permanent redirect into /tr
// rather than serving them: one canonical URL per page, and the tree a reader
// is in is always visible in the address bar.

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

/**
 * The full hreflang set for one path, x-default included.
 *
 * x-default is what a search engine shows a reader whose language matches
 * none of the three. It mattered less while Turkish sat on the bare URL and
 * was the obvious fallback; now that every tree is prefixed, nothing is the
 * default unless it says so. It points at Turkish, because that is the
 * language the site is written in and the audience it is written for.
 */
export function hreflangMap(path: string, origin = ""): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of locales) map[hreflangCode[l]] = `${origin}${localePath(l, path)}`;
  map["x-default"] = `${origin}${localePath(defaultLocale, path)}`;
  return map;
}

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

// Prefixes a site-absolute path for the given locale.
//
// Every locale is prefixed, Turkish included: /tr/brokerlar, not /brokerlar.
// Turkish used to be the bare default, which made it the one tree whose URL
// did not say what language it was in — invisible in analytics, ambiguous to
// a crawler deciding which of three near-identical pages to index, and a
// special case every caller had to remember. proxy.ts sends the old
// unprefixed paths here with a permanent redirect.
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Splits a pathname into its locale and the path as the rest of the app
 * thinks of it, i.e. with the prefix taken off.
 *
 * Every prefix is stripped, Turkish included. This used to carry an extra
 * `&& first !== defaultLocale` condition, from when Turkish was the one
 * tree sitting on the bare URL and so had no prefix to remove. Once Turkish
 * moved to /tr, that condition started handing every caller back a path that
 * still said /tr, and all three quietly did the wrong thing with it:
 *
 *   - LocaleSwitcher joined /ua to /tr/blog/x and linked at /ua/tr/blog/x,
 *     so switching language from any Turkish page was a 404.
 *   - useLocalePathname compared /tr/brokerlar against hrefs written the
 *     Turkish way (/brokerlar), so no nav item was ever marked active.
 *   - proxy.ts asks whether the path startsWith("/admin"). "/tr/admin" does
 *     not, so the admin and account guards stopped running on the prefixed
 *     URLs, and /tr/admin/cashback served the panel to anyone who asked.
 *
 * A pathname with no locale prefix still reports the default locale and comes
 * back unchanged: proxy.ts redirects those, and reads this to know where to.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split("/");
  const first = segments[1];
  if (first && isLocale(first)) {
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
