"use client";

import { useEffect, useState } from "react";
import NotFoundBody from "@/components/NotFoundBody";
import { defaultLocale, htmlLang, localeDir, splitLocale, type Locale } from "@/lib/i18n";

// global-not-found renders once, outside the [locale] tree, so it cannot
// know which tree the dead address was in. The address bar can: the first
// segment is the locale. Turkish is rendered first and swapped after mount
// rather than read during render, so the server HTML and the first client
// render agree and hydration has nothing to reconcile.
export default function GlobalNotFoundBody() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const detected = splitLocale(window.location.pathname).locale;
    // Same reason the layout sets these on <html>: an Arabic reader needs
    // the whole document right to left, not just this block.
    document.documentElement.lang = htmlLang[detected];
    document.documentElement.dir = localeDir[detected];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the locale lives only in window.location, which is not available during render
    setLocale(detected);
  }, []);

  return <NotFoundBody locale={locale} />;
}
