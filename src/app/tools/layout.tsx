import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "实用工具 · 国产3A游戏配置检测与参数查询",
  description: "国游爆料实用工具箱，为国产3A游戏玩家提供电脑配置检测、游戏配置需求查询等实用工具，帮助判断黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作在您设备上的运行表现，快速获得游玩前的硬件建议与参数参考。",
  alternates: { canonical: "/tools/" },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0E14] pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">工具箱</h1>
          <p className="text-gray-400 mt-2">国产游戏实用工具集合</p>
        </div>
        <nav className="flex gap-4 mb-8 border-b border-gray-800 pb-4">
          <LinkNoPrefetch href="/tools/req-check" className="text-[#F5A623] hover:underline">
            配置检测
          </LinkNoPrefetch>
          {/* 未来更多工具入口 */}
        </nav>
        {children}
      </div>
    </div>
  );
}
