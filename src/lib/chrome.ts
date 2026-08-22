import { defaultLocale, type Locale } from "@/lib/i18n";
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
