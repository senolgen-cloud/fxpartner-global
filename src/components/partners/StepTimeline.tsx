"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { partnerSteps } from "@/data/partnerProgram";

gsap.registerPlugin(ScrollTrigger);

export default function StepTimeline() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      if (lineRef.current) lineRef.current.style.transform = "scaleY(1)";
      return;
    }

    const ctx = gsap.context(() => {
      if (lineRef.current && containerRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 65%",
              end: "bottom 75%",
              scrub: true,
            },
          }
        );
      }

      stepRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto max-w-2xl">
      <div
        aria-hidden="true"
        className="absolute left-[15px] top-2 bottom-2 w-px bg-hairline-light sm:left-[19px]"
      >
        <div
          ref={lineRef}
          className="h-full w-full origin-top bg-signal"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <div className="space-y-12">
        {partnerSteps.map((step, i) => (
          <div
            key={step.title}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="relative pl-12 sm:pl-16"
          >
            <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-signal bg-paper-high font-mono text-xs font-semibold text-signal sm:h-10 sm:w-10">
              {i + 1}
            </div>
            <h3 className="font-poppins text-lg font-semibold text-text-dark">
              {step.title}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
