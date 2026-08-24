"use client";

import { useEffect, useState } from "react";

export type LiveQuote = { bid: string; ask: string };

// Faster than the signal poll (15s): a price is the one thing on the page a
// reader expects to move while they watch it. Still cheap — one small JSON
// document for every instrument at once, not one request per row.
const POLL_MS = 10_000;

// How long a quote we already hold stays usable if polling stops succeeding.
// The route drops anything older than 90s before it ever reaches us; this is
// the same rule applied a second time on this side, because the server can
// only judge freshness at the moment it answers. A tab that loses the network
// would otherwise sit there showing a price frozen at whatever it last heard,
// which is precisely the failure this whole feature was designed to avoid.
const CLIENT_MAX_AGE_MS = 90_000;

type Held = LiveQuote & { expiresAt: number };

/**
 * Live bid/ask per instrument, keyed by the EA's own symbol name — the same
 * string as a signal's `pair`, so a lookup is plain equality.
 *
 * Returns only quotes that are currently fresh. A symbol missing from the
 * result means "we do not know the price right now", which is a normal state:
 * the market is closed, the terminal is restarting, or the EA does not watch
 * that instrument. Callers must render that as nothing, never as zero.
 */
export function useLiveQuotes(enabled = true): Record<string, LiveQuote> {
  const [held, setHeld] = useState<Record<string, Held>>({});

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function tick() {
      // A hidden tab still runs its interval. Polling one is pure waste, but
      // the held quotes must still expire while it is hidden — otherwise
      // coming back to the tab shows a stale price for a moment before the
      // next successful fetch corrects it.
      if (typeof document !== "undefined" && document.hidden) {
        setHeld(prune);
        return;
      }
      try {
        const res = await fetch("/api/live-prices", { cache: "no-store" });
        if (!res.ok || cancelled) {
          setHeld(prune);
          return;
        }
        const data: {
          quotes?: Record<string, { bid: string; ask: string; ageMs: number }>;
        } = await res.json();
        if (cancelled) return;

        const now = Date.now();
        const next: Record<string, Held> = {};
        for (const [symbol, q] of Object.entries(data.quotes ?? {})) {
          // The server sends how old the quote already was when it answered,
          // so the expiry is measured from the tick, not from our clock
          // agreeing with the database's.
          next[symbol] = {
            bid: q.bid,
            ask: q.ask,
            expiresAt: now + Math.max(0, CLIENT_MAX_AGE_MS - q.ageMs),
          };
        }
        setHeld(next);
      } catch {
        // Transient failure. Keep what is still fresh, drop what is not.
        if (!cancelled) setHeld(prune);
      }
    }

    tick();
    const id = setInterval(tick, POLL_MS);

    // Without this, a tab opened in the background sits on an em dash until
    // the next interval happens to land after the reader switches to it —
    // up to a full poll period of staring at "—" on a page whose whole
    // promise is a live number. Coming back into view is exactly the moment
    // the price matters most, so fetch on that edge rather than waiting.
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  const now = Date.now();
  const fresh: Record<string, LiveQuote> = {};
  for (const [symbol, q] of Object.entries(held)) {
    if (q.expiresAt > now) fresh[symbol] = { bid: q.bid, ask: q.ask };
  }
  return fresh;
}

function prune(prev: Record<string, Held>): Record<string, Held> {
  const now = Date.now();
  const next: Record<string, Held> = {};
  let dropped = false;
  for (const [symbol, q] of Object.entries(prev)) {
    if (q.expiresAt > now) next[symbol] = q;
    else dropped = true;
  }
  // Returning prev unchanged when nothing expired keeps this from scheduling
  // a re-render on every idle tick.
  return dropped ? next : prev;
}
