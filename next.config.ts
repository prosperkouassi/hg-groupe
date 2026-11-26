import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep page-data collection within Hostinger's build resource limits.
    cpus: 2,
  },
};

export default nextConfig;
