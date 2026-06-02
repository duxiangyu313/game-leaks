"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Clock, Tag, Shield } from "lucide-react";
import MembershipGate from "@/components/MembershipGate";

function DetailContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("articles").select("*").eq("id", id).single().then(({ data }) => {
      setArticle(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="pt-20 pb-20"><div className="max-w-3xl mx-auto px-4 animate-pulse"><div className="h-8 w-64 bg-[#1E293B]/30 rounded mb-4" /><div className="h-96 bg-[#1E293B]/20 rounded-xl" /></div></div>;
  if (!article) return <div className="pt-20 pb-20 text-center text-[#64748B]">文章未找到</div>;

  const tierLabel = (t: string) => ({ free: "免费", silver: "白银", gold: "黄金", diamond: "钻石" } as any)[t] || t;

  return (
    <MembershipGate requiredTier={article.required_tier || "free"}>
      <div className="pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <Link href="/analysis" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回列表
          </Link>

          {/* Video embed for video articles */}
          {article.category === "video" && article.content?.includes("iframe") && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-[rgba(30,41,59,0.4)]" dangerouslySetInnerHTML={{ __html: (article.content.match(/<iframe[^>]*><\/iframe>/)?.[0] || "").replace("<iframe", '<iframe loading="lazy"') }} />
          )}

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">
              {article.category === "video" ? "视频" : article.category === "analysis" ? "分析" : article.category === "review" ? "评测" : article.category === "preview" ? "前瞻" : article.category}
            </span>
            {article.required_tier !== "free" && (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center gap-1">
                <Shield className="w-3 h-3" /> {tierLabel(article.required_tier)}可见
              </span>
            )}
            <span className="text-xs text-[#64748B] flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString("zh-CN")}</span>
          </div>

          <h1 className="text-3xl font-black text-[#F1F5F9] mb-8">{article.title}</h1>

          {/* Content rendered as Markdown-ish HTML */}
          <div className="text-[#c4bfb6] leading-relaxed text-[17px] space-y-4">
            {article.content
              ?.replace(/<iframe[^>]*><\/iframe>/g, "") // Remove iframe from content (already shown above)
              .split("\n")
              .map((line: string, i: number) => {
                if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-[#F1F5F9] mt-10 mb-4 pl-3 border-l-3 border-[#06B6D4]">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-[#F1F5F9] mt-8 mb-3">{line.slice(4)}</h3>;
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-[#94A3B8]">{line.slice(2)}</li>;
                if (line.startsWith("**") && line.includes("**")) {
                  const parts = line.split("**");
                  return <p key={i}>{parts.map((p: string, j: number) => j % 2 === 1 ? <strong key={j} className="text-[#F1F5F9]">{p}</strong> : p)}</p>;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i}>{line}</p>;
              })}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[rgba(30,41,59,0.4)] flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-[#64748B]" />
              {article.tags.map((t: string) => <span key={t} className="text-xs text-[#64748B] bg-[#1E293B]/40 px-2.5 py-1 rounded-full">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </MembershipGate>
  );
}

export default function ArticleDetailPage() {
  return <Suspense fallback={<div className="pt-20 pb-20 flex justify-center"><div className="w-6 h-6 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" /></div>}><DetailContent /></Suspense>;
}
