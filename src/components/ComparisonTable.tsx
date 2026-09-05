"use client";
import { useTr, useTrf } from "@/components/useTr";

import React, { useState } from "react";
import Link from "@/components/LocaleLink";
import {
  brokers,
  brokerCategories,
  categoryInfo,
  getBrokerScores,
  type BrokerCategory,
} from "@/data/brokers";
import { COMPARISON_CRITERIA } from "@/lib/comparisonCriteria";

// The Turkish name for each column. COMPARISON_CRITERIA itself stays in
// English and stays the source of truth for how many criteria the table
// covers (page.tsx counts its length), so this maps rather than renames.
// Plain data at module scope — the tr() call happens at render, which is
// what check-module-scope-tr.mjs requires.
const CRITERION_LABEL: Record<(typeof COMPARISON_CRITERIA)[number], string> = {
  Index: "Endeks",
  Rating: "Puan",
  "Min. Deposit": "Min. Depozit",
  "Max. Leverage": "Maks. Kaldıraç",
  Regulation: "Regülasyon",
  Platform: "Platform",
};

export default function ComparisonTable() {
  const tr = useTr();
  const trf = useTrf();
  const [activeCategory, setActiveCategory] = useState<BrokerCategory | "All">(
    "All"
  );
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filtered =
    activeCategory === "All"
      ? brokers
      : brokers.filter((b) => b.categories.includes(activeCategory));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["All", ...brokerCategories] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              activeCategory === cat
                ? "border-signal bg-signal/15 text-signal"
                : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
            }`}
          >
            {cat === "All" ? tr("Tümü") : tr(categoryInfo[cat].label)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-hairline">
        <table className="w-full min-w-[840px] border-collapse text-start">
          <thead>
            <tr className="border-b border-hairline bg-ink-soft">
              <th className="px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] text-text-on-ink-muted">
                Broker
              </th>
              {COMPARISON_CRITERIA.map((label) => (
                <th
                  key={label}
                  className={`px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.15em] ${
                    label === "Index" ? "text-gold" : "text-text-on-ink-muted"
                  }`}
                >
                  {tr(CRITERION_LABEL[label])}
                </th>
              ))}
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, i) => {
              const isExpanded = expandedSlug === b.slug;
              return (
                <React.Fragment key={b.slug}>
                  <tr
                    className={`border-b border-hairline last:border-b-0 ${
                      i % 2 === 0 ? "bg-ink" : "bg-ink-soft"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-signal">
                          {String(b.rank).padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSlug(isExpanded ? null : b.slug)
                          }
                          className="notranslate flex items-center gap-1.5 font-display text-base font-medium text-text-on-ink"
                        >
                          {b.name}
                          <span
                            aria-hidden="true"
                            className={`font-mono text-[10px] text-text-on-ink-muted transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          >
                            ▾
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="tabular-stat px-5 py-4 font-mono text-sm font-semibold text-gold">
                      {getBrokerScores(b).composite.toFixed(1)}
                    </td>
                    <td className="tabular-stat px-5 py-4 font-mono text-sm text-text-on-ink">
                      {b.rating.toFixed(1)}
                    </td>
                    <td className="tabular-stat px-5 py-4 font-mono text-sm text-text-on-ink">
                      {b.minDeposit}
                    </td>
                    <td className="tabular-stat px-5 py-4 font-mono text-sm text-text-on-ink">
                      {b.maxLeverage}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-text-on-ink-muted">
                      {b.regulators[0]}
                      {b.regulators.length > 1
                        ? ` +${b.regulators.length - 1}`
                        : ""}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-text-on-ink-muted">
                      {b.platforms.join(" / ")}
                    </td>
                    <td className="px-5 py-4 text-end">
                      <Link
                        href={`/brokers/${b.slug}`}
                        title={trf("{broker} tam inceleme", { broker: b.name })}
                        className="font-mono text-xs text-signal transition-colors hover:text-text-on-ink"
                      >
                        {tr("Görüntüle →")}
                      </Link>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr
                      key={`${b.slug}-detail`}
                      className={`border-b border-hairline last:border-b-0 ${
                        i % 2 === 0 ? "bg-ink" : "bg-ink-soft"
                      }`}
                    >
                      <td colSpan={8} className="px-5 pb-6 pt-1">
                        <div className="grid gap-4 rounded-xl border border-hairline bg-ink-soft/60 p-5 sm:grid-cols-2">
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-signal">
                              {tr("Güçlü Yönler")}
                            </p>
                            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-text-on-ink-muted">
                              {b.pros.map((pro) => (
                                <li key={pro}>+ {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                              {tr("Ödünleşimler")}
                            </p>
                            <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-text-on-ink-muted">
                              {b.cons.map((con) => (
                                <li key={con}>− {con}</li>
                              ))}
                            </ul>
                          </div>
                          <p className="sm:col-span-2 font-mono text-xs text-text-on-ink-muted">
                            {tr("En iyi:")} {b.bestFor}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
