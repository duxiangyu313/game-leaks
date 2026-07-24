"use client";

import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Flame, ChevronRight } from "lucide-react";

export default function CjBanner() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 mt-3">
      <LinkNoPrefetch
        href="/cj2026"
        className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#E94560]/10 via-[#E94560]/5 to-transparent border border-[#E94560]/20 hover:border-[#E94560]/40 rounded-xl transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg"><Flame className="w-5 h-5 text-[#E94560]" /></span>
          <div>
            <span className="text-sm font-bold text-[#E94560]">ChinaJoy 2026</span>
            <span className="hidden sm:inline text-sm text-[#94A3B8] ml-2">
              7/31-8/3 上海 · 国产3A试玩指南 · 抵抗者/九阴UE5/颂钟长鸣 首次公开试玩
            </span>
          </div>
        </div>
        <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[#E94560] group-hover:translate-x-0.5 transition-transform">
          查看专题 <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </LinkNoPrefetch>
    </div>
  );
}