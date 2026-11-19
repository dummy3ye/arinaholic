import type { NextConfig } from "next";

// Next.js dev mode blocks cross-origin dev resources (e.g. the HMR WebSocket)
// unless the origin is listed here. Without this, accessing the dev server
// from a phone on the LAN renders but never hydrates — no scroll-hide,
// no navbar background, no interactivity.
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.10.83"],
};

export default nextConfig;
