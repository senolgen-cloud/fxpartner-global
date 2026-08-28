"use client";

import { useEffect, useState } from "react";
import BrandLoader from "@/components/BrandLoader";

// The one-shot splash over a fresh document.
//
// TWO INDEPENDENT WAYS OUT, ON PURPOSE. The CSS animation fades it and is
// what a reader actually sees; this component then removes it from the DOM
// outright. Either alone is enough, and that redundancy is the whole design:
// an opaque panel covering the entire viewport must not be able to outlive
// its animation. Browsers freeze animations in tabs that are not
// compositing — a page opened in a background tab, a machine under load —
// and "the decoration stalled" cannot be allowed to mean "the site is
// invisible". Found exactly that state while testing: playState running,
// currentTime pinned at 0, opacity 1, indefinitely.
//
// The server still renders it, so it is in the first HTML and the fade
// starts before any JavaScript arrives. A reader whose JS never loads is
// carried out by the CSS; a reader whose animations never run is carried
// out by the timer.
const VISIBLE_MS = 1200;

export default function BrandSplash() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDone(true), VISIBLE_MS);
    return () => clearTimeout(id);
  }, []);

  if (done) return null;
  return <BrandLoader splash />;
}
