"use client";

import { useEffect, useRef, useState } from "react";
import type { tradeSignals, TradeSignalOutcome } from "@/db/schema";

type Signal = typeof tradeSignals.$inferSelect;
type SignalJson = Omit<Signal, "createdAt" | "closedAt"> & {
  createdAt: string;
  closedAt: string | null;
};

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";
const POLL_MS = 15000;

function toSignal(s: SignalJson): Signal {
  return { ...s, createdAt: new Date(s.createdAt), closedAt: s.closedAt ? new Date(s.closedAt) : null };
}

function outcomeColor(outcome: TradeSignalOutcome | null) {
  if (outcome === "WIN") return TICK_UP;
  if (outcome === "LOSS") return TICK_DOWN;
  return "var(--text-on-ink-muted)";
}

function Level({ label, value, color }: { label: string; value: string | null; color: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-text-on-ink-muted">{label}</span>
      <span className="font-mono font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function LevelPair({ target1, stop }: { target1: string | null; stop: string | null }) {
  if (!target1 && !stop) return <span className="text-text-on-ink-muted">—</span>;
  return (
    <span className="font-mono">
      {stop ? <span style={{ color: TICK_DOWN }}>{stop}</span> : <span className="text-text-on-ink-muted">—</span>}
      <span className="text-text-on-ink-muted"> / </span>
      {target1 ? <span style={{ color: TICK_UP }}>{target1}</span> : <span className="text-text-on-ink-muted">—</span>}
    </span>
  );
}

function SignalTable({ title, signals, closedView }: { title: string; signals: Signal[]; closedView?: boolean }) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-hairline bg-ink-soft md:block">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-text-on-ink">{title}</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal">
          <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          Live
        </span>
      </div>
      {signals.length === 0 ? (
        <p className="px-6 py-8 text-sm text-text-on-ink-muted">Nothing to show yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Pair</th>
                <th className="px-4 py-3 font-medium">Direction</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">{closedView ? "Close" : "SL / TP"}</th>
                <th className="px-4 py-3 font-medium">Lot</th>
                <th className="px-6 py-3 text-right font-medium">{closedView ? "Result" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => {
                const isSell = s.direction === "SELL";
                const directionColor = isSell ? TICK_DOWN : TICK_UP;
                const resultLine = s.pips
                  ? `${parseFloat(s.pips) > 0 ? "+" : ""}${s.pips} pips`
                  : s.profit
                    ? `${parseFloat(s.profit) > 0 ? "+" : ""}${s.profit} USD`
                    : null;
                return (
                  <tr key={s.id} className="border-b border-hairline last:border-0">
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-text-on-ink-muted">
                      {(closedView ? s.closedAt : s.createdAt)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-display font-semibold text-text-on-ink">
                      {s.pair}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {s.direction ? (
                        <span
                          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          style={{ borderColor: directionColor, color: directionColor }}
                        >
                          {s.direction}
                        </span>
                      ) : (
                        <span className="text-text-on-ink-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-text-on-ink">{s.entry}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {closedView ? (
                        <span className="font-mono text-text-on-ink">{s.closePrice ?? "—"}</span>
                      ) : (
                        <LevelPair target1={s.target1} stop={s.stop} />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-text-on-ink-muted">
                      {s.volume ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      {closedView ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold text-on-signal"
                          style={{ background: outcomeColor(s.outcome) }}
                        >
                          {resultLine ?? s.outcome ?? "CLOSED"}
                        </span>
                      ) : (
                        <span className="rounded-full border border-signal px-2.5 py-1 text-xs font-semibold text-signal">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const isBuy = signal.direction === "BUY";
  const isSell = signal.direction === "SELL";
  const directionColor = isSell ? TICK_DOWN : TICK_UP;
  const isClosed = signal.status === "closed";

  const resultLine = signal.pips
    ? `${parseFloat(signal.pips) > 0 ? "+" : ""}${signal.pips} pips`
    : signal.profit
      ? `${parseFloat(signal.profit) > 0 ? "+" : ""}${signal.profit} USD`
      : null;

  return (
    <div className="rounded-2xl border border-hairline bg-ink-soft p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-text-on-ink">{signal.pair}</span>
          {(isBuy || isSell) && (
            <span
              className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              style={{ borderColor: directionColor, color: directionColor }}
            >
              {signal.direction}
            </span>
          )}
        </div>
        {isClosed ? (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-on-signal"
            style={{ background: outcomeColor(signal.outcome) }}
          >
            {signal.outcome ?? "CLOSED"}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal">
            <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            Live
          </span>
        )}
      </div>

      {resultLine && (
        <p className="mt-2 font-mono text-sm font-semibold" style={{ color: outcomeColor(signal.outcome) }}>
          {resultLine}
        </p>
      )}

      <div className="mt-4 space-y-1.5 border-t border-hairline pt-4">
        <Level label="Entry" value={signal.entry} color="var(--text-on-ink)" />
        <Level label="Take Profit" value={signal.target1} color={TICK_UP} />
        {signal.target2 && <Level label="Take Profit 2" value={signal.target2} color={TICK_UP} />}
        <Level label="Stop Loss" value={signal.stop} color={TICK_DOWN} />
        {isClosed && <Level label="Close" value={signal.closePrice} color="var(--text-on-ink)" />}
        {signal.volume && <Level label="Volume" value={`${signal.volume} lot`} color="var(--text-on-ink-muted)" />}
      </div>

      <p className="mt-4 font-mono text-[11px] text-text-on-ink-muted">
        {(isClosed ? signal.closedAt : signal.createdAt)?.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })}
      </p>
    </div>
  );
}

export default function SignalsBoard({
  initialActive,
  initialClosed,
}: {
  initialActive: Signal[];
  initialClosed: Signal[];
}) {
  const [active, setActive] = useState(initialActive);
  const [closed, setClosed] = useState(initialClosed);
  const knownIds = useRef(new Set([...initialActive, ...initialClosed].map((s) => s.id)));

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/signals", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data: { active: SignalJson[]; closed: SignalJson[] } = await res.json();
        if (cancelled) return;
        setActive(data.active.map(toSignal));
        setClosed(data.closed.map(toSignal));
        for (const s of [...data.active, ...data.closed]) knownIds.current.add(s.id);
      } catch {
        // Transient fetch failure — next poll tick will retry.
      }
    }

    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Only WIN/LOSS count toward the win rate — a breakeven close is neither.
  const decisive = closed.filter((s) => s.outcome === "WIN" || s.outcome === "LOSS");
  const wins = decisive.filter((s) => s.outcome === "WIN").length;
  const winRate = decisive.length > 0 ? Math.round((wins / decisive.length) * 100) : null;

  return (
    <>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Live Signals</span>
          <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Real-Time Trading Signals</h1>
          <p className="mt-4 max-w-2xl text-text-on-ink-muted">
            Every signal below comes straight from our tracked MT5 account through an automated EA — the same
            entries posted to our Telegram channel and X, with a real, verified result once each trade closes.
            Nothing here is simulated or backfilled.
          </p>

          <div className="mt-10 flex flex-wrap gap-10">
            <div>
              <div className="font-display text-3xl font-semibold">{active.length}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                Active Signals
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold">{decisive.length}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                Closed Trades
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold">{winRate !== null ? `${winRate}%` : "—"}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                Win Rate{decisive.length > 0 && decisive.length < 10 ? " (early data)" : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold md:hidden">Active Signals</h2>
        <SignalTable title="Active Signals" signals={active} />
        {active.length === 0 ? (
          <p className="mt-4 text-text-on-ink-muted md:hidden">
            No open signals right now — check our{" "}
            <a href="https://t.me/fxpartnerglobal" className="text-signal hover:text-signal-strong">
              Telegram channel
            </a>{" "}
            to get the next one the moment it's posted.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:hidden lg:grid-cols-3">
            {active.map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold md:hidden">Recently Closed</h2>
          <SignalTable title="Recently Closed" signals={closed} closedView />
          {closed.length === 0 ? (
            <p className="mt-4 text-text-on-ink-muted md:hidden">
              No closed signals yet — results will appear here as trades close.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 md:hidden lg:grid-cols-3">
              {closed.map((s) => (
                <SignalCard key={s.id} signal={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
