"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Search, Clock } from "lucide-react";

export default function LeaksPage() {
  const [leaks, setLeaks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("leaks").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setLeaks(data || []); setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await supabase.from("leaks").delete().eq("id", id);
    setLeaks((p) => p.filter((l) => l.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">爆料管理</h1><p className="text-sm text-[#64748B]">共 {leaks.length} 条</p></div>
        <Link href="/admin/leaks/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl hover:bg-[#0891B2]">
          <Plus className="w-4 h-4" /> 新建爆料
        </Link>
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] mb-4">
        <Search className="w-4 h-4 text-[#64748B]" />
        <input type="text" placeholder="搜索爆料..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm text-[#F1F5F9] outline-none flex-1" />
      </div>
      {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-[#1E293B]/30 rounded-xl"/>)}</div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr>
                <th className="text-left p-3 text-[#94A3B8]">标题</th>
                <th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">可信度</th>
                <th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">游戏</th>
                <th className="text-right p-3 text-[#94A3B8]">操作</th>
              </tr>
            </thead>
            <tbody>
              {leaks.filter(l=>l.title?.toLowerCase().includes(search.toLowerCase())).map(l=>(
                <tr key={l.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/20">
                  <td className="p-3 text-[#F1F5F9] font-medium">{l.title}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${l.credibility==='confirmed'?'bg-[#10B981]/10 text-[#10B981]':l.credibility==='likely'?'bg-[#06B6D4]/10 text-[#06B6D4]':'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                      {l.credibility==='confirmed'?'已确认':l.credibility==='likely'?'高可信':'传闻'}</span>
                  </td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{l.game_name||'-'}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/leaks/edit?id=${l.id}`} className="p-1.5 rounded text-[#94A3B8] hover:text-[#06B6D4]"><Pencil className="w-3.5 h-3.5"/></Link>
                    <button onClick={()=>handleDelete(l.id)} className="p-1.5 rounded text-[#94A3B8] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
