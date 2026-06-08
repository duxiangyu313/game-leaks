"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Flame, Zap, TrendingUp, Eye, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/article-utils";

interface LeakItem {
  id: string; title: string; summary: string; content: string;
  source: string; credibility: string; game_name: string;
  published_at: string; view_count: number;
}

export default function LeaksPage() {
  const [leaks, setLeaks] = useState<LeakItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, week: 0, confirmed: 0 });

  useEffect(() => {
    supabase
      .from("leaks")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setLeaks(data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const confirmed = data.filter((l: any) => l.credibility === "confirmed").length;
          setStats({ today: data.length, week: data.length, confirmed });
        }
        setLoading(false);
      });
  }, []);

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
            { icon: Zap, label: "今日爆料", count: stats.today, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
            { icon: TrendingUp, label: "本周热点", count: stats.week, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
            { icon: Flame, label: "已确认", count: stats.confirmed, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
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

        {loading ? (
          <div className="space-y-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
        ) : (
          <div className="space-y-4">
            {leaks.map((leak, i) => (
              <LinkNoPrefetch key={leak.id} href={`/leaks/detail?id=${leak.id}`} className="block active:scale-[0.98] transition-transform">
                <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="glass-card p-6 hover:border-[#06B6D4]/20 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      leak.credibility === "confirmed" ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" :
                      leak.credibility === "likely" ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20" :
                      "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
                    }`}>
                      {leak.credibility === "confirmed" ? "已确认" : leak.credibility === "likely" ? "高可信" : "传闻"}
                    </span>
                    {leak.game_name && <span className="text-xs text-[#06B6D4]">{leak.game_name}</span>}
                  </div>
                  <span className="text-xs text-[#64748B] flex items-center gap-1"><Eye className="w-3 h-3" />{leak.view_count?.toLocaleString()}</span>
                </div>
                <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">{leak.title}</h3>
                <p className="text-sm text-[#94A3B8] mb-3">{leak.summary}</p>
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(leak.published_at)}</span>
                  <span>来源: {leak.source}</span>
                </div>
              </motion.article>
              </LinkNoPrefetch>
            ))}
            {leaks.length === 0 && (
              <div className="text-center py-16 text-[#64748B]">暂无爆料</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
