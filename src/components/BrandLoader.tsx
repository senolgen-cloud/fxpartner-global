import Image from "next/image";

// The mark, lit rather than moved, over an indeterminate bar.
//
// Used in two places: route-level loading.tsx, which App Router shows while
// a segment's data resolves, and the one-shot splash over a fresh document.
// Same component so a route change and a cold load do not look like two
// different products.
//
// Deliberately not a spinner. A spinner says "something is happening"; the
// mark says which site it is happening on, which is the only thing worth
// saying to someone who has just arrived and is looking at nothing else.
//
// BOTH VARIANTS COVER THE VIEWPORT, and the route one has to. It was a
// min-h-[60vh] block inside <main>, which meant its black ended partway
// down the screen and the shell's own background — bg-paper, a dark navy,
// not black — showed below it. Two different darks meeting at a horizontal
// line, with the chat button and the bottom bar sitting in the lighter one:
// the loader looked like a panel dropped on the page rather than the page
// loading. Fixed and full-bleed, there is no seam to see.
export default function BrandLoader({ splash = false }: { splash?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black ${
        // The splash sits over content that is already rendered and takes
        // itself away; the route loader IS the content until the segment
        // resolves, so it must stay interactive-blocking and must not fade.
        splash ? "brand-splash pointer-events-none" : ""
      }`}
      // Route loading is worth announcing; the splash is decoration over
      // content that is already there and announcing it would interrupt a
      // screen reader for nothing.
      role={splash ? "presentation" : "status"}
      aria-live={splash ? undefined : "polite"}
      aria-hidden={splash ? true : undefined}
    >
      <div className="brand-loader-mark">
        <Image
          src="/fxpartner-logo.png"
          alt=""
          width={900}
          height={232}
          priority
          className="h-9 w-auto md:h-11"
        />
      </div>
      <div className="brand-loader-bar h-0.5 w-40 rounded-full bg-hairline" />
    </div>
  );
}
