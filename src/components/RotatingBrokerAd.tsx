"use client";

import { useEffect, useState } from "react";
import BrokerAdBanner from "@/components/BrokerAdBanner";
import type { Broker } from "@/data/brokers";

// Cycles through several sponsored brokers instead of showing the same one
// on every visit — fairer rotation across paid placements, and repeat
// visitors don't just tune the same banner out. Pauses on hover so a user
// mid-read/mid-click doesn't have the ad swap out from under them.
export default function RotatingBrokerAd({ brokers }: { brokers: Broker[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (brokers.length <= 1 || paused) return;
    const interval = setInterval(() => {
      setVisible(false);
      const fadeTimeout = setTimeout(() => {
        setIndex((i) => (i + 1) % brokers.length);
        setVisible(true);
      }, 250);
      return () => clearTimeout(fadeTimeout);
    }, 8000);
    return () => clearInterval(interval);
  }, [brokers.length, paused]);

  if (brokers.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`transition-opacity duration-250 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <BrokerAdBanner broker={brokers[index]} />
    </div>
  );
}
