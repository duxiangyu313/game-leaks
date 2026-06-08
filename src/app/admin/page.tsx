"use client";

import { useEffect, useState } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { useAdmin } from "@/components/admin/AdminAuth";
import { supabase } from "@/lib/supabase/client";
import { FileText, Flame, Gamepad2, Users, CreditCard, Eye, TrendingUp, Clock, ArrowRight, Rocket, CheckCircle, Loader2 } from "lucide-react";

interface Stats { articles: number; leaks: number; games: number; users: number; orders: number; totalViews: number; }
interface RecentItem { id: string; title: string; type: "article" | "leak"; time: string; status: string; }

const DEPLOY_FN = "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/trigger-deploy";

export default function AdminDashboard() {
  const { user } = useAdmin();
  const [stats, setStats] = useState<Stats>({ articles: 0, leaks: 0, games: 0, users: 0, orders: 0, totalViews: 0 });
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState("");

  useEffect(() => {
    async function load() {
      const [a, l, g, u, p, v] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("leaks").select("id", { count: "exact", head: true }),
        supabase.from("games").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }),
        supabase.from("leaks").select("view_count").eq("status", "published"),
      ]);
      const totalViews = v.data?.reduce((sum: number, l: { view_count: number }) => sum + (l.view_count || 0), 0) || 0;
      setStats({ articles: a.count || 0, leaks: l.count || 0, games: g.count || 0, users: u.count || 0, orders: p.count || 0, totalViews });

      // Recent activity — combine articles and leaks
      const [{ data: recentArticles }, { data: recentLeaks }] = await Promise.all([
        supabase.from("articles").select("id,title,status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("leaks").select("id,title,status,created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const combined: RecentItem[] = [
        ...(recentArticles || []).map((x: { id: string; title: string; status: string; created_at: string }) => ({ id: x.id, title: x.title, type: "article" as const, status: x.status, time: x.created_at })),
        ...(recentLeaks || []).map((x: { id: string; title: string; status: string; created_at: string }) => ({ id: x.id, title: x.title, type: "leak" as const, status: x.status, time: x.created_at })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
      setRecent(combined);
    }
    load();
  }, []);

  const cards = [
    { icon: FileText, label: "文章", count: stats.articles, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", href: "/admin/articles" },
    { icon: Flame, label: "爆料", count: stats.leaks, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", href: "/admin/leaks" },
    { icon: Gamepad2, label: "游戏", count: stats.games, color: "text-[#10B981]", bg: "bg-[#10B981]/10", href: "/admin/games" },
    { icon: Users, label: "用户", count: stats.users, color: "text-[#22D3EE]", bg: "bg-[#22D3EE]/10", href: "/admin/users" },
    { icon: CreditCard, label: "订单", count: stats.orders, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", href: "/admin/orders" },
    { icon: Eye, label: "总浏览", count: stats.totalViews, color: "text-[#EC4899]", bg: "bg-[#EC4899]/10" },
  ];

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployMsg("");
    try {
      const res = await fetch(DEPLOY_FN, { method: "POST" });
      const result = await res.json();
      if (res.ok) {
        setDeployMsg("部署已触发！约 2 分钟后生效");
      } else {
        setDeployMsg(result.error || "触发失败");
      }
    } catch {
      setDeployMsg("网络错误，请稍后重试");
    }
    setDeploying(false);
    setTimeout(() => setDeployMsg(""), 8000);
  };

  const timeAgo = (iso: string) => {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return "刚刚";
    if (m < 60) return `${m}分钟前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}小时前`;
    return `${Math.floor(h / 24)}天前`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">欢迎回来，{user?.email?.split("@")[0]}</h1>
        <p className="text-sm text-[#94A3B8] mt-1">网站数据概览</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <LinkNoPrefetch key={c.label} href={c.href || "#"} className={`${c.bg} rounded-xl p-5 border border-[rgba(30,41,59,0.4)] hover:border-[rgba(6,182,212,0.2)] transition-all block`}>
            <c.icon className={`w-6 h-6 ${c.color} mb-3`} />
            <div className="text-2xl font-bold text-[#F1F5F9] tabular-nums">{c.count.toLocaleString()}</div>
            <div className="text-xs text-[#64748B] mt-1">{c.label}</div>
          </LinkNoPrefetch>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions + Deploy */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#06B6D4]" /> 快速操作
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "发布文章", href: "/admin/articles/new" },
              { label: "发布爆料", href: "/admin/leaks/new" },
              { label: "添加游戏", href: "/admin/games/new" },
              { label: "查看用户", href: "/admin/users" },
            ].map((a) => (
              <LinkNoPrefetch key={a.href} href={a.href} className="py-2.5 px-4 text-sm text-center rounded-lg bg-[#1E293B]/40 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#06B6D4]/10 transition-all">
                {a.label}
              </LinkNoPrefetch>
            ))}
          </div>
          <div className="border-t border-[rgba(30,41,59,0.4)] pt-4">
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="w-full py-3 flex items-center justify-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {deploying ? "触发中…" : "重新部署网站"}
            </button>
            {deployMsg && (
              <p className={`text-xs text-center mt-2 flex items-center justify-center gap-1 ${deployMsg.includes("已触发") ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                {deployMsg.includes("已触发") && <CheckCircle className="w-3 h-3" />}
                {deployMsg}
              </p>
            )}
            <p className="text-[10px] text-[#475569] text-center mt-2">修改内容后点此按钮，自动构建并部署到线上</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F59E0B]" /> 最近更新
          </h3>
          {recent.length === 0 ? (
            <p className="text-sm text-[#64748B]">暂无内容，去发布第一条吧。</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {recent.map((item) => (
                <LinkNoPrefetch
                  key={`${item.type}-${item.id}`}
                  href={item.type === "article" ? `/admin/articles/edit?id=${item.id}` : `/admin/leaks/edit?id=${item.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1E293B]/40 transition-all group"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === "published" ? "bg-[#10B981]" : "bg-[#64748B]"}`} />
                  <span className="flex-1 text-sm text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors truncate">{item.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1E293B] text-[#64748B] shrink-0">
                    {item.type === "article" ? "文章" : "爆料"}
                  </span>
                  <span className="text-[10px] text-[#475569] w-14 text-right shrink-0">{timeAgo(item.time)}</span>
                  <ArrowRight className="w-3 h-3 text-[#475569] group-hover:text-[#06B6D4] transition-colors shrink-0" />
                </LinkNoPrefetch>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
