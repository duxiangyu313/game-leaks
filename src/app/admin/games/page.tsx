"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function GamesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("games").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setGames(data || []); setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await supabase.from("games").delete().eq("id", id);
    setGames((p) => p.filter((g) => g.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">游戏管理</h1><p className="text-sm text-[#64748B]">共 {games.length} 款</p></div>
        <Link href="/admin/games/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl"><Plus className="w-4 h-4"/> 添加游戏</Link>
      </div>
      {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-[#1E293B]/30 rounded-xl"/>)}</div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr><th className="text-left p-3 text-[#94A3B8]">名称</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">开发商</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">状态</th><th className="text-right p-3 text-[#94A3B8]">操作</th></tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/20">
                  <td className="p-3 text-[#F1F5F9] font-medium">{g.title}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{g.developer}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${g.status==='released'?'bg-[#10B981]/10 text-[#10B981]':g.status==='announced'?'bg-[#06B6D4]/10 text-[#06B6D4]':'bg-[#F59E0B]/10 text-[#F59E0B]'}`}>
                      {g.status==='released'?'已发售':g.status==='announced'?'已公布':'开发中'}</span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/games/edit?id=${g.id}`} className="p-1.5 rounded text-[#94A3B8] hover:text-[#06B6D4]"><Pencil className="w-3.5 h-3.5"/></Link>
                    <button onClick={()=>handleDelete(g.id)} className="p-1.5 rounded text-[#94A3B8] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5"/></button>
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
