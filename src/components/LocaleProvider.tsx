"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, type Locale } from "@/lib/i18n";

// Client components sit too far from the route params to read the locale
// themselves — a button three levels inside a menu overlay has no idea which
// tree it is rendering in. The locale layout puts it here once, and
// LocaleLink (and anything else that needs it) reads it from context.
const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
