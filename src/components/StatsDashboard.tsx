"use client";

import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Gamepad2, Flame, Users, TrendingUp, Star, Crown } from "lucide-react";

interface StatsData {
  stats: { games: number; leaks: number; members: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topHype: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topRated: any[];
}

const MOCK_STATS: StatsData = {
  stats: { games: 37, leaks: 30, members: 1 },
  topHype: [
    { title: "黑神话：悟空", hype_score: 98 },
    { title: "影之刃零", hype_score: 95 },
    { title: "归唐", hype_score: 86 },
  ],
  topRated: [
    { title: "黑神话：悟空", rating: 9.5 },
    { title: "影之刃零", rating: 9.2 },
    { title: "燕云十六声", rating: 8.8 },
  ],
};

export default function StatsDashboard() {
  const { data, loading } = useCachedQuery<StatsData>(
    "stats",
    () => Promise.all([
      supabase.from("games").select("id", { count: "exact", head: true }),
      supabase.from("leaks").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      // Fallback: 如果 profiles RLS 阻止匿名计数，尝试 site_stats VIEW
      supabase.from("site_stats").select("total_members").single(),
      supabase.from("games").select("id,title,hype_score").order("hype_score", { ascending: false }).limit(3),
      supabase.from("games").select("id,title,rating").not("rating", "is", null).order("rating", { ascending: false }).limit(3),
    ]).then(([{ count: games }, { count: leaks }, { count: members }, siteStats, { data: hype }, { data: rated }]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const siteStatsData = (siteStats as any)?.data;
      const memberCount = members || siteStatsData?.total_members || 0;
      const result: StatsData = {
        stats: { games: games || 0, leaks: leaks || 0, members: memberCount },
        topHype: hype || [],
        topRated: rated || [],
      };
      return result;
    }),
    MOCK_STATS,
    "stats"
  );

  const { stats, topHype, topRated } = data;

  if (loading) return (
    <section>
      <div className="glass-card p-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="h-20 bg-[#1E293B]/30 rounded-xl" /><div className="h-20 bg-[#1E293B]/30 rounded-xl" /><div className="h-20 bg-[#1E293B]/30 rounded-xl" /><div className="h-20 bg-[#1E293B]/30 rounded-xl" /></div>
      </div>
    </section>
  );

  return (
    <section>
      <div className="glass-card p-6 md:p-8">
        <h2 className="text-lg font-bold text-[#F1F5F9] mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#06B6D4]" />网站数据</h2>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Gamepad2, label: "收录游戏", value: stats?.games || 0, color: "text-[#06B6D4]" },
            { icon: Flame, label: "爆料总数", value: stats?.leaks || 0, color: "text-[#F59E0B]" },
            { icon: Users, label: "社区成员", value: stats?.members || 0, color: "text-[#10B981]" },
            { icon: TrendingUp, label: "今日新增", value: "+3", color: "text-[#22D3EE]" },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-[#1E293B]/30">
              <s.icon className={`w-7 h-7 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-black text-[#F1F5F9]">{s.value}</div>
              <div className="text-xs text-[#64748B] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top games */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2"><Crown className="w-4 h-4 text-[#F59E0B]" />最受期待</h3>
            {topHype.map((g: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <LinkNoPrefetch key={g.id || g.title} href={`/games/detail?id=${g.id}`} className="flex items-center justify-between py-2 border-b border-[rgba(30,41,59,0.3)] last:border-0 hover:bg-[#1E293B]/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B] w-5">#{i + 1}</span>
                  <span className="text-sm text-[#F1F5F9] hover:text-[#06B6D4] transition-colors">{g.title}</span>
                </div>
                <span className="text-xs text-[#06B6D4] font-mono">{g.hype_score}%</span>
              </LinkNoPrefetch>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />评分最高</h3>
            {topRated.map((g: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
              <LinkNoPrefetch key={g.id || g.title} href={`/games/detail?id=${g.id}`} className="flex items-center justify-between py-2 border-b border-[rgba(30,41,59,0.3)] last:border-0 hover:bg-[#1E293B]/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#64748B] w-5">#{i + 1}</span>
                  <span className="text-sm text-[#F1F5F9] hover:text-[#06B6D4] transition-colors">{g.title}</span>
                </div>
                <span className="text-xs text-[#F59E0B] font-mono">{g.rating}</span>
              </LinkNoPrefetch>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
