"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTRY_OPTIONS, getCountryOption, type CountryOption } from "@/lib/countryLanguages";

const ENGLISH: CountryOption = { code: "US", name: "English", flag: "🌐", lang: "en" };

function readGoogTransCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return "en";
  // Google's cookie format is "/en/<lang>"
  const parts = decodeURIComponent(match[1]).split("/");
  return parts[2] || "en";
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`;
}

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState<CountryOption>(ENGLISH);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lang = readGoogTransCookie();
    setCurrent(lang === "en" ? ENGLISH : getCountryOption(lang) || ENGLISH);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectLanguage(option: CountryOption) {
    setCookie("fxp_lang", option.lang);
    if (option.lang === "en") {
      deleteCookie("googtrans");
    } else {
      setCookie("googtrans", `/en/${option.lang}`);
    }
    setOpen(false);
    window.location.reload();
  }

  const filtered = COUNTRY_OPTIONS.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm text-text-on-ink-muted transition-colors hover:border-text-on-ink hover:text-text-on-ink"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em]">{current.lang}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-hairline bg-ink-soft p-3 shadow-2xl motion-safe:animate-[popIn_0.15s_ease-out]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country..."
            autoFocus
            className="w-full rounded-xl border border-hairline bg-ink px-3 py-2 text-sm text-text-on-ink placeholder:text-text-on-ink-muted focus:border-signal focus:outline-none"
          />
          <div className="mt-2 max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={() => selectLanguage(ENGLISH)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-ink ${
                current.lang === "en" ? "text-signal" : "text-text-on-ink"
              }`}
            >
              <span aria-hidden="true">🌐</span>
              Original (English)
            </button>
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => selectLanguage(c)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-ink ${
                  current.lang === c.lang && current.code === c.code
                    ? "text-signal"
                    : "text-text-on-ink"
                }`}
              >
                <span aria-hidden="true">{c.flag}</span>
                {c.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2.5 py-4 text-center text-sm text-text-on-ink-muted">
                No countries found.
              </p>
            )}
          </div>
          <p className="mt-2 border-t border-hairline px-2.5 pt-2 text-[10px] leading-relaxed text-text-on-ink-muted">
            Machine-translated by Google Translate. Original content is in
            English.
          </p>
        </div>
      )}
    </div>
  );
}
