import type { NextConfig } from "next";

// Hosts allowed to serve images: the API, any extra media hosts (comma-separated MEDIA_HOSTS, e.g. a CDN),
// and localhost during development (a local mock API).
const mediaHosts = ["project2.gfoura.com", ...(process.env.MEDIA_HOSTS ?? "").split(",").map(host => host.trim()).filter(Boolean)];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
