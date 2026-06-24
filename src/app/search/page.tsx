"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { useSearch } from "@/data/hooks";
import type { SearchResult } from "@/data/hooks";
import { Search, Gamepad2, Newspaper, FileText, Loader2 } from "lucide-react";

function SearchContent() {
  const params = useSearchParams();
  const query = params.get("q") || "";
  const { results, loading, error } = useSearch(query);

  const typeIcon = (t: string) => {
    switch (t) {
      case "game": return <Gamepad2 className="w-4 h-4 text-[#06B6D4]" />;
      case "leak": return <Newspaper className="w-4 h-4 text-[#F59E0B]" />;
      case "article": return <FileText className="w-4 h-4 text-[#10B981]" />;
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case "game": return "游戏";
      case "leak": return "爆料";
      case "article": return "文章";
    }
  };

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-[768px] mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">
            搜索{query ? `：「${query}」` : ""}
          </h1>
          <p className="text-sm text-[#64748B]">
            {loading ? "搜索中…" : results.length > 0 ? `找到 ${results.length} 个结果` : query ? "未找到结果" : "输入关键词搜索游戏库、爆料和深度文章"}
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-[#EF4444] text-sm">{error}</div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((r: SearchResult) => (
              <LinkNoPrefetch
                key={`${r.type}-${r.id}`}
                href={r.link}
                className="block p-4 bg-[#1A2332] border border-[rgba(30,41,59,0.6)] hover:border-[rgba(6,182,212,0.3)] rounded-xl transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{typeIcon(r.type)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#0F172A] text-[#64748B]">
                        {typeLabel(r.type)}
                      </span>
                      <h3 className="text-sm font-medium text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors truncate">
                        {r.title}
                      </h3>
                    </div>
                    {r.subtitle && (
                      <p className="text-xs text-[#64748B] line-clamp-2 ml-0">{r.subtitle}</p>
                    )}
                  </div>
                </div>
              </LinkNoPrefetch>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && !error && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-[#334155] mx-auto mb-4" />
            <p className="text-[#64748B] text-sm">没有找到相关内容</p>
            <p className="text-[#475569] text-xs mt-1">试试其他关键词，比如「归唐」「黑神话」「影之刃」</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
