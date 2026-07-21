import type { NextConfig } from "next";

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
