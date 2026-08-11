"use client";

import { useEffect, useRef, useState } from "react";

// The video is a 7MB purely decorative background loop (opacity-20,
// blend-screen) — not content, so it must never compete with the page's
// actual critical resources (fonts, hero copy, above-the-fold images) for
// bandwidth during first paint. Deferring the `src` assignment until after
// mount means the browser only starts fetching it once the rest of the
// page has already had its shot at the connection.
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const id = requestIdleCallback?.(() => setShouldLoad(true)) ?? setTimeout(() => setShouldLoad(true), 200);
    return () => {
      if (typeof id === "number") clearTimeout(id);
      else cancelIdleCallback?.(id);
    };
  }, []);

  useEffect(() => {
    if (shouldLoad) videoRef.current?.load();
  }, [shouldLoad]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_75%,transparent)]"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover opacity-20 mix-blend-screen"
        src={shouldLoad ? "/videos/finance-chart-stock.mp4" : undefined}
        autoPlay={shouldLoad}
        muted
        loop
        playsInline
        preload="none"
      />
    </div>
  );
}
