"use client";

import { useEffect, useRef } from "react";

// A soft light that follows the cursor across the hero section, layered on
// top of the ambient drifting glow blobs — the section reacts to the
// visitor rather than just animating at them.
export default function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    function onMove(e: MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el!.style.setProperty("--spot-x", `${x}%`);
      el!.style.setProperty("--spot-y", `${y}%`);
      el!.style.opacity = "1";
    }

    function onLeave() {
      el!.style.opacity = "0";
    }

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
    />
  );
}
