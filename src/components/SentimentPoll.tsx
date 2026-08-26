"use client";
import { useTr } from "@/components/useTr";

import { useEffect, useState } from "react";

type Counts = Record<string, { bullish: number; bearish: number }>;
type Votes = Record<string, "bullish" | "bearish" | null>;

const PAIR_LABELS: Record<string, string> = {
  EURUSD: "EUR/USD",
  XAUUSD: "Altın (XAU/USD)",
};

function Bar({ pair, counts, myVote, onVote, busy }: {
  pair: string;
  counts: { bullish: number; bearish: number };
  myVote: "bullish" | "bearish" | null;
  onVote: (pair: string, vote: "bullish" | "bearish") => void;
  busy: boolean;
}) {
  const tr = useTr();
  const total = counts.bullish + counts.bearish;
  const bullishPct = total > 0 ? Math.round((counts.bullish / total) * 100) : 0;
  const bearishPct = total > 0 ? 100 - bullishPct : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="notranslate font-medium text-text-on-ink">{PAIR_LABELS[pair] ?? pair}</span>
        <span className="font-mono text-xs text-text-on-ink-muted">
          {total > 0 ? `${total} oy` : "Henüz oy yok"}
        </span>
      </div>

      {total > 0 && (
        <>
          <div className="mt-2 flex items-center justify-between font-mono text-xs">
            <span className="text-tick-up">Yükseliş (Bullish) {bullishPct}%</span>
            <span className="text-tick-down">Düşüş (Bearish) {bearishPct}%</span>
          </div>
          <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-ink">
            <div className="bg-tick-up" style={{ width: `${bullishPct}%` }} />
            <div className="bg-tick-down" style={{ width: `${bearishPct}%` }} />
          </div>
        </>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onVote(pair, "bullish")}
          className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
            myVote === "bullish"
              ? "border-tick-up bg-tick-up/15 text-tick-up"
              : "border-hairline text-text-on-ink-muted hover:border-tick-up hover:text-tick-up"
          }`}
        >
          {tr("↗ Yükseliş")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onVote(pair, "bearish")}
          className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
            myVote === "bearish"
              ? "border-tick-down bg-tick-down/15 text-tick-down"
              : "border-hairline text-text-on-ink-muted hover:border-tick-down hover:text-tick-down"
          }`}
        >
          {tr("↘ Düşüş")}
        </button>
      </div>
    </div>
  );
}

export default function SentimentPoll() {
  const tr = useTr();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [myVotes, setMyVotes] = useState<Votes>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/community/sentiment")
      .then((r) => r.json())
      .then((data) => {
        setCounts(data.counts);
        setMyVotes(data.myVotes ?? {});
      })
      .catch(() => setCounts({}));
  }, []);

  async function vote(pair: string, choice: "bullish" | "bearish") {
    setBusy(true);
    setMyVotes((prev) => ({ ...prev, [pair]: choice }));
    try {
      const res = await fetch("/api/community/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pair, vote: choice }),
      });
      const data = await res.json();
      if (res.ok) setCounts(data.counts);
    } finally {
      setBusy(false);
    }
  }

  if (!counts) {
    return <div className="animate-pulse text-xs text-text-on-ink-muted">{tr("Yükleniyor…")}</div>;
  }

  return (
    <div className="space-y-5">
      {Object.keys(counts).map((pair) => (
        <Bar key={pair} pair={pair} counts={counts[pair]} myVote={myVotes[pair] ?? null} onVote={vote} busy={busy} />
      ))}
    </div>
  );
}
