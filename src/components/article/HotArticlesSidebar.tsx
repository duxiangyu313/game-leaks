"use client";

import { useEffect, useState } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Flame, Eye } from "lucide-react";
import type { Article } from "@/types";

interface Props {
  currentArticleId: string;
  limit?: number;
}

/**
 * 桌面端右侧栏「热门爆料」紧凑列表
 * 按 view_count 倒序取已发布文章 top N（排除当前），填充双栏布局的右侧空白。
 */
export default function HotArticlesSidebar({ currentArticleId, limit = 5 }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id,title,category,cover_image,required_tier,view_count,created_at")
      .eq("status", "published")
      .neq("id", currentArticleId)
      .order("view_count", { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data) setArticles(data as unknown as Article[]);
      });
  }, [currentArticleId, limit]);

  if (articles.length === 0) return null;

  return (
    <div className="pt-5 mt-5 border-t border-[rgba(30,41,59,0.4)]">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Flame className="w-4 h-4 text-[#F59E0B]" />
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">热门爆料</span>
      </div>
      <ul className="space-y-3">
        {articles.map((a, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- required_tier/view_count 为 Supabase 返回字段
          const isPaid = (a as any).required_tier !== "free";
          const views = (a as any).view_count || 0;
          return (
            <li key={a.id}>
              <LinkNoPrefetch
                href={`/articles/detail?id=${a.id}`}
                className="group flex gap-3 items-start"
              >
                <span className="text-sm font-bold text-[#334155] w-5 shrink-0 group-hover:text-[#06B6D4] transition-colors">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-[#CBD5E1] line-clamp-2 group-hover:text-[#06B6D4] transition-colors leading-snug">
                    {a.title}
                  </p>
                  <span className="text-[10px] text-[#64748B] flex items-center gap-1 mt-1">
                    <Eye className="w-3 h-3" />
                    {views.toLocaleString()} 阅读{isPaid ? " · 会员" : ""}
                  </span>
                </div>
              </LinkNoPrefetch>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
