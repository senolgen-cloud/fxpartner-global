"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { whyFxPartnerCards, type WhyCard } from "@/data/partnerProgram";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons: Record<WhyCard["key"], ReactNode> = {
  shield: (
    <svg {...iconProps} className="h-7 w-7">
      <path d="M12 3l7 3v5c0 4.6-3 8.4-7 9.9-4-1.5-7-5.3-7-9.9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  rocket: (
    <svg {...iconProps} className="h-7 w-7">
      <path d="M12 2c2.5 2 4 5.2 4 8.5 0 2-.6 3.7-1.4 5.1L12 18l-2.6-2.4C8.6 14.2 8 12.5 8 10.5 8 7.2 9.5 4 12 2z" />
      <circle cx="12" cy="9.5" r="1.6" />
      <path d="M9 15.5l-2 3.5 3.5-1.2M15 15.5l2 3.5-3.5-1.2" />
    </svg>
  ),
  graph: (
    <svg {...iconProps} className="h-7 w-7">
      <path d="M4 19V9M9.5 19v-5M15 19V6M20 19v-9" />
      <path d="M4 19h16" />
    </svg>
  ),
  network: (
    <svg {...iconProps} className="h-7 w-7">
      <circle cx="6" cy="7" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M7.6 8.4L10.6 16M16.4 8.4L13.4 16M8 7h8" />
    </svg>
  ),
  diamond: (
    <svg {...iconProps} className="h-7 w-7">
      <path d="M7 3h10l4 5-11 13L5 8l2-5z" />
      <path d="M5 8h14M9 3l3 5 3-5M12 8l-2.5 13M12 8l2.5 13" />
    </svg>
  ),
};

export default function WhyFxPartner() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {whyFxPartnerCards.map((card, i) => (
        <div
          key={card.key}
          className="rounded-2xl border border-hairline-light bg-paper-high p-6"
        >
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-signal/10 text-signal"
            style={{ transformStyle: "preserve-3d" }}
            animate={
              reducedMotion ? undefined : { rotateY: [0, 18, 0, -18, 0] }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {icons[card.key]}
          </motion.div>
          <h3 className="mt-4 font-poppins text-base font-semibold text-text-dark">
            {card.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {card.body}
          </p>
        </div>
      ))}
    </div>
  );
}
