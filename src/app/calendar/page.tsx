"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const COLORS: Record<string, string> = {
  release: "#10B981", beta: "#8B5CF6", livestream: "#06B6D4", conference: "#E94560", demo: "#F59E0B", update: "#22D3EE", other: "#64748B",
};
const LABELS: Record<string, string> = {
  release: "发售", beta: "测试", livestream: "直播", conference: "展会", demo: "试玩", update: "更新", other: "其他",
};

export default function CalendarPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 2 > 12 ? 1 : month + 2).padStart(2, "0")}-01`;
    supabase.from("game_events").select("*, games(title)").gte("event_date", start).lt("event_date", end).order("event_date").then(({ data }) => {
      setEvents(data || []); setLoading(false);
    });
  }, [month, year]);

  const filtered = filter === "all" ? events : events.filter(e => e.event_type === filter);

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2">
          <CalendarIcon className="w-7 h-7 text-[#06B6D4]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">发售日历</h1>
        </div>
        <p className="text-[#94A3B8] mb-8">国产3A游戏重要节点一览</p>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-2 rounded-lg hover:bg-[#1E293B]/50 text-[#94A3B8]"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-[#F1F5F9]">{year}年{month + 1}月</h2>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-2 rounded-lg hover:bg-[#1E293B]/50 text-[#94A3B8]"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "release", "beta", "demo", "conference", "livestream"].map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${filter === t ? "bg-[#06B6D4] text-white" : "bg-[#1E293B]/40 text-[#94A3B8] hover:text-[#F1F5F9]"}`}>
                {t === "all" ? "全部" : LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">本月暂无事件</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(e => (
              <Link key={e.id} href={e.game_id ? `/games/detail?id=${e.game_id}` : "#"} className="glass-card p-4 flex items-center gap-4 group hover:border-[#06B6D4]/20 transition-all">
                <div className="text-center shrink-0 w-16">
                  <div className="text-2xl font-black text-[#F1F5F9]">{new Date(e.event_date).getDate()}</div>
                  <div className="text-xs text-[#64748B]">{new Date(e.event_date).toLocaleDateString("zh-CN", { weekday: "short" })}</div>
                </div>
                <div className="w-1 h-10 rounded" style={{ backgroundColor: COLORS[e.event_type] || "#64748B" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: COLORS[e.event_type] || "#64748B" }}>{LABELS[e.event_type] || e.event_type}</span>
                    {e.games?.title && <span className="text-xs text-[#06B6D4]">{e.games.title}</span>}
                  </div>
                  <h3 className="font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors">{e.title}</h3>
                  {e.description && <p className="text-xs text-[#64748B] mt-1">{e.description}</p>}
                </div>
                <Clock className="w-4 h-4 text-[#64748B] shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
