import type { NextConfig } from "next";

// Before the config is even read, so a build and any process it spawns
// agree with the server (see src/instrumentation.ts for why this matters).
process.env.TZ = "UTC";

const nextConfig: NextConfig = {
  images: {
    // Only the Exclusive Markets logo (a static, self-authored asset in
    // public/brokers) needs this; sandboxed via CSP per Next.js guidance.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      // The Akademi artwork prints "fxpartner.global/akademi" on it, and
      // that URL did not exist — the section lives at /egitim. The image is
      // going out as a link preview, so the address on it has to work.
      // Permanent, because /egitim stays the canonical path and this is
      // only here so a URL people read off a picture resolves.
      { source: "/akademi", destination: "/egitim", permanent: true },
      { source: "/:locale(tr|en|ua|ar)/akademi", destination: "/:locale/egitim", permanent: true },
    ];
  },
};

export default nextConfig;
