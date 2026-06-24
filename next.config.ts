import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "live",
  images: { unoptimized: true },
  trailingSlash: true,
  generateBuildId: async () => "v" + Date.now(),
};

export default nextConfig;
