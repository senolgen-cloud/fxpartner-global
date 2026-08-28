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
export default function BrandLoader({ splash = false }: { splash?: boolean }) {
  return (
    <div
      className={
        splash
          ? // Covers the page it sits over. The content underneath is
            // already rendered — this is on top of it, not instead of it.
            "brand-splash pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black"
          : "flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-black"
      }
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
