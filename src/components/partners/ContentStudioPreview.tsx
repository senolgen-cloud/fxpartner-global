"use client";
import { useLocalizedData } from "@/components/useLocalizedData";
import { useTr } from "@/components/useTr";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import {
  contentStudioPrompt,
  contentStudioSamples,
} from "@/data/partnerProgram";

export default function ContentStudioPreview() {
  // The typing animation walks this string character by character, so it has
  // to be the translated one from the start — swapping mid-animation would
  // restart the typing at a different length.
  const tr = useTr();
  const prompt = useLocalizedData(contentStudioPrompt);
  const samples = useLocalizedData(contentStudioSamples);
  const reducedMotion = usePrefersReducedMotion();
  const [started, setStarted] = useState(false);
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!started || reducedMotion) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(prompt.slice(0, i));
      if (i >= prompt.length) {
        clearInterval(interval);
        setTimeout(() => setShowResults(true), 500);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [started, reducedMotion, prompt]);

  const displayedPrompt = reducedMotion ? prompt : typed;
  const resultsVisible = reducedMotion ? started : showResults;

  return (
    <motion.div
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, amount: 0.5 }}
      className="rounded-3xl border border-hairline-light bg-ink p-6 text-text-on-ink md:p-8"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
        {tr("Partner İçerik Stüdyosu · Önizleme")}
      </p>
      <div className="mt-4 rounded-xl border border-hairline bg-ink-soft px-4 py-3 font-mono text-sm text-text-on-ink">
        <span className="text-text-on-ink-muted">{"> "}</span>
        {displayedPrompt}
        <span aria-hidden="true" className="animate-pulse">
          |
        </span>
      </div>

      {!resultsVisible && started && (
        <div className="mt-6 flex items-center gap-2 font-mono text-xs text-text-on-ink-muted">
          <span
            aria-hidden="true"
            className="signal-dot h-1.5 w-1.5 rounded-full bg-signal"
          />
          {tr("Oluşturuluyor...")}
        </div>
      )}

      {resultsVisible && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {samples.map((sample, i) => (
            <motion.div
              key={sample.channel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="rounded-xl border border-hairline bg-ink-soft p-4"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
                {sample.channel}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-text-on-ink-muted">
                {sample.preview}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-text-on-ink-muted">
        {tr("Sadece önizleme — partner içerik kütüphanesinde sunulan bir özelliği gösterir, canlı bir üretici değildir.")}
      </p>
    </motion.div>
  );
}
