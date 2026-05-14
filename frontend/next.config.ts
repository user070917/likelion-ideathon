import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    // This helps in some monorepo setups
    outputFileTracingRoot: undefined,
  }
};

export default nextConfig;
