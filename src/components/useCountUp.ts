"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a figure up from zero once it scrolls into view.
 *
 * Lifted out of SignalsBoard so the member panel animates its numbers the
 * same way the live board does. A second implementation would have drifted
 * from this one within a month, and two different easings on the same site
 * is the kind of difference nobody can name but everybody notices.
 *
 * `locale` defaults to en-US, which is what the original did — SignalsBoard's
 * behaviour is unchanged by the move. Callers that want the reader's own
 * grouping pass their locale in.
 */
export function useCountUp(
  target: number,
  durationMs = 1400,
  decimals = 0,
  locale = "en-US"
) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Someone who asked their system for less motion gets the number, not the
    // count. Checked here rather than in CSS because the value itself is what
    // animates, and a media query cannot stop a state update.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  useEffect(() => {
    if (!started) return;
    // setTimeout instead of requestAnimationFrame — rAF is paused by the
    // browser while the tab is backgrounded/not compositing, which would
    // leave the counter stuck at 0 indefinitely; setTimeout keeps firing
    // (just throttled) so the count always reaches its target.
    let timer: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const from = 0;
    function tick() {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) timer = setTimeout(tick, 16);
    }
    tick();
    return () => clearTimeout(timer);
  }, [started, target, durationMs]);

  const display =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString(locale);
  return { ref, display };
}
