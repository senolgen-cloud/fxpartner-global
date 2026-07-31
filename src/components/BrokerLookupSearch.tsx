"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { lookupBrokers, type LookupVerdict } from "@/data/brokerLookup";

const VERDICT_META: Record<
  LookupVerdict,
  { label: string; badgeClass: string; icon: string }
> = {
  verified: {
    label: "Verified / Regulated",
    badgeClass: "border-tick-up/30 bg-tick-up/10 text-tick-up",
    icon: "✓",
  },
  caution: {
    label: "Caution",
    badgeClass: "border-gold/30 bg-gold/10 text-gold",
    icon: "!",
  },
  "high-risk": {
    label: "High Risk — Avoid",
    badgeClass: "border-alert/30 bg-alert/10 text-alert",
    icon: "✕",
  },
};

export default function BrokerLookupSearch() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return lookupBrokers
      .filter((b) => b.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const order: Record<LookupVerdict, number> = {
          "high-risk": 0,
          caution: 1,
          verified: 2,
        };
        return order[a.verdict] - order[b.verdict];
      });
  }, [query]);

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a broker name (e.g. XM, Octa, Trade360...)"
          className="w-full rounded-2xl border border-hairline-light bg-paper-high px-5 py-4 text-base text-text-dark placeholder:text-text-muted focus:border-signal focus:outline-none"
          autoComplete="off"
        />
      </div>

      {query.trim() === "" && (
        <p className="mt-4 text-sm text-text-muted">
          {lookupBrokers.length} brokers in our searchable database. Start
          typing a name above to search.
        </p>
      )}

      {query.trim() !== "" && results.length === 0 && (
        <div className="mt-6 rounded-2xl border border-hairline-light bg-paper p-6">
          <p className="text-[15px] leading-relaxed text-text-dark/90">
            <strong className="text-text-dark">
              &ldquo;{query}&rdquo; isn&apos;t in our database yet.
            </strong>{" "}
            That doesn&apos;t mean it&apos;s trustworthy — it means we
            haven&apos;t researched it. Before funding an account, check:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex gap-3 text-[15px] text-text-dark/90">
              <span className="mt-1 text-signal">–</span>
              Search the broker&apos;s name on your own country&apos;s
              regulator website (or FCA, ASIC, CySEC) to confirm it&apos;s
              actually licensed.
            </li>
            <li className="flex gap-3 text-[15px] text-text-dark/90">
              <span className="mt-1 text-signal">–</span>
              Search the broker&apos;s name together with &ldquo;scam&rdquo;
              or &ldquo;withdrawal&rdquo; on independent review sites to
              check for recurring complaint patterns.
            </li>
            <li className="flex gap-3 text-[15px] text-text-dark/90">
              <span className="mt-1 text-signal">–</span>
              Promises like &ldquo;guaranteed returns&rdquo; or
              &ldquo;risk-free trading&rdquo; are always a red flag.
            </li>
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 divide-y divide-hairline-light border-t border-hairline-light">
          {results.map((b) => {
            const meta = VERDICT_META[b.verdict];
            return (
              <div key={b.name} className="py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="notranslate font-display text-xl font-semibold text-text-dark">
                    {b.name}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${meta.badgeClass}`}
                  >
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-text-dark/90">
                  {b.note}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {b.regulators && b.regulators.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {b.regulators.map((r) => (
                        <span
                          key={r}
                          className="rounded-full border border-hairline-light px-2.5 py-1 font-mono text-[11px] text-text-muted"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="font-mono text-[11px] text-text-muted">
                    Source: {b.source}
                  </span>
                </div>
                {b.relatedSlug && (
                  <Link
                    href={`/brokers/${b.relatedSlug}`}
                    className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors hover:text-signal-strong"
                  >
                    See full review →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
