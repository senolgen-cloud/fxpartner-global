"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

// Static gradient-and-dots graphic shown before the canvas mounts, and
// permanently for prefers-reduced-motion — keeps the hero's first paint
// (headline, CTAs) free of any WebGL cost.
function StaticFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden rounded-full"
      style={{
        background:
          "radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--signal) 35%, transparent), transparent 60%), radial-gradient(circle at 65% 70%, color-mix(in srgb, var(--gold) 22%, transparent), transparent 55%), var(--ink-soft)",
      }}
    >
      <div className="absolute inset-6 rounded-full border border-signal/25" />
      <div className="absolute inset-14 rounded-full border border-signal/15" />
      <div className="absolute inset-24 rounded-full border border-gold/20" />
    </div>
  );
}

export default function Hero3DGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldMount(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="relative aspect-square w-full max-w-[480px]">
      {shouldMount && !reducedMotion ? <GlobeScene /> : <StaticFallback />}
    </div>
  );
}
