"use client";

import { useEffect } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Page error:", error);
    }
    // TODO: 接入生产环境错误上报（如 Sentry / 百度统计JS异常监控）
  }, [error]);

  return (
    <div className="pt-20 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl font-black text-[#E94560]/20 mb-4">⚠</div>
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">页面加载出错</h1>
        <p className="text-[#94A3B8] mb-2 max-w-md mx-auto">
          抱歉，页面渲染时发生了错误。请尝试刷新页面。
        </p>
        {error.digest && (
          <p className="text-xs text-[#64748B] mb-6 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="px-6 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] transition-all">
            重试
          </button>
          <LinkNoPrefetch href="/" className="px-6 py-2.5 bg-[#1E293B] text-[#F1F5F9] text-sm font-medium rounded-xl hover:bg-[#1E293B]/80 transition-all">
            返回首页
          </LinkNoPrefetch>
        </div>
      </div>
    </div>
  );
}
