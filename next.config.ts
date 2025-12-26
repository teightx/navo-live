import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/navo-live",
  assetPrefix: "/navo-live/",
};

export default nextConfig;
