import LinkNoPrefetch from "@/components/LinkNoPrefetch";

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
