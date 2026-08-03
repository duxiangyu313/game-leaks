"use client";

import { useEffect, useState } from "react";
import { loadSEOData, getArticleSEO, getGameSEO, applySEO, type ArticleSEOData, type GameSEOData } from "@/lib/seo-data";

/**
 * 在客户端早期加载 SEO 数据
 * 使用 window.location 直接读取 URL，不依赖 useSearchParams（避免 Suspense 循环依赖）
 */
export function useSEODirect(type: "article" | "game") {
  const [seo, setSeo] = useState<ArticleSEOData | GameSEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const currentId = params.get("id");
    if (!currentId) {
      setLoading(false);
      return;
    }
    setId(currentId);

    loadSEOData().then(() => {
      const data = type === "article" ? getArticleSEO(currentId) : getGameSEO(currentId);
      if (data) {
        setSeo(data);
        // 应用 SEO 到 DOM
        const url = window.location.origin + window.location.pathname + window.location.search;
        applySEO({
          title: data.title + " · 国游爆料",
          description: data.description,
          keywords: (data as any).keywords,
          url: url,
          image: (data as any).coverImage,
          jsonLd: (data as any).jsonLd,
        });
      }
      setLoading(false);
    });
  }, [type]);

  return { seo, loading, id };
}

/**
 * 文章/游戏详情页的 SEO 就绪态组件
 * 在 Suspense 内部使用，确保 SEO 数据在 hydration 前就应用
 */
export function SEOContentWrapper({ 
  type, 
  children 
}: { 
  type: "article" | "game"; 
  children: (seo: ArticleSEOData | GameSEOData | null, loading: boolean) => React.ReactNode;
}) {
  const { seo, loading } = useSEODirect(type);
  return <>{children(seo, loading)}</>;
}

/**
 * 带 SEO 信息的加载 fallback
 * 关键：这个组件在 Suspense fallback 中使用，不依赖 useSearchParams
 * 它在客户端快速读取 URL 中的 id，显示对应的 SEO 标题和描述
 */
export function SEOFallBack({ type }: { type: "article" | "game" }) {
  const { seo } = useSEODirect(type);
  
  const baseTitle = type === "article" ? "文章详情 · 国游爆料" : "游戏详情 · 国游爆料";
  const baseDesc = type === "article" 
    ? "国游爆料文章详情 — 国产3A游戏深度解析、评测、爆料与行业观察。"
    : "国游爆料游戏详情 — 国产3A游戏介绍、评测、配置、攻略、预购与最新动态。";
  
  const displayTitle = seo?.title || baseTitle;
  const displayDesc = seo?.description || baseDesc;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* H1 确保爬虫能读到文章标题 */}
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-4">{displayTitle}</h1>
        <p className="text-[#94A3B8] text-sm mb-6">{displayDesc}</p>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#1E293B]/30 rounded" />
          <div className="h-64 bg-[#1E293B]/20 rounded-xl" />
          <div className="h-8 w-3/4 bg-[#1E293B]/30 rounded" />
          <div className="h-4 w-full bg-[#1E293B]/20 rounded" />
          <div className="h-4 w-5/6 bg-[#1E293B]/20 rounded" />
          <div className="h-4 w-4/6 bg-[#1E293B]/20 rounded" />
        </div>
      </div>
    </div>
  );
}
