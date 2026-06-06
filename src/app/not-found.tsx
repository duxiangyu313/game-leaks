import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-20 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-[#06B6D4]/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">页面未找到</h1>
        <p className="text-[#94A3B8] mb-8 max-w-md mx-auto">
          你访问的页面不存在或已被移除。可能是链接过期，或者地址输入有误。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="px-6 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] transition-all">
            返回首页
          </Link>
          <Link href="/games" className="px-6 py-2.5 bg-[#1E293B] text-[#F1F5F9] text-sm font-medium rounded-xl hover:bg-[#1E293B]/80 transition-all">
            浏览游戏库
          </Link>
        </div>
      </div>
    </div>
  );
}
