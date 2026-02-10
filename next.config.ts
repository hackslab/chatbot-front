import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // @ts-ignore
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
