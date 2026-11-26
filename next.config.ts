import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/recrutement/candidatures/notifications": ["./scripts/recruitment-outbox.mjs"],
  },
  experimental: {
    // Keep page-data collection within Hostinger's build resource limits.
    cpus: 2,
  },
};

export default nextConfig;
