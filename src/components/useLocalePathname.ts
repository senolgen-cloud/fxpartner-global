"use client";

import { usePathname } from "next/navigation";
import { splitLocale } from "@/lib/i18n";

// usePathname returns the URL as the browser has it, which for a translated
// tree carries the prefix: /ua/brokerlar. Every "is this link the current
// page?" check in the nav compares against hrefs written the Turkish way
// (/brokerlar), so they need the prefix taken back off — otherwise nothing
// is ever marked active outside the default locale.
export function useLocalePathname(): string {
  return splitLocale(usePathname()).path;
}
