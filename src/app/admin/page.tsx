"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminAuth";
import { supabase } from "@/lib/supabase/client";
import { FileText, Flame, Gamepad2, Users, CreditCard, TrendingUp, Eye } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAdmin();
  const [stats, setStats] = useState({ articles: 0, leaks: 0, games: 0, users: 0, orders: 0, views: 0 });

  useEffect(() => {
    async function load() {
      const [a, l, g, u] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("leaks").select("*", { count: "exact", head: true }),
        supabase.from("games").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        articles: a.count || 0,
        leaks: l.count || 0,
        games: g.count || 0,
        users: u.count || 0,
        orders: 0,
        views: 0,
      });
    }
    load();
  }, []);

  const cards = [
    { icon: FileText, label: "文章", count: stats.articles, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
    { icon: Flame, label: "爆料", count: stats.leaks, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
    { icon: Gamepad2, label: "游戏", count: stats.games, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
    { icon: Users, label: "用户", count: stats.users, color: "text-[#22D3EE]", bg: "bg-[#22D3EE]/10" },
    { icon: CreditCard, label: "订单", count: stats.orders, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
    { icon: Eye, label: "浏览", count: stats.views, color: "text-[#EC4899]", bg: "bg-[#EC4899]/10" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">欢迎回来，{user?.email}</h1>
        <p className="text-sm text-[#94A3B8] mt-1">网站数据概览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.bg} rounded-xl p-5 border border-[rgba(30,41,59,0.4)]`}>
            <c.icon className={`w-6 h-6 ${c.color} mb-3`} />
            <div className="text-2xl font-bold text-[#F1F5F9]">{c.count}</div>
            <div className="text-xs text-[#64748B] mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#06B6D4]" /> 快速操作
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "发布文章", href: "/admin/articles/new" },
              { label: "发布爆料", href: "/admin/leaks/new" },
              { label: "添加游戏", href: "/admin/games/new" },
              { label: "查看用户", href: "/admin/users" },
            ].map((a) => (
              <a key={a.href} href={a.href} className="py-2.5 px-4 text-sm text-center rounded-lg bg-[#1E293B]/40 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#06B6D4]/10 transition-all">
                {a.label}
              </a>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">最近操作日志</h3>
          <p className="text-sm text-[#64748B]">连接 Supabase 后将显示最近的管理操作记录。</p>
        </div>
      </div>
    </div>
  );
}
