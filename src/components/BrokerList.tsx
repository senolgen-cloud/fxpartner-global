"use client";

import { useMemo, useState } from "react";
import { brokerCategories, type Broker } from "@/data/brokers";
import RankedBrokerCard from "./RankedBrokerCard";

export default function BrokerList({ brokers }: { brokers: Broker[] }) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      active ? brokers.filter((b) => b.categories.includes(active)) : brokers,
    [brokers, active]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            active === null
              ? "border-text-on-ink bg-text-on-ink text-ink"
              : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
          }`}
        >
          All
        </button>
        {brokerCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              active === category
                ? "border-text-on-ink bg-text-on-ink text-ink"
                : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {filtered.length === 0 ? (
          <p className="py-10 text-sm text-text-on-ink-muted">
            No brokers in this category yet.
          </p>
        ) : (
          filtered.map((broker, i) => (
            <RankedBrokerCard
              key={broker.slug}
              broker={broker}
              featured={active === null && i === 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
