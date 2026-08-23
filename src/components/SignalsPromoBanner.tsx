"use client";

import Link from "@/components/LocaleLink";
import { useTr } from "@/components/useTr";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// The site's own signals banner, carried by <Footer /> so every route gets it
// without anyone remembering to add it — the same reasoning the share row in
// that file already uses.
//
// MP4 rather than the original GIF. Same 768x300, same five seconds, 233 KB
// instead of 951: H.264 encodes twenty frames of a moving chart in the space
// GIF spends on one, and this sits below the fold on every page on the site.
// Nobody notices a banner load faster, but everybody pays for one that does
// not.
//
// The attributes are not decoration. `muted` is what makes autoplay legal at
// all — every browser blocks a video with sound. `playsinline` stops iOS
// hijacking the whole screen. `preload="none"` keeps the 233 KB off the wire
// until the reader is actually near it, which is what the GIF's loading="lazy"
// was doing before.
export default function SignalsPromoBanner() {
  const tr = useTr();
  const reducedMotion = usePrefersReducedMotion();

  const label = tr(
    "FXPARTNER canlı işlem sinyalleri — gerçek MT5 hesabından, sonuçlarıyla birlikte"
  );

  return (
    <div className="border-b border-hairline/60 px-6 py-8">
      <Link
        href="/signals"
        aria-label={label}
        className="mx-auto block w-full max-w-[768px] overflow-hidden rounded-2xl border border-hairline transition-colors hover:border-signal"
      >
        {reducedMotion ? (
          // Someone who has asked their system for less motion should not be
          // handed a looping animation because it happens to be an ad. The
          // first frame carries the same message.
          <img
            src="/fxpartner-sinyalleri-poster.webp"
            alt={label}
            width={768}
            height={300}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        ) : (
          <video
            src="/fxpartner-sinyalleri.mp4"
            poster="/fxpartner-sinyalleri-poster.webp"
            width={768}
            height={300}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="h-auto w-full"
          />
        )}
      </Link>
    </div>
  );
}
