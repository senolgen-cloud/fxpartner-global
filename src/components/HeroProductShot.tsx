import Image from "next/image";
import { tr } from "@/lib/chrome";

// The product shot that opens both /signals and the homepage: the thing
// itself, arriving, before anything is claimed about it.
//
// The entrance is pure CSS rather than the site's <Reveal>. Reveal starts at
// opacity 0 and waits for an IntersectionObserver to fire after hydration,
// which is fine for something further down the page and wrong for the first
// element on it — a slow or blocked bundle would leave a reader looking at an
// empty screen where the page's opening image should be. A keyframe runs off
// the stylesheet, before any script, and cannot fail that way.
//
// priority is the caller’s call, because it depends on where the image
// lands. At the top of a page it is the LCP element and should be
// preloaded; anywhere below the fold, preloading it steals bandwidth from
// whatever is actually painting first.
export default function HeroProductShot({ priority = false }: { priority?: boolean }) {
  return (
    // No glows and no border. Two 400px blurred circles read as ambient depth
    // behind a wide desktop hero; inside a section this short they simply
    // tint the whole thing, and on a phone the image arrived sitting on a
    // teal panel that announced itself as a separate box against the black
    // above and below it. The artwork already carries its own light — the
    // gold globe and the glowing mark are painted into the PNG — so the page
    // just needs to get out of its way and let it sit on the same background
    // as everything else.
    // No background of its own. The artwork is a transparent PNG, and on the
    // homepage this sits over the hero’s glows and video — an opaque bg-ink
    // here painted a flat black box across them, which read as the image
    // having a background it does not have. /signals gets its black from the
    // main element either way.
    <section className="relative">
      <div className="mx-auto max-w-6xl px-6 pb-4 pt-6 sm:pt-8">
        <div className="signals-hero-visual mx-auto max-w-4xl">
          <Image
            src="/fxpartner-hero-app.png"
            alt={tr(
              "FXPARTNER panelinin masaüstü ve mobil görünümü — canlı sinyaller, grafikler ve broker karşılaştırması"
            )}
            width={1672}
            height={941}
            priority={priority}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
