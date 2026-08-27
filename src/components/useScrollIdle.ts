"use client";

import { useEffect, useState } from "react";

/**
 * True while the page is being scrolled, false once the reader settles.
 *
 * Shared because two things want it and the second one copying the first
 * is how two slightly different scroll handlers end up on one page. The
 * support button uses it to step out from under whatever it is covering;
 * the price ticker uses it to give a phone back the bottom of its screen
 * while someone is reading.
 *
 * The listener is passive: delaying a scroll is the one thing a scroll
 * handler on a phone can genuinely ruin.
 */
export function useScrollIdle(settleMs = 450): boolean {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let settle: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(settle);
      settle = setTimeout(() => setScrolling(false), settleMs);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(settle);
    };
  }, [settleMs]);

  return scrolling;
}
