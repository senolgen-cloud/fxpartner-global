"use client";

import { useEffect, useState } from "react";

/**
 * One interruption at a time.
 *
 * Every sheet on this site anchors to the bottom edge, so two of them
 * wanting the screen at once do not sit side by side the way the old
 * corner toasts did — they overlap. A phone never stacks two system
 * prompts either; it queues them, and the reader answers one thing before
 * being asked the next.
 *
 * Highest priority holds the slot. Among equals the first to ask keeps it,
 * so a nudge already on screen is not yanked away mid-read by one that
 * happened to become ready a moment later. When the holder releases —
 * dismissed, answered, or unmounted — the next waiting claimant takes over
 * on the same render pass.
 */

export const PRIORITY = {
  /** Must be answered before anything else may ask for attention. */
  consent: 100,
  /** Offers and campaigns: interrupt the page, but yield to consent. */
  offer: 50,
  /** Install and permission nudges: the most interruptible thing here. */
  nudge: 10,
} as const;

type Claim = { id: string; priority: number };

let claims: Claim[] = [];
const listeners = new Set<() => void>();

function holderId(): string | null {
  if (claims.length === 0) return null;
  // Stable: the array preserves arrival order, and only a strictly higher
  // priority displaces whoever is already holding.
  return claims.reduce((best, c) => (c.priority > best.priority ? c : best)).id;
}

function notify() {
  for (const l of listeners) l();
}

/**
 * Returns whether this caller currently owns the screen.
 *
 * `wanted` is the component's own opinion about whether it has something
 * to say; the slot decides whether it gets to say it now.
 */
export function useInterruptionSlot(id: string, priority: number, wanted: boolean): boolean {
  const [holder, setHolder] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setHolder(holderId());
    listeners.add(update);

    if (wanted && !claims.some((c) => c.id === id)) {
      claims = [...claims, { id, priority }];
      notify();
    } else if (!wanted && claims.some((c) => c.id === id)) {
      claims = claims.filter((c) => c.id !== id);
      notify();
    }
    update();

    return () => {
      listeners.delete(update);
      // Unmounting is a release: a component that has gone away cannot be
      // holding the screen, and leaving its claim behind would block every
      // other sheet for the rest of the session.
      if (claims.some((c) => c.id === id)) {
        claims = claims.filter((c) => c.id !== id);
        notify();
      }
    };
  }, [id, priority, wanted]);

  return wanted && holder === id;
}
