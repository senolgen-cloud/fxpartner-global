"use client";

import { useMemo, useState } from "react";
import { brokerCategories, type Broker } from "@/data/brokers";
import BrokerCard from "./BrokerCard";

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
              ? "border-text-dark bg-text-dark text-paper-high"
              : "border-hairline-light text-text-muted hover:border-text-dark hover:text-text-dark"
          }`}
        >
          Tümü
        </button>
        {brokerCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              active === category
                ? "border-text-dark bg-text-dark text-paper-high"
                : "border-hairline-light text-text-muted hover:border-text-dark hover:text-text-dark"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="py-10 text-sm text-text-muted">
            Bu kategoride henüz broker bulunmuyor.
          </p>
        ) : (
          filtered.map((broker) => <BrokerCard key={broker.slug} broker={broker} />)
        )}
      </div>
    </div>
  );
}
