"use client";

import { useEffect, useState } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Clock, Lock } from "lucide-react";
import type { Article } from "@/types";
import { calculateReadingTime } from "@/lib/article-utils";

interface Props {
  currentArticleId: string;
  category: string;
  limit?: number;
}

/** 相关文章推荐 */
export default function RelatedArticles({ currentArticleId, category, limit = 3 }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // 优先同分类文章
    supabase
      .from("articles")
      .select("id,title,category,cover_image,tags,required_tier,content,created_at")
      .eq("status", "published")
      .neq("id", currentArticleId)
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data && data.length >= limit) {
          setArticles(data as unknown as Article[]);
        } else {
          // 不足则补充其他分类
          const existing = data || [];
          supabase
            .from("articles")
            .select("id,title,category,cover_image,tags,required_tier,content,created_at")
            .eq("status", "published")
            .neq("id", currentArticleId)
            .neq("category", category)
            .order("created_at", { ascending: false })
            .limit(limit - existing.length)
            .then(({ data: more }) => {
              setArticles([...existing, ...(more || [])] as unknown as Article[]);
            });
        }
      });
  }, [currentArticleId, category, limit]);

  if (articles.length === 0) return null;

  return (
    <div className="mt-14 pt-8 border-t border-[rgba(30,41,59,0.4)]">
      <h3 className="text-lg font-bold text-[#F1F5F9] mb-5">相关文章</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((a) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Article 联合类型中 required_tier/cover_image 为可选字段
          const isPaid = (a as any).required_tier !== "free";
          const readTime = calculateReadingTime(a.content || "");
          return (
            <LinkNoPrefetch
              key={a.id}
              href={`/articles/${a.id}`}
              className={`glass-card p-4 group transition-all ${isPaid ? "article-card-paid" : ""}`}
            >
              {/* 封面图 */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- cover_image 为 Supabase 返回字段 */}
              {(a as any).cover_image && (
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-[#1E293B]/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, @typescript-eslint/no-explicit-any -- Supabase 字段 */}
                  <img
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    src={(a as any).cover_image}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">
                  {a.category === "leak" ? "爆料" : a.category === "review" ? "评测" : a.category === "analysis" ? "分析" : "文章"}
                </span>
                {isPaid && (
                  <span className="badge-member-exclusive">
                    <Lock className="w-2.5 h-2.5" />
                    会员
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-[#F1F5F9] line-clamp-2 group-hover:text-[#06B6D4] transition-colors mb-2">
                {a.title}
              </h4>
              <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readTime} 分钟阅读
              </span>
            </LinkNoPrefetch>
          );
        })}
      </div>
    </div>
  );
}
