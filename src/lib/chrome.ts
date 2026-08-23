import { defaultLocale, intlLocale, type Locale } from "@/lib/i18n";
import { getServerLocale } from "@/lib/serverLocale";
import uk from "@/data/i18n/uk/chrome.json";
import en from "@/data/i18n/en/chrome.json";

// Page and component copy — the headings, paragraphs and button labels that
// live in JSX rather than in src/data.
//
// The key is the Turkish sentence itself, not an invented identifier. That
// choice does the work: nothing has to stay in sync, a string with no
// translation renders as the Turkish it already was, and a codemod can wrap
// a literal in place without inventing a name for it. It is how gettext has
// always done this.

type Overlay = Record<string, string>;

const overlays: Partial<Record<Locale, Overlay>> = { ua: uk, en };

export function translateChrome(locale: Locale, text: string): string {
  if (locale === defaultLocale) return text;
  const value = overlays[locale]?.[text];
  return typeof value === "string" && value.trim() ? value : text;
}

// For server components: reads the locale the layout recorded for this
// request. Named tr() because it appears inline in JSX several hundred
// times and length matters there.
export function tr(text: string): string {
  return translateChrome(getServerLocale(), text);
}

export function chromeCoverage(locale: Locale): { translated: number; total: number } {
  const overlay = overlays[locale] ?? {};
  const keys = Object.keys(overlay);
  return { translated: keys.filter((k) => overlay[k]?.trim()).length, total: keys.length };
}

/**
 * A message with values interpolated into it.
 *
 * `{count} İşlem — Gerçekleşen K/Z` cannot be keyed by the rendered string,
 * because the rendered string is different every time the number changes.
 * Naming the holes keeps one catalogue entry for the sentence and lets a
 * translator move them: Ukrainian and English put the count in a different
 * place than Turkish does, and a positional %s could not express that.
 *
 * An unknown placeholder is left visible rather than blanked, so a typo in a
 * key shows up as `{cont}` on the page instead of silently disappearing.
 */
export function formatMessage(
  locale: Locale,
  text: string,
  vars: Record<string, string | number>
): string {
  return translateChrome(locale, text).replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}

/** Server-side trf(), the interpolating sibling of tr(). */
export function trf(text: string, vars: Record<string, string | number>): string {
  return formatMessage(getServerLocale(), text, vars);
}

/**
 * The Intl locale for this request, for toLocaleDateString and friends.
 *
 * Dates were formatted with a literal "tr-TR" everywhere, which is invisible
 * in the Turkish tree and wrong in every other one: a Ukrainian reader got
 * "18 Ağustos". Reading it from the request store keeps the call sites as
 * short as they were.
 */
export function trLocale(): string {
  return intlLocale[getServerLocale()];
}
