import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "live2",
  images: { unoptimized: true },
  trailingSlash: true,
  generateBuildId: async () => "v" + Date.now(),
};

export default nextConfig;
