import Link from "next/link";
import { lookupBrokers, type LookupVerdict } from "@/data/brokerLookup";

// Server-rendered, unfiltered index of every Broker Lookup entry.
//
// BrokerLookupSearch (the interactive search box above this component) is a
// "use client" component: its filtered results only exist in the browser
// DOM after hydration, so an AI crawler or agent fetching /broker-lookup
// without executing JavaScript never sees a specific broker's verdict —
// only the empty search shell. That defeats the page's actual purpose for
// AI answer engines, since "is Octa a scam" / "is HFM regulated" style
// queries are exactly what this page exists to answer.
//
// This component renders the full, unfiltered list as plain server HTML
// (grouped under <details>, same progressive-disclosure pattern already
// used for the broker FAQ sections) so every entry is present in the
// initial response and independently linkable/quotable, while staying out
// of the way of the interactive search for human visitors.
const GROUPS: { verdict: LookupVerdict; heading: string; description: string }[] = [
  {
    verdict: "high-risk",
    heading: "Flagged High-Risk",
    description:
      "Named on an official regulator warning/unauthorized-firm list, or a documented scam/clone pattern.",
  },
  {
    verdict: "caution",
    heading: "Use Caution",
    description:
      "Legitimate/operating, but with a real reason to dig deeper — offshore-only licensing, a regulator red flag, or a notable complaint pattern.",
  },
  {
    verdict: "verified",
    heading: "Verified / Regulated",
    description:
      "Holds real Tier-1 and/or multi-jurisdiction regulation, with no major regulator warnings found at time of research.",
  },
];

export default function BrokerLookupFullIndex() {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="font-display text-lg font-semibold text-text-dark">
        Browse the full list
      </h2>
      <p className="text-sm text-text-muted">
        Every broker in our lookup database, grouped by verdict — expand a
        section to browse without searching.
      </p>
      {GROUPS.map((group) => {
        const entries = lookupBrokers.filter((b) => b.verdict === group.verdict);
        if (entries.length === 0) return null;
        return (
          <details key={group.verdict} className="group rounded-2xl border border-hairline-light bg-paper">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-medium text-text-dark">
              <span>
                {group.heading}{" "}
                <span className="font-mono text-xs font-normal text-text-muted">
                  ({entries.length})
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm text-text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="border-t border-hairline-light px-6 pb-6 pt-2">
              <p className="pt-3 text-xs leading-relaxed text-text-muted">{group.description}</p>
              <dl className="mt-4 divide-y divide-hairline-light">
                {entries.map((b) => (
                  <div key={b.name} className="py-4">
                    <dt className="notranslate font-display text-base font-semibold text-text-dark">
                      {b.name}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-text-dark/90">{b.note}</dd>
                    <dd className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {b.regulators && b.regulators.length > 0 && (
                        <span>Regulators: {b.regulators.join(", ")}</span>
                      )}
                      <span className="font-mono">Source: {b.source}</span>
                      {b.relatedSlug && (
                        <Link
                          href={`/brokers/${b.relatedSlug}`}
                          title={`${b.name} full review`}
                          className="font-mono uppercase tracking-[0.1em] text-signal transition-colors hover:text-signal-strong"
                        >
                          Full review →
                        </Link>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        );
      })}
    </div>
  );
}
