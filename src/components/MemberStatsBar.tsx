"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { FileText, Clock, Shield } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

export default function MemberStatsBar() {
  const [articleCount, setArticleCount] = useState(0);

  useEffect(() => {
    // 只查付费文章数（member count 太少不展示，等多了再开）
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .in("required_tier", ["silver", "gold", "diamond"])
      .eq("status", "published")
      .then(({ count }) => { if (count) setArticleCount(count); });
  }, []);

  return (
    <div className="text-center">
      <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 py-4 glass-card rounded-2xl">
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <FileText className="w-4 h-4 text-[#10B981]" />
          <span><strong className="text-[#F1F5F9]">{articleCount || "—"}</strong> 篇独家深度内容</span>
        </div>
        <div className="w-px h-4 bg-[#334155] hidden sm:block" />
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <Clock className="w-4 h-4 text-[#06B6D4]" />
          <span>每周更新行业情报</span>
        </div>
        <div className="w-px h-4 bg-[#334155] hidden sm:block" />
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <Shield className="w-4 h-4 text-[#F59E0B]" />
          <span>7 天无理由退款</span>
        </div>
      </div>
      <p className="text-xs text-[#475569] mt-3">
        解锁全部深度内容，<LinkNoPrefetch href="/member" className="text-[#F59E0B] hover:underline font-medium">查看会员方案 →</LinkNoPrefetch>
      </p>
    </div>
  );
}
