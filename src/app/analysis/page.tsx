import { Metadata } from "next";
import { BookOpen, PenLine, Users, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "深度解析 · 国游爆料",
  description: "国产3A游戏深度评测、前瞻分析、开发者访谈、行业观察",
};

export default function AnalysisPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-[#06B6D4]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">深度解析</h1>
        </div>
        <p className="text-[#94A3B8] mb-10">专业评测与行业深度分析</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: PenLine, label: "评测", count: 24, color: "text-[#06B6D4]" },
            { icon: TrendingUp, label: "前瞻", count: 18, color: "text-[#F59E0B]" },
            { icon: BookOpen, label: "分析", count: 32, color: "text-[#10B981]" },
            { icon: Users, label: "访谈", count: 12, color: "text-[#22D3EE]" },
          ].map((cat) => (
            <div key={cat.label} className="glass-card p-5 text-center cursor-pointer hover:border-[#06B6D4]/30 transition-all">
              <cat.icon className={`w-8 h-8 ${cat.color} mx-auto mb-3`} />
              <div className="text-lg font-semibold text-[#F1F5F9]">{cat.label}</div>
              <div className="text-xs text-[#64748B] mt-1">{cat.count} 篇</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-16 text-center">
          <p className="text-[#64748B] text-lg">文章列表 — 连接 Supabase 后自动加载</p>
        </div>
      </div>
    </div>
  );
}
