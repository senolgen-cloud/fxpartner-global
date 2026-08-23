"use client";
import { useLocalizedData } from "@/components/useLocalizedData";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { partnerFaqItems } from "@/data/partnerProgram";

export default function PartnerFAQ() {
  const partnerFaqItemsTr = useLocalizedData(partnerFaqItems);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-hairline-light border-t border-b border-hairline-light">
      {partnerFaqItemsTr.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-poppins text-base font-semibold text-text-dark">
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 font-mono text-xl text-signal"
                aria-hidden="true"
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-5 text-sm leading-relaxed text-text-muted">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
