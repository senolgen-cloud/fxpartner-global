import { cache } from "react";
import { defaultLocale, type Locale } from "@/lib/i18n";

// Server components can't read React context, and threading a locale prop
// through forty pages and their children is not a refactor anyone would
// finish. React's cache() gives a per-request store instead: the locale
// layout writes the locale once while rendering, and anything rendered
// underneath reads it back on the same request.
//
// Per-request is the important part — two visitors on two locales are two
// separate stores, so this can't leak one reader's language into another's
// page the way a module-level variable would.
const store = cache((): { locale: Locale } => ({ locale: defaultLocale }));

export function setServerLocale(locale: Locale): void {
  store().locale = locale;
}

export function getServerLocale(): Locale {
  return store().locale;
}
