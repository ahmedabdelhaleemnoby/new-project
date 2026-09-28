import type { NextConfig } from "next";

// Hosts allowed to serve images: the API, any extra media hosts (comma-separated MEDIA_HOSTS, e.g. a CDN),
// and localhost during development (a local mock API).
const mediaHosts = ["project2.gfoura.com", ...(process.env.MEDIA_HOSTS ?? "").split(",").map(host => host.trim()).filter(Boolean)];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep locale routing internal. Absolute proxy rewrites can be treated as external
  // when Next normalizes a loopback host (127.0.0.1 → localhost), causing a redirect loop.
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/en" },
        {
          source: "/:path((?!en(?:/|$)|ar(?:/|$)|_next(?:/|$)|api(?:/|$)|.*\\.).+)",
          destination: "/en/:path",
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      ...mediaHosts.map(hostname => ({ protocol: "https" as const, hostname })),
      ...(process.env.NODE_ENV === "development" ? [{ protocol: "http" as const, hostname: "localhost" }] : []),
    ],
  },
  // Media uploads pass through a server action (images up to 10 MB, PDFs up to 20 MB, plus multipart overhead).
  experimental: { serverActions: { bodySizeLimit: "21mb" } },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
