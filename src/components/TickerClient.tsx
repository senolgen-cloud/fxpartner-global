"use client";

import { useEffect, useRef } from "react";
import { useScrollIdle } from "@/components/useScrollIdle";
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
  const scrolling = useScrollIdle();
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
      // Collapsed rather than faded: fading would leave the 33px it
      // occupies behind, and the point is to hand that back. Height and
      // opacity move together so the bottom nav slides down with it.
      aria-hidden={scrolling || undefined}
      className={`overflow-hidden border-y border-hairline bg-ink-soft transition-[max-height,opacity,padding] duration-200 ease-out ${
        scrolling
          ? "max-h-0 border-y-0 py-0 opacity-0"
          : "max-h-20 py-2 opacity-100 md:py-2.5"
      } motion-reduce:transition-none`}
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
