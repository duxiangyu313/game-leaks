import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "site",
  images: { unoptimized: true },
  trailingSlash: true,
  generateBuildId: async () => "v" + Date.now(),
};

export default nextConfig;
