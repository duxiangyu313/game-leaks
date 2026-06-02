import { Metadata } from "next";
import { Flame, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "爆料专区 · 国游爆料",
  description: "国产3A游戏最新内幕爆料，高可信度游戏行业消息，最新游戏动态一站掌握",
};

export default function LeaksPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="w-7 h-7 text-[#F59E0B]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">爆料专区</h1>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-[#F59E0B]/15 text-[#F59E0B] rounded-full animate-pulse">LIVE</span>
        </div>
        <p className="text-[#94A3B8] mb-10">最新游戏内幕，第一时间掌握</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Zap, label: "今日爆料", count: 12, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
            { icon: TrendingUp, label: "本周热点", count: 48, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
            { icon: Flame, label: "已确认", count: 156, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          ].map((stat) => (
            <div key={stat.label} className={`glass-card p-6 flex items-center gap-4 ${stat.bg}`}>
              <stat.icon className={`w-10 h-10 ${stat.color}`} />
              <div>
                <div className="text-2xl font-bold text-[#F1F5F9]">{stat.count}</div>
                <div className="text-sm text-[#94A3B8]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-16 text-center">
          <p className="text-[#64748B] text-lg">爆料列表 — 连接 Supabase 后自动加载</p>
          <p className="text-[#64748B] text-sm mt-2">配置 .env.local 后此处将显示最新爆料动态</p>
        </div>
      </div>
    </div>
  );
}
