"use client";

import { useMemo } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { localizeData } from "@/lib/localizeContent";

// The client half of localizeData(). Client components import the Turkish
// data modules at module scope, where there is no locale to read, so the
// translation has to happen inside the component — memoized on the locale,
// because walking a tree the size of propFirms on every render would be
// wasteful for a value that only changes when the reader switches language.
export function useLocalizedData<T>(value: T): T {
  const locale = useLocale();
  return useMemo(() => localizeData(value, locale), [value, locale]);
}
