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
    // Safari (desktop and iOS — every browser on iOS, since they're all
    // WebKit under the hood) has never implemented requestIdleCallback.
    // Referencing it as a bare identifier there throws a ReferenceError
    // (unlike a `window.foo` property access, which safely returns
    // undefined for a missing property) — that crashed this component's
    // render on every browser on iPhone, taking the whole homepage down
    // with it. Reading it off `window` first avoids ever touching the
    // undeclared identifier.
    const ric = typeof window !== "undefined" ? window.requestIdleCallback : undefined;
    if (ric) {
      const id = ric(() => setShouldLoad(true));
      return () => window.cancelIdleCallback?.(id);
    }
    const timeoutId = setTimeout(() => setShouldLoad(true), 200);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (shouldLoad) videoRef.current?.load();
  }, [shouldLoad]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_75%,transparent)]"
    >
      {/* The partner intro (owner's choice, 2026-09-10) is a wall of broker
          logos on WHITE, unlike the dark clips before it. Under
          mix-blend-screen a white frame would wash the whole ink hero grey,
          so it is inverted first: white becomes black, which screen drops
          entirely, and hue-rotate(180deg) turns the inverted hues back
          round so XM stays red and LiteFinance green — only lighter. */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover opacity-25 mix-blend-screen [filter:invert(1)_hue-rotate(180deg)]"
        src={shouldLoad ? "/videos/fxpartner-partners-intro.mp4" : undefined}
        autoPlay={shouldLoad}
        muted
        loop
        playsInline
        preload="none"
      />
    </div>
  );
}
