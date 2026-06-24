"use client";

import { useEffect, useState, useCallback } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Game { id: string; title: string; developer: string | null; status: string | null; hype_score: number | null; release_date: string | null; }
const PAGE_SIZE = 20;

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("games").select("id,title,developer,status,hype_score,release_date", { count: "exact" });
    if (search) q = q.ilike("title", `%${search}%`);
    const { data, count } = await q.order("hype_score", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setGames(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [search, page]);

  // load() triggers setState via async supabase call — intentional data-fetching pattern
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await supabase.from("games").delete().eq("id", id);
    load();
  };

  const statusLabel = (s: string) => {
    switch (s) { case "released": return "已发售"; case "in-dev": return "开发中"; case "announced": return "已公布"; case "beta": return "测试中"; default: return s; }
  };
  const statusColor = (s: string) => s === "released" ? "bg-[#10B981]/10 text-[#10B981]" : s === "in-dev" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#64748B]/10 text-[#64748B]";
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">游戏管理</h1><p className="text-sm text-[#64748B]">共 {total} 款</p></div>
        <LinkNoPrefetch href="/admin/games/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4" /> 添加游戏</LinkNoPrefetch>
      </div>

      <div className="relative max-w-xs mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="搜索游戏…" className="w-full pl-9 pr-3 py-2 bg-[#1E293B] border border-[rgba(30,41,59,0.6)] rounded-lg text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]" />
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-8 text-center text-sm text-[#64748B]">加载中…</div> : games.length === 0 ? <div className="p-8 text-center text-sm text-[#64748B]">暂无游戏</div> : (
          <table className="w-full text-sm">
            <thead className="bg-[#0F172A]/60">
              <tr className="text-left text-xs text-[#64748B]">
                <th className="p-3">名称</th><th className="p-3 hidden md:table-cell">开发商</th><th className="p-3">状态</th><th className="p-3 hidden md:table-cell">热度</th><th className="p-3 hidden md:table-cell">发售日</th><th className="p-3 w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/30">
                  <td className="p-3 text-[#F1F5F9] font-medium">{g.title}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{g.developer || "—"}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(g.status || "")}`}>{statusLabel(g.status || "")}</span></td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{g.hype_score || "—"}</td>
                  <td className="p-3 text-[#64748B] text-xs hidden md:table-cell">{g.release_date || "待定"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <LinkNoPrefetch href={`/admin/games/edit?id=${g.id}`} className="p-1.5 text-[#64748B] hover:text-[#06B6D4]"><Pencil className="w-3.5 h-3.5" /></LinkNoPrefetch>
                      <button onClick={() => handleDelete(g.id)} className="p-1.5 text-[#64748B] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(30,41,59,0.3)]">
            <span className="text-xs text-[#64748B]">第 {page + 1}/{totalPages} 页</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
