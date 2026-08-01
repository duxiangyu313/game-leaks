import LinkNoPrefetch from "@/components/LinkNoPrefetch";

/**
 * 工具箱首页（/tools/）
 * 静态导出下必须有这个文件，否则 /tools 路由 404
 * Navbar 链接到 /tools，这里作为工具集合入口，重定向到 req-check 或展示工具卡片
 */
export default function ToolsIndexPage() {
  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">工具箱</h1>
        <p className="text-[#A8A39A]">
          专为国产游戏玩家打造的实用工具集合，免费试用中
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* 工具卡片 1：配置检测 */}
        <LinkNoPrefetch
          href="/tools/req-check"
          className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-[#1A1A2E] p-6 transition-all hover:border-[#E94560]/40 hover:shadow-[0_0_32px_rgba(233,69,96,0.08)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#E94560]/5 blur-[40px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#E94560]/15 flex items-center justify-center text-[#E94560]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <path d="M6 9l3 3-3 3M14 9h4M14 13h2" />
                </svg>
              </div>
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#F5A623]/15 text-[#F5A623] font-medium">
                免费 · 每日 3 次
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E8] mb-1.5 group-hover:text-[#E94560] transition-colors">
              游戏配置检测器
            </h3>
            <p className="text-sm text-[#A8A39A] leading-relaxed">
              输入你的电脑配置，一键检测是否能流畅运行黑神话悟空、影之刃零、归唐等国产大作
            </p>
            <div className="mt-5 flex items-center text-sm text-[#E94560] font-medium">
              立即使用
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 group-hover:translate-x-1 transition-transform">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </LinkNoPrefetch>

        {/* 工具卡片 2：发售日历提醒 */}
        <LinkNoPrefetch
          href="/calendar"
          className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-[#1A1A2E] p-6 transition-all hover:border-[#F5A623]/40 hover:shadow-[0_0_32px_rgba(245,166,35,0.08)]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#F5A623]/5 blur-[40px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#10B981]/15 text-[#10B981] font-medium">
                已上线
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#F5F1E8] mb-1.5 group-hover:text-[#F5A623] transition-colors">
              游戏发售日历 · 提醒
            </h3>
            <p className="text-sm text-[#A8A39A] leading-relaxed">
              自定义关注国产大作，发售前自动推送邮件提醒，再也不会错过预购
            </p>
            <div className="mt-5 flex items-center text-sm text-[#F5A623] font-medium">
              立即使用
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 group-hover:translate-x-1 transition-transform">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </LinkNoPrefetch>
      </div>
    </div>
  );
}
