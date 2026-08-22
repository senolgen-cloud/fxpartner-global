"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { localePath } from "@/lib/i18n";

// A drop-in for next/link that keeps the reader in the tree they are already
// in. Every internal href in this codebase is written as the Turkish path —
// /blog/x, /brokerlar — and this prefixes it per locale instead of every call
// site having to know: swapping the import is the whole migration for a file.
//
// Left alone: anything that isn't a site-absolute path. External links,
// anchors and mailto: are returned untouched, because prefixing those would
// break them.
export default function LocaleLink({ href, ...rest }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  const localized =
    typeof href === "string" && href.startsWith("/") && !href.startsWith("//")
      ? localePath(locale, href)
      : href;

  return <Link href={localized} {...rest} />;
}
