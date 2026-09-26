import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Product images may be served by the content API (see src/lib/content.ts).
  images: { remotePatterns: [{ protocol: "https", hostname: "project2.gfoura.com" }] },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
