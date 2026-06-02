"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Search, Filter, Star, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const STATUSES = [
  { value: "all", label: "全部" },
  { value: "announced", label: "已公布" },
  { value: "in-dev", label: "开发中" },
  { value: "beta", label: "测试中" },
  { value: "released", label: "已发售" },
];

const SORTS = [
  { value: "hype_score", label: "期待度" },
  { value: "release_date", label: "发售日期" },
  { value: "title", label: "名称" },
];

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [developerFilter, setDeveloperFilter] = useState("");
  const [sortBy, setSortBy] = useState("hype_score");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.from("games").select("*").order("hype_score", { ascending: false }).then(({ data }) => {
      setGames(data || []); setLoading(false);
    });
  }, []);

  // 提取所有开发商列表
  const developers = [...new Set(games.map(g => g.developer).filter(Boolean))] as string[];

  // 筛选+排序
  const filtered = games
    .filter(g => g.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(g => statusFilter === "all" || g.status === statusFilter)
    .filter(g => !developerFilter || g.developer === developerFilter)
    .sort((a, b) => {
      if (sortBy === "hype_score") return (b.hype_score || 0) - (a.hype_score || 0);
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "release_date") {
        if (!a.release_date) return 1; if (!b.release_date) return -1;
        return a.release_date.localeCompare(b.release_date);
      }
      return 0;
    });

  const statusLabel = (s: string) => STATUSES.find(x => x.value === s)?.label || s;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2"><Gamepad2 className="w-7 h-7 text-[#06B6D4]" /><h1 className="text-3xl font-bold text-[#F1F5F9]">游戏库</h1></div>
            <p className="text-[#94A3B8]">国产3A游戏完整数据库 · {filtered.length} 款</p>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#64748B]" />
              <input type="text" placeholder="搜索游戏..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none flex-1" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${showFilters ? "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20" : "bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#94A3B8]"}`}>
              <Filter className="w-4 h-4" /> 筛选
            </button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-sm text-[#F1F5F9] outline-none">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[rgba(30,41,59,0.3)] flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s.value} onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s.value ? "bg-[#06B6D4] text-white" : "bg-[#1E293B]/40 text-[#94A3B8] hover:text-[#F1F5F9]"}`}>
                  {s.label}
                </button>
              ))}
              <span className="w-px h-6 bg-[rgba(30,41,59,0.6)] mx-1" />
              <select value={developerFilter} onChange={e => setDeveloperFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-xs text-[#F1F5F9] outline-none">
                <option value="">全部开发商</option>
                {developers.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Game grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="w-full h-36 rounded-xl bg-[#1E293B]/30 mb-3" />
                <div className="h-5 w-24 bg-[#1E293B]/30 rounded mb-2" />
                <div className="h-3 w-16 bg-[#1E293B]/30 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#64748B]">没有找到匹配的游戏</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((game, i) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 8) * 0.04 }}>
                <Link href={`/games/detail?id=${game.id}`} className="glass-card block p-4 group h-full hover:border-[#06B6D4]/30 hover:-translate-y-1 transition-all duration-300">
                  {/* Cover placeholder */}
                  <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] mb-3 flex items-center justify-center text-5xl border border-[rgba(30,41,59,0.4)] group-hover:border-[#06B6D4]/20 transition-all relative overflow-hidden">
                    <span className="group-hover:scale-110 transition-transform duration-300">{game.title?.charAt(0)}</span>
                    {/* Status badge */}
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded-full ${game.status === "released" ? "bg-[#10B981]/80 text-white" : game.status === "announced" ? "bg-[#06B6D4]/80 text-white" : game.status === "beta" ? "bg-[#F59E0B]/80 text-white" : "bg-[#64748B]/80 text-white"}`}>
                      {statusLabel(game.status)}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors truncate">{game.title}</h3>
                  <p className="text-xs text-[#64748B] mt-1">{game.developer}</p>

                  {game.release_date && (
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{game.release_date}</p>
                  )}

                  {/* Hype bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] rounded-full transition-all duration-500" style={{ width: `${game.hype_score || 50}%` }} />
                    </div>
                    <span className="text-[10px] text-[#64748B] font-mono">{game.hype_score || 50}%</span>
                  </div>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {game.platforms?.slice(0, 3).map((p: string) => (
                      <span key={p} className="text-[10px] text-[#64748B] bg-[#1E293B] px-2 py-0.5 rounded">{p}</span>
                    ))}
                    {game.platforms?.length > 3 && <span className="text-[10px] text-[#64748B]">+{game.platforms.length - 3}</span>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
