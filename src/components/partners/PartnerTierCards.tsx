"use client";
import { useLocalizedData } from "@/components/useLocalizedData";
import { useTrf } from "@/components/useTr";

import { motion } from "framer-motion";
import TiltWrapper from "@/components/TiltWrapper";
import { partnerTiers } from "@/data/partnerProgram";

export default function PartnerTierCards() {
  const partnerTiersTr = useLocalizedData(partnerTiers);
  const trf = useTrf();
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {partnerTiersTr.map((tier, i) => {
          const isPremium = i >= 3;

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <TiltWrapper>
                <div
                  className={`featured-card-depth h-full rounded-2xl border bg-paper-high p-6 ${
                    isPremium ? "border-gold/30" : "border-hairline-light"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-poppins text-xl font-bold ${
                        isPremium ? "text-gold" : "text-text-dark"
                      }`}
                    >
                      {tier.name}
                    </h3>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-[0.15em] ${
                        isPremium ? "text-gold" : "text-signal"
                      }`}
                    >
                      {trf("{count}+ müşteri", { count: tier.minReferred })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-text-muted">
                    {tier.revShareLabel}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-hairline-light pt-4">
                    {tier.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2 text-sm leading-relaxed text-text-muted"
                      >
                        <span
                          className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                            isPremium ? "bg-gold" : "bg-signal"
                          }`}
                          aria-hidden="true"
                        />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltWrapper>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-8 text-xs leading-relaxed text-text-muted">
        Örnek seviye yapısı — nihai referans eşikleri ve gelir paylaşım
        oranları, partner olarak onaylandıktan sonra aracı kurum
        anlaşmasına göre belirlenir.
      </p>
    </div>
  );
}
