"use client";

import { useEffect, useState, useCallback } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Leak { id: string; title: string; game_name: string | null; credibility: string | null; status: string | null; view_count: number | null; created_at: string | null; }
const PAGE_SIZE = 20;
const CREDS = ["全部", "confirmed", "likely", "rumor"];

export default function LeaksPage() {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cred, setCred] = useState("全部");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("leaks").select("id,title,game_name,credibility,status,view_count,created_at", { count: "exact" }).eq("status", "published");
    if (search) q = q.ilike("title", `%${search}%`);
    if (cred !== "全部") q = q.eq("credibility", cred);
    const { data, count } = await q.order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    setLeaks(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [search, cred, page]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await supabase.from("leaks").delete().eq("id", id);
    load();
  };
  const handleBatchDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 条爆料？`)) return;
    await supabase.from("leaks").delete().in("id", Array.from(selected));
    setSelected(new Set());
    load();
  };
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const credLabel = (c: string) => c === "confirmed" ? "已确认" : c === "likely" ? "高可信" : c === "rumor" ? "传闻" : c;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">爆料管理</h1><p className="text-sm text-[#64748B]">共 {total} 条</p></div>
        <LinkNoPrefetch href="/admin/leaks/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl hover:bg-[#0891B2]"><Plus className="w-4 h-4" /> 发布爆料</LinkNoPrefetch>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="搜索爆料…" className="w-full pl-9 pr-3 py-2 bg-[#1E293B] border border-[rgba(30,41,59,0.6)] rounded-lg text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]" />
        </div>
        <div className="flex gap-1">
          {CREDS.map(c => (
            <button key={c} onClick={() => { setCred(c); setPage(0); }} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${cred === c ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30" : "bg-[#1E293B] text-[#94A3B8] border border-[rgba(30,41,59,0.4)] hover:text-[#F1F5F9]"}`}>
              {c === "全部" ? "全部" : credLabel(c)}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <button onClick={handleBatchDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-lg hover:bg-[#EF4444]/20"><Trash2 className="w-3 h-3" /> 删除 {selected.size} 条</button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#64748B]">加载中…</div>
        ) : leaks.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">暂无爆料</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0F172A]/60">
              <tr className="text-left text-xs text-[#64748B]">
                <th className="p-3 w-10"><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(leaks.map(l => l.id)) : new Set())} checked={selected.size === leaks.length && leaks.length > 0} /></th>
                <th className="p-3">标题</th>
                <th className="p-3 hidden md:table-cell">游戏</th>
                <th className="p-3">可信度</th>
                <th className="p-3 hidden md:table-cell">浏览</th>
                <th className="p-3 hidden md:table-cell">时间</th>
                <th className="p-3 w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {leaks.map(l => (
                <tr key={l.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/30">
                  <td className="p-3"><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} /></td>
                  <td className="p-3 text-[#F1F5F9] truncate max-w-[200px]">{l.title}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{l.game_name || "—"}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${l.credibility === "confirmed" ? "bg-[#10B981]/10 text-[#10B981]" : l.credibility === "likely" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#64748B]/10 text-[#64748B]"}`}>{credLabel(l.credibility || "")}</span></td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{l.view_count || 0}</td>
                  <td className="p-3 text-[#64748B] text-xs hidden md:table-cell">{l.created_at ? new Date(l.created_at).toLocaleDateString("zh-CN") : "-"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <LinkNoPrefetch href={`/admin/leaks/edit?id=${l.id}`} className="p-1.5 text-[#64748B] hover:text-[#06B6D4]"><Pencil className="w-3.5 h-3.5" /></LinkNoPrefetch>
                      <button onClick={() => handleDelete(l.id)} className="p-1.5 text-[#64748B] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
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
