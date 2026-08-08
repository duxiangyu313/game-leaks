"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Clock, Shield, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/article-utils";
import { useLeakDetail } from "@/data/hooks";
import { addHistory } from "@/components/account/BrowsingHistory";
import { BreadcrumbListSchema, NewsArticleSchema } from "@/components/StructuredData";

export default function LeakDetailPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 id="seo-fallback-title" className="text-2xl font-bold text-[#F1F5F9] mb-4">爆料详情 · 国产3A游戏最新传闻官方确认消息 · 国游爆料</h1>
        <p id="seo-fallback-desc" className="text-[#94A3B8] text-sm mb-6">国游爆料详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的最新传闻、官方确认消息与独家爆料。</p>
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-[#1E293B]/40 rounded" />
            <div className="h-64 bg-[#1E293B]/20 rounded-2xl" />
          </div>
        }>
          <LeakDetailContent />
        </Suspense>
      </div>
    </div>
  );
}

function LeakDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { leak, loading, error } = useLeakDetail(id);

  useEffect(() => {
    if (!leak) return;
    // SEO — 标题 + meta 描述 + OG
    document.title = `${leak.title} · 国游爆料`;
    const desc = leak.summary || leak.title || "";
    let meta = document.querySelector("meta[name='description']");
    if (meta) { meta.setAttribute("content", desc); }
    else { meta = document.createElement("meta"); meta.setAttribute("name", "description"); meta.setAttribute("content", desc); document.head.appendChild(meta); }
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) { ogTitle.setAttribute("content", `${leak.title} · 国游爆料`); }
    let ogDesc = document.querySelector("meta[property='og:description']");
    if (ogDesc) { ogDesc.setAttribute("content", desc); }

    addHistory({ id: leak.id, title: leak.title, link: `/leaks/detail?id=${leak.id}`, type: "leak" });
  }, [leak]);

  if (!id) return (
    <div className="pt-24 pb-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">未找到此爆料</h1>
        <LinkNoPrefetch href="/leaks" className="text-[#06B6D4] hover:underline">返回爆料列表</LinkNoPrefetch>
      </div>
    </div>
  );

  if (loading) return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-[#1E293B]/40 rounded" />
          <div className="h-64 bg-[#1E293B]/20 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error || !leak) return (
    <div className="pt-24 pb-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-[#F59E0B] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">未找到此爆料</h1>
        {error && <p className="text-sm text-[#EF4444] mb-3">{error}</p>}
        <LinkNoPrefetch href="/leaks" className="text-[#06B6D4] hover:underline">返回爆料列表</LinkNoPrefetch>
      </div>
    </div>
  );

  const credibilityLabel = leak.credibility === "confirmed" ? "已确认" : leak.credibility === "likely" ? "高可信" : "传闻";
  const credibilityCls = leak.credibility === "confirmed"
    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20"
    : leak.credibility === "likely"
    ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20"
    : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20";

  return (
    <div className="pt-24 pb-20">
      <BreadcrumbListSchema items={[
        { name: "首页", url: "https://news.guoyouwenduji.cc/" },
        { name: "爆料专区", url: "https://news.guoyouwenduji.cc/leaks/" },
        { name: leak.title, url: `https://news.guoyouwenduji.cc/leaks/detail/?id=${leak.id}` },
      ]} />
      <NewsArticleSchema
        title={leak.title}
        description={leak.summary || leak.title}
        datePublished={leak.published_at || new Date().toISOString()}
        url={`https://news.guoyouwenduji.cc/leaks/detail/?id=${leak.id}`}
        category={leak.game_name || "国产3A"}
      />
      <div className="max-w-4xl mx-auto px-4">
        <LinkNoPrefetch href="/leaks" className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回爆料列表
        </LinkNoPrefetch>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${credibilityCls}`}>
              {credibilityLabel}
            </span>
            {leak.credibility !== "confirmed" && (
              <span className="text-xs text-[#F59E0B] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 传闻，未经证实</span>
            )}
          </div>

          <h1 className="text-3xl font-black text-[#F1F5F9] mb-4">{leak.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B] mb-8 pb-8 border-b border-[#1E293B]/40">
            {leak.game_name && (
              <LinkNoPrefetch href={`/games/detail?id=${leak.game_name}`} className="text-[#06B6D4] hover:underline font-medium">{leak.game_name}</LinkNoPrefetch>
            )}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {leak.published_at ? formatDate(leak.published_at) : ""}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {(leak.view_count ?? 0).toLocaleString()} 阅读</span>
            {leak.source && <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> 来源：{leak.source}</span>}
          </div>

          <div className="prose prose-invert max-w-none">
            {(leak.content || leak.summary || "").split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="text-[#CBD5E1] leading-relaxed mb-4">{p}</p>
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  );
}
