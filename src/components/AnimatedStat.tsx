"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedStat({
  value,
  prefix = "",
  suffix = "",
  duration = 1100,
  decimals = 0,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setDisplay(value.toFixed(decimals));
      return;
    }

    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay((eased * value).toFixed(decimals));
              if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, decimals]);

  return (
    <span ref={ref} className={`tabular-stat ${className}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
