// Two-letter stand-in for a broker whose logo file is missing — Broker.logo
// is optional, so every surface that renders a logo needs a fallback that
// still reads as that broker rather than as a hole in the layout.
//
// Extracted because there were already two byte-identical copies of this,
// in brokers/[slug]/page.tsx and BrokerAdBanner.tsx, and the cashback page
// would have made a third.
export function getMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
