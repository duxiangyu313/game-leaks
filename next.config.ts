import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "site",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
