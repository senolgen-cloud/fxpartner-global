"use client";

import { useCallback } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { intlLocale } from "@/lib/i18n";
import { formatMessage, translateChrome } from "@/lib/chrome";

// The client half of tr(). Same overlay, same "the Turkish text is the key"
// rule; the locale comes from context instead of the per-request server
// store, because a client component has no request to read.
export function useTr(): (text: string) => string {
  const locale = useLocale();
  return useCallback((text: string) => translateChrome(locale, text), [locale]);
}

// The client half of trf(). Same catalogue, same named holes.
export function useTrf(): (text: string, vars: Record<string, string | number>) => string {
  const locale = useLocale();
  return useCallback(
    (text: string, vars: Record<string, string | number>) => formatMessage(locale, text, vars),
    [locale]
  );
}

// The client half of trLocale().
export function useIntlLocale(): string {
  return intlLocale[useLocale()];
}
