"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
  eager = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /**
   * Above the fold, where waiting for JavaScript is not an option.
   *
   * The default path starts at opacity 0 and only becomes visible when an
   * IntersectionObserver in an effect adds `is-visible` — which means the
   * element is blank until the client bundle has downloaded, parsed and
   * hydrated. For a section below the fold that is exactly right. For the
   * hero it meant the headline, the buttons and the account strip did not
   * exist for the reader (or for a Largest Contentful Paint measurement)
   * until then.
   *
   * `eager` renders `.reveal-eager` instead: the same entrance, run as a
   * plain CSS animation that starts on first paint and needs no observer
   * and no JavaScript at all.
   */
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      className={`${eager ? "reveal-eager" : "reveal"} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
