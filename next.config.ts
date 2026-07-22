import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "live",
  images: { unoptimized: true },
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  generateBuildId: async () => "v" + Date.now(),
  // 跳过 TS 检查避免 build worker OOM（内存受限环境）
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
