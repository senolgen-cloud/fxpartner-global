"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { brokers } from "@/data/brokers";
import { lookupBrokers } from "@/data/brokerLookup";

type Suggestion = { name: string; href: string; sub: string };

const rankedByName = new Map(brokers.map((b) => [b.name.toLowerCase(), b]));

const allSuggestions: Suggestion[] = [
  ...brokers.map((b) => ({
    name: b.name,
    href: `/brokers/${b.slug}`,
    sub: `Ranked #${String(b.rank).padStart(2, "0")} · Full review`,
  })),
  ...lookupBrokers
    .filter((b) => !rankedByName.has(b.name.toLowerCase()))
    .map((b) => ({
      name: b.name,
      href: `/broker-lookup?q=${encodeURIComponent(b.name)}`,
      sub:
        b.verdict === "high-risk"
          ? "High risk — trust verdict"
          : b.verdict === "caution"
            ? "Caution — trust verdict"
            : "Verified — trust verdict",
    })),
];

export default function HeroBrokerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSuggestions.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  function goToLookup() {
    const q = query.trim();
    if (!q) return;
    router.push(`/broker-lookup?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full border border-hairline bg-ink-soft/70 px-4 py-2.5 focus-within:border-signal">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 text-text-on-ink-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToLookup();
          }}
          placeholder="Search a broker (e.g. XM, Octa, Trade360...)"
          className="w-full bg-transparent text-sm text-text-on-ink placeholder:text-text-on-ink-muted focus:outline-none"
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-hairline bg-ink-soft shadow-2xl motion-safe:animate-[popIn_0.15s_ease-out]">
          {results.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="block border-b border-hairline px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-ink"
            >
              <span className="notranslate block text-sm font-medium text-text-on-ink">
                {s.name}
              </span>
              <span className="mt-0.5 block text-xs text-text-on-ink-muted">{s.sub}</span>
            </a>
          ))}
        </div>
      )}

      {open && query.trim() !== "" && results.length === 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-hairline bg-ink-soft p-4 shadow-2xl">
          <p className="text-sm text-text-on-ink-muted">
            No match yet — press Enter to check &ldquo;{query}&rdquo; on Broker Lookup.
          </p>
        </div>
      )}
    </div>
  );
}
