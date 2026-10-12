import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@google/model-viewer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
