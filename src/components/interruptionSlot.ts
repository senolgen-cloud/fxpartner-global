"use client";

import { useEffect, useState } from "react";

/**
 * One interruption at a time, and not one after another.
 *
 * Every sheet on this site anchors to the bottom edge, so two of them
 * wanting the screen at once do not sit side by side the way the old
 * corner toasts did — they overlap. That is what the slot below solves.
 *
 * Spacing is the other half, and the one the slot alone did not give: a
 * reader could answer the consent sheet, land on a broker page, and be
 * shown the campaign sheet a second and a half later, then a notification
 * nudge, then the newsletter. Each component was individually reasonable
 * and the sequence was not. The rules here are about the visit, not about
 * any one sheet, because that is the level a reader experiences.
 */

// ── The rules ──────────────────────────────────────────────────────────

/** Nothing asks for anything in the opening seconds of a visit. Someone
 *  who has just arrived has not seen the site yet, and an offer before
 *  that is a guess about a person we know nothing about. */
const MIN_VISIT_MS = 30_000;

/** And nothing asks the instant a new page opens, however long the visit
 *  has been. Landing on a page and being interrupted while the first
 *  screen is still being read is the thing that feels like an ambush. */
const MIN_PAGE_MS = 8_000;

/** Quiet time after one interruption before another may appear. Measured
 *  from when the screen came free, not from when the sheet opened, so
 *  reading a long one does not shorten the gap after it. */
const COOLDOWN_MS = 5 * 60_000;

/** Per visit, excluding consent. Two is a nudge; four is a site that
 *  wants something every time you look at it. */
const MAX_PER_VISIT = 2;

export const PRIORITY = {
  /** Must be answered before anything else may ask. Exempt from every
   *  rule above: it is a legal question, not a marketing one, and holding
   *  it back would leave the cookies it governs in limbo. */
  consent: 100,
  /** Offers and campaigns: interrupt the page, but yield to consent. */
  offer: 50,
  /** Install and permission nudges: the most interruptible thing here. */
  nudge: 10,
} as const;

// ── Visit bookkeeping ──────────────────────────────────────────────────

const VISIT_START_KEY = "fxpartner-visit-started";
const LAST_SHOWN_KEY = "fxpartner-interruption-last";
const COUNT_KEY = "fxpartner-interruption-count";

const pageLoadedAt = Date.now();

/** Storage is allowed to throw — private mode, blocked site data — and an
 *  interruption policy is never a good enough reason to break a page. */
function read(store: Storage, key: string): number {
  try {
    return Number(store.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

function write(store: Storage, key: string, value: number) {
  try {
    store.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

function visitStartedAt(): number {
  if (typeof window === "undefined") return pageLoadedAt;
  const stored = read(sessionStorage, VISIT_START_KEY);
  if (stored) return stored;
  write(sessionStorage, VISIT_START_KEY, pageLoadedAt);
  return pageLoadedAt;
}

/** Milliseconds until the rules would allow an interruption; 0 if now. */
function waitFor(priority: number): number {
  if (typeof window === "undefined") return Number.POSITIVE_INFINITY;
  if (priority >= PRIORITY.consent) return 0;

  if (read(sessionStorage, COUNT_KEY) >= MAX_PER_VISIT) {
    return Number.POSITIVE_INFINITY;
  }

  const now = Date.now();
  const lastShown = read(localStorage, LAST_SHOWN_KEY);
  return Math.max(
    0,
    visitStartedAt() + MIN_VISIT_MS - now,
    pageLoadedAt + MIN_PAGE_MS - now,
    lastShown ? lastShown + COOLDOWN_MS - now : 0
  );
}

function recordShown() {
  write(localStorage, LAST_SHOWN_KEY, Date.now());
  write(sessionStorage, COUNT_KEY, read(sessionStorage, COUNT_KEY) + 1);
}

/** The cooldown runs from here, so a sheet left open for four minutes is
 *  not followed by another one a minute after it closes. */
function recordReleased() {
  write(localStorage, LAST_SHOWN_KEY, Date.now());
}

// ── The slot ───────────────────────────────────────────────────────────

type Claim = { id: string; priority: number };

let claims: Claim[] = [];
const shown = new Set<string>();
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
 * to say; the slot and the rules above decide whether it gets to say it,
 * and when. A component that is not allowed yet is re-checked at the
 * moment it would become allowed rather than being dropped, so a sheet
 * held back by the opening-seconds rule still appears once those seconds
 * have passed.
 */
export function useInterruptionSlot(id: string, priority: number, wanted: boolean): boolean {
  const [holder, setHolder] = useState<string | null>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!wanted) {
      setAllowed(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      // Already on screen: the rules gate appearing, never staying.
      if (shown.has(id)) {
        setAllowed(true);
        return;
      }
      const wait = waitFor(priority);
      if (wait === 0) {
        setAllowed(true);
      } else if (Number.isFinite(wait)) {
        timer = setTimeout(check, wait + 50);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, [id, priority, wanted]);

  const claiming = wanted && allowed;

  useEffect(() => {
    const update = () => setHolder(holderId());
    listeners.add(update);

    if (claiming && !claims.some((c) => c.id === id)) {
      claims = [...claims, { id, priority }];
      notify();
    } else if (!claiming && claims.some((c) => c.id === id)) {
      claims = claims.filter((c) => c.id !== id);
      if (shown.has(id)) recordReleased();
      notify();
    }
    update();

    return () => {
      listeners.delete(update);
      // Unmounting is a release: a component that has gone away cannot be
      // holding the screen, and leaving its claim behind would block every
      // other sheet for the rest of the visit.
      if (claims.some((c) => c.id === id)) {
        claims = claims.filter((c) => c.id !== id);
        if (shown.has(id)) recordReleased();
        notify();
      }
    };
  }, [id, priority, claiming]);

  const owns = claiming && holder === id;

  // Counted once, when it actually reaches the screen — a sheet that
  // waited its turn and never got shown has cost the reader nothing and
  // must not spend their budget.
  useEffect(() => {
    if (!owns || shown.has(id)) return;
    shown.add(id);
    if (priority >= PRIORITY.consent) {
      // Consent does not spend the visit's budget: it is a legal question,
      // not one of ours to spend. The quiet time after it still applies —
      // the reader has just been interrupted either way, and answering a
      // cookie sheet is not an invitation to be asked something else.
      write(localStorage, LAST_SHOWN_KEY, Date.now());
    } else {
      recordShown();
    }
  }, [owns, id, priority]);

  return owns;
}
