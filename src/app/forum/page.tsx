import { Metadata } from "next";
import { MessageSquare, Users, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "论坛 · 国游爆料",
  description: "国产3A游戏玩家社区 - 讨论游戏攻略、分享心得、交流爆料",
};

export default function ForumPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-7 h-7 text-[#06B6D4]" />
              <h1 className="text-3xl font-bold text-[#F1F5F9]">论坛</h1>
            </div>
            <p className="text-[#94A3B8]">国产3A游戏玩家社区</p>
          </div>
          <Link
            href="/forum/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-white font-medium rounded-xl hover:bg-[#0891B2] transition-colors"
          >
            <Plus className="w-4 h-4" /> 发布新帖
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Users, label: "注册用户", count: "12,580", color: "text-[#06B6D4]" },
            { icon: MessageSquare, label: "今日帖子", count: "346", color: "text-[#10B981]" },
            { icon: TrendingUp, label: "在线用户", count: "1,248", color: "text-[#F59E0B]" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 flex items-center gap-4">
              <stat.icon className={`w-10 h-10 ${stat.color}`} />
              <div>
                <div className="text-2xl font-bold text-[#F1F5F9]">{stat.count}</div>
                <div className="text-sm text-[#94A3B8]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-16 text-center">
          <p className="text-[#64748B] text-lg">论坛板块列表 — 连接 Supabase 后动态加载</p>
          <p className="text-[#64748B] text-sm mt-2">包括：综合讨论、游戏专区、爆料交流、灌水区</p>
        </div>
      </div>
    </div>
  );
}
