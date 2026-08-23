"use client";
import { useTr } from "@/components/useTr";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { calculatorDefaults } from "@/data/partnerProgram";

function AnimatedNumber({
  value,
  prefix = "",
}: {
  value: number;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className="tabular-stat">
      {prefix}
      {display.toLocaleString("en-US")}
    </span>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          {label}
        </label>
        <span className="font-poppins text-lg font-semibold text-text-dark">
          {prefix}
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-hairline-light accent-signal"
      />
    </div>
  );
}

export default function CommissionCalculator() {
  const tr = useTr();
  const [referredTraders, setReferredTraders] = useState(
    calculatorDefaults.referredTraders
  );
  const [avgLots, setAvgLots] = useState(
    calculatorDefaults.avgLotsPerTraderPerMonth
  );
  const [commissionPerLot, setCommissionPerLot] = useState(
    calculatorDefaults.commissionPerLot
  );

  const monthly = referredTraders * avgLots * commissionPerLot;
  const yearly = monthly * 12;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="space-y-8">
        <SliderField
          label={tr("Referans edilen yatırımcı")}
          value={referredTraders}
          min={1}
          max={200}
          onChange={setReferredTraders}
        />
        <SliderField
          label={tr("Ort. lot / yatırımcı / ay")}
          value={avgLots}
          min={1}
          max={20}
          onChange={setAvgLots}
        />
        <SliderField
          label={tr("Lot başına komisyon")}
          value={commissionPerLot}
          min={1}
          max={15}
          onChange={setCommissionPerLot}
          prefix="$"
        />
      </div>

      <div className="rounded-3xl border border-hairline-light bg-paper-high p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          {tr("Tahmini aylık gelir")}
        </p>
        <p className="mt-2 font-display text-4xl font-semibold text-text-dark">
          <AnimatedNumber value={monthly} prefix="$" />
        </p>
        <div className="my-6 h-px bg-hairline-light" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          {tr("Tahmini yıllık gelir")}
        </p>
        <p className="mt-2 font-display text-3xl font-semibold text-signal">
          <AnimatedNumber value={yearly} prefix="$" />
        </p>
        <p className="mt-6 text-xs leading-relaxed text-text-muted">
          Yalnızca örnek amaçlıdır. Gerçek komisyon oranları ve ödeme
          koşulları, partner olarak onaylandıktan sonra aracı kurum
          anlaşmasına göre belirlenir.
        </p>
      </div>
    </div>
  );
}
