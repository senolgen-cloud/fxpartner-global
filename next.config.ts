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
};

export default nextConfig;
