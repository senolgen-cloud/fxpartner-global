"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string
        ) => unknown;
      };
    };
  }
}

function readGoogTransLang(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return null;
  const parts = decodeURIComponent(match[1]).split("/");
  return parts[2] || null;
}

// Drives the actual translation by setting Google's own hidden <select>
// and firing a change event — the cookie alone only marks intent, it
// doesn't reliably trigger the translation pass in every browser.
function triggerTranslation(lang: string, attempt = 0) {
  const select = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!select) {
    if (attempt < 20) setTimeout(() => triggerTranslation(lang, attempt + 1), 250);
    return;
  }
  if (select.value === lang) return;
  select.value = lang;
  select.dispatchEvent(new Event("change"));
}

// Loads Google's (unofficial, but still functional) website-translator
// widget. We hide its default UI entirely (see .goog-te-* rules in
// globals.css) and drive it ourselves via the googtrans cookie + hidden
// <select>, triggered from our own LanguageSwitcher component, rather
// than showing Google's own dropdown/banner.
//
// Caveat worth knowing: Google discontinued the "Website Translator" as an
// officially supported product years ago. The underlying script still
// works as of this writing and is what thousands of sites still rely on,
// but Google could change or remove it without notice — there's no SLA
// behind this the way there is for a paid translation API.
export default function GoogleTranslateWidget() {
  useEffect(() => {
    const lang = readGoogTransLang();

    if (document.getElementById("google-translate-script")) {
      if (lang) triggerTranslation(lang);
      return;
    }

    window.googleTranslateElementInit = () => {
      if (!window.google) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "tr", autoDisplay: false },
        "google_translate_element"
      );
      if (lang) triggerTranslation(lang);
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" className="hidden" />;
}
