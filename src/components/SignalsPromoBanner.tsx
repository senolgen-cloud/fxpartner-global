"use client";

import Link from "@/components/LocaleLink";
import { useTr } from "@/components/useTr";

// The site's own signals banner, carried by <Footer /> so every route gets it
// without anyone remembering to add it — the same reasoning the share row in
// that file already uses.
//
// A plain <img>, not next/image. The creative is an animated GIF, and the
// image optimizer either strips the animation or has to be turned off with
// `unoptimized`, at which point next/image is a plain <img> with extra steps
// and no srcset. Width and height are still declared so the browser reserves
// the space and nothing below it jumps when the file arrives.
//
// loading="lazy" matters more than usual here: the file is 951 KB, and it
// sits below the fold on every page on the site. Eager-loading it would mean
// paying for a banner most readers never scroll to.
export default function SignalsPromoBanner() {
  const tr = useTr();

  return (
    <div className="border-b border-hairline/60 px-6 py-8">
      <Link
        href="/signals"
        className="mx-auto block w-full max-w-[768px] overflow-hidden rounded-2xl border border-hairline transition-colors hover:border-signal"
      >
        <img
          src="/fxpartner-sinyalleri-g.gif"
          alt={tr("FXPARTNER canlı işlem sinyalleri — gerçek MT5 hesabından, sonuçlarıyla birlikte")}
          width={768}
          height={300}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
      </Link>
    </div>
  );
}
