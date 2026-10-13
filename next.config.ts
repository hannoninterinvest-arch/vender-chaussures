import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeORM loads its PostgreSQL driver with a dynamic require. Keep both
  // packages available to Node instead of bundling that loader with Turbopack.
  serverExternalPackages: ["typeorm", "pg"],
  transpilePackages: ["@google/model-viewer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
