"use client";

import { useMemo, useState } from "react";
import { brokerCategories, categoryInfo, type Broker } from "@/data/brokers";
import RankedBrokerCard from "./RankedBrokerCard";
import type { BrokerReviewStats } from "@/lib/brokerReviews";

export default function BrokerList({
  brokers,
  reviewStats,
}: {
  brokers: Broker[];
  reviewStats?: Record<string, BrokerReviewStats>;
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      active ? brokers.filter((b) => b.categories.includes(active)) : brokers,
    [brokers, active]
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            active === null
              ? "border-text-on-ink bg-text-on-ink text-ink"
              : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
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
                ? "border-text-on-ink bg-text-on-ink text-ink"
                : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
            }`}
          >
            {categoryInfo[category].label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {filtered.length === 0 ? (
          <p className="py-10 text-sm text-text-on-ink-muted">
            Bu kategoride henüz broker yok.
          </p>
        ) : (
          filtered.map((broker, i) => (
            <RankedBrokerCard
              key={broker.slug}
              broker={broker}
              featured={active === null && i === 0}
              reviewStats={reviewStats?.[broker.slug]}
            />
          ))
        )}
      </div>
    </div>
  );
}
