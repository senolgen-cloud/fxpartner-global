"use client";
import { useTr, useTrf } from "@/components/useTr";

import { useMemo, useState } from "react";
import Link from "@/components/LocaleLink";
import { lookupBrokers, type LookupVerdict } from "@/data/brokerLookup";

const VERDICT_META: Record<
  LookupVerdict,
  { label: string; badgeClass: string; icon: string }
> = {
  verified: {
    label: "Doğrulanmış / Düzenlenmiş",
    badgeClass: "border-tick-up/30 bg-tick-up/10 text-tick-up",
    icon: "✓",
  },
  caution: {
    label: "Dikkat",
    badgeClass: "border-gold/30 bg-gold/10 text-gold",
    icon: "!",
  },
  "high-risk": {
    label: "Yüksek Risk — Kaçının",
    badgeClass: "border-alert/30 bg-alert/10 text-alert",
    icon: "✕",
  },
};

export default function BrokerLookupSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const tr = useTr();
  const trf = useTrf();
  const [query, setQuery] = useState(initialQuery);

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
          placeholder={tr("Bir aracı kurum adı yazın (örn. XM, Octa, Trade360...)")}
          className="w-full rounded-2xl border border-hairline-light bg-paper-high px-5 py-4 text-base text-text-dark placeholder:text-text-muted focus:border-signal focus:outline-none"
          autoComplete="off"
        />
      </div>

      {query.trim() === "" && (
        <p className="mt-4 text-sm text-text-muted">
          {trf("Aranabilir veritabanımızda {count} aracı kurum var. Aramak için yukarıya bir isim yazmaya başlayın.", {
            count: lookupBrokers.length,
          })}
        </p>
      )}

      {query.trim() !== "" && results.length === 0 && (
        <div className="mt-6 rounded-2xl border border-hairline-light bg-paper p-6">
          <p className="text-[15px] leading-relaxed text-text-dark/90">
            <strong className="text-text-dark">
              &ldquo;{query}&rdquo; henüz veritabanımızda yok.
            </strong>{" "}
            {tr("Bu, güvenilir olduğu anlamına gelmez — henüz araştırmadığımız anlamına gelir. Hesap açmadan önce şunları kontrol edin:")}
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex gap-3 text-[15px] text-text-dark/90">
              <span className="mt-1 text-signal">–</span>
              {tr("Gerçekten lisanslı olduğunu teyit etmek için aracı kurumun adını kendi ülkenizin düzenleyici web sitesinde (veya FCA, ASIC, CySEC'te) arayın.")}
            </li>
            <li className="flex gap-3 text-[15px] text-text-dark/90">
              <span className="mt-1 text-signal">–</span>
              Tekrarlayan şikayet örüntülerini kontrol etmek için aracı
              kurumun adını &ldquo;scam&rdquo; veya &ldquo;withdrawal&rdquo;
              kelimeleriyle birlikte bağımsız inceleme sitelerinde arayın.
            </li>
            <li className="flex gap-3 text-[15px] text-text-dark/90">
              <span className="mt-1 text-signal">–</span>
              &ldquo;Garantili getiri&rdquo; veya &ldquo;risksiz işlem&rdquo;
              gibi vaatler her zaman kırmızı bayraktır.
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
                    Kaynak: {b.source}
                  </span>
                </div>
                {b.relatedSlug && (
                  <Link
                    href={`/brokers/${b.relatedSlug}`}
                    title={`${b.name} tam incelemesi`}
                    className="mt-3 inline-block font-mono text-xs uppercase tracking-[0.15em] text-signal transition-colors hover:text-signal-strong"
                  >
                    {tr("Tam incelemeyi gör →")}
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
