"use client";

import { useEffect, useRef } from "react";
import type { TickerPair } from "@/lib/rates";

function TickerRow({ pairs }: { pairs: TickerPair[] }) {
  return (
    <div className="flex shrink-0 items-center gap-8 pe-8">
      {pairs.map((p) => (
        <div key={p.symbol} className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-mono text-xs tracking-wide text-text-on-ink-muted">
            {p.symbol}
          </span>
          <span className="tabular-stat font-mono text-xs text-text-on-ink">{p.value}</span>
          {p.delta && (
            <span
              className={`tabular-stat font-mono text-xs ${
                p.up ? "text-tick-up" : "text-tick-down"
              }`}
            >
              {p.up ? "▲" : "▼"} {p.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// Driven by rAF/transform instead of a CSS animation — same reasoning as
// BrokerHeroSlider: an OS-level "reduce motion" setting would otherwise
// freeze this and fall back to a visible native scrollbar (which read as
// a stray white bar between the ticker and the section below it).
export default function TickerClient({ pairs }: { pairs: TickerPair[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = reduceMotion ? 65 : 110; // px/sec

    let rowWidth = row.getBoundingClientRect().width;
    const onResize = () => {
      rowWidth = row.getBoundingClientRect().width;
    };
    window.addEventListener("resize", onResize);

    let offset = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(tick);

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && rowWidth > 0) {
        offset = (offset + speed * dt) % rowWidth;
        if (track) track.style.transform = `translateX(-${offset}px)`;
      }
      frame = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      className="overflow-hidden border-y border-hairline bg-ink-soft py-2 md:py-2.5"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div ref={trackRef} className="flex w-max">
        <div ref={rowRef}>
          <TickerRow pairs={pairs} />
        </div>
        <div aria-hidden="true">
          <TickerRow pairs={pairs} />
        </div>
      </div>
    </div>
  );
}
