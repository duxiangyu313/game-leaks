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
  // 限制静态生成 worker 数（默认 CPU核数-1=15，16GB 内存机器会 OOM 卡死在 Finalizing 阶段）。
  // CI 用 ubuntu-latest（仅 7GB 内存），cpus:4 必然 OOM 导致部署失败，故固定为 1。
  experimental: { cpus: 1 },
};

export default nextConfig;
