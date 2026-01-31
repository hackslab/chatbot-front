import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // @ts-ignore
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
