import Image from "next/image";
import { tr } from "@/lib/chrome";

// The first thing /signals shows: the product itself, arriving.
//
// The entrance is pure CSS rather than the site's <Reveal>. Reveal starts at
// opacity 0 and waits for an IntersectionObserver to fire after hydration,
// which is fine for something further down the page and wrong for the first
// element on it — a slow or blocked bundle would leave a reader looking at an
// empty screen where the page's opening image should be. A keyframe runs off
// the stylesheet, before any script, and cannot fail that way.
//
// priority, because on this page the image is the LCP element. That is the
// opposite of the call made for the same artwork on the homepage, where it
// sits below the fold and preloading it would have stolen bandwidth from
// whatever was actually painting first.
export default function SignalsHeroVisual() {
  return (
    // No glows and no border. Two 400px blurred circles read as ambient depth
    // behind a wide desktop hero; inside a section this short they simply
    // tint the whole thing, and on a phone the image arrived sitting on a
    // teal panel that announced itself as a separate box against the black
    // above and below it. The artwork already carries its own light — the
    // gold globe and the glowing mark are painted into the PNG — so the page
    // just needs to get out of its way and let it sit on the same background
    // as everything else.
    <section className="bg-ink">
      <div className="mx-auto max-w-6xl px-6 pb-6 pt-10 sm:pt-14">
        <div className="signals-hero-visual mx-auto max-w-4xl">
          <Image
            src="/fxpartner-hero-app.png"
            alt={tr(
              "FXPARTNER panelinin masaüstü ve mobil görünümü — canlı sinyaller, grafikler ve broker karşılaştırması"
            )}
            width={1672}
            height={941}
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
