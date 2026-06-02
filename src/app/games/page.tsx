import { Metadata } from "next";
import { Gamepad2, Search, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "游戏库 · 国游爆料",
  description: "国产3A游戏完整数据库 - 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作信息一览",
};

export default function GamesPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-7 h-7 text-[#06B6D4]" />
              <h1 className="text-3xl font-bold text-[#F1F5F9]">游戏库</h1>
            </div>
            <p className="text-[#94A3B8]">国产3A游戏完整数据库</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B]/60 border border-[rgba(30,41,59,0.6)]">
              <Search className="w-4 h-4 text-[#64748B]" />
              <input type="text" placeholder="搜索游戏..." className="bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none w-48" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B]/60 border border-[rgba(30,41,59,0.6)] text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
              <Filter className="w-4 h-4" /> 筛选
            </button>
          </div>
        </div>
        <div className="glass-card p-16 text-center">
          <p className="text-[#64748B] text-lg">游戏库页面 — 连接 Supabase 后自动加载数据</p>
          <p className="text-[#64748B] text-sm mt-2">请配置 .env.local 中的 Supabase 环境变量</p>
        </div>
      </div>
    </div>
  );
}
