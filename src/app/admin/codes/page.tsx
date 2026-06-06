"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Trash2, Copy, Gift } from "lucide-react";

export default function CodesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameName, setGameName] = useState("");
  const [desc, setDesc] = useState("");
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    supabase.from("activation_codes").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setCodes(data || []); setLoading(false);
    });
  }, []);

  const generateCodes = async () => {
    setGenerating(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const batch = Array.from({ length: count }, () => ({
      code: "GAME-" + Math.random().toString(36).slice(2, 10).toUpperCase() + "-" + Date.now().toString(36).toUpperCase(),
      game_name: gameName || null,
      description: desc || null,
      created_by: userId,
    }));
    await supabase.from("activation_codes").insert(batch);
    const { data } = await supabase.from("activation_codes").select("*").order("created_at", { ascending: false });
    setCodes(data || []);
    setGenerating(false);
  };

  const deleteCode = async (id: string) => {
    await supabase.from("activation_codes").delete().eq("id", id);
    setCodes(c => c.filter(x => x.id !== id));
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); alert("已复制"); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">激活码管理</h1><p className="text-sm text-[#64748B] mt-1">共 {codes.length} 个 · 已领取 {codes.filter(c => c.claimed_by).length} 个</p></div>
      </div>

      {/* Generate */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><Gift className="w-4 h-4 text-[#F59E0B]" /> 生成激活码</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-[#64748B]">关联游戏</label>
            <input value={gameName} onChange={e => setGameName(e.target.value)} placeholder="可选" className="w-32 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-sm text-[#F1F5F9] outline-none block mt-1" />
          </div>
          <div>
            <label className="text-xs text-[#64748B]">描述</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="可选" className="w-40 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-sm text-[#F1F5F9] outline-none block mt-1" />
          </div>
          <div>
            <label className="text-xs text-[#64748B]">数量</label>
            <input type="number" min={1} max={100} value={count} onChange={e => setCount(+e.target.value)} className="w-20 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-sm text-[#F1F5F9] outline-none block mt-1" />
          </div>
          <button onClick={generateCodes} disabled={generating} className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-semibold rounded-xl hover:bg-[#D97706] transition-all disabled:opacity-50">
            {generating ? "生成中..." : `生成 ${count} 个`}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-[#1E293B]/30 rounded-xl" />)}</div> : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr><th className="text-left p-3 text-[#94A3B8]">激活码</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">游戏</th><th className="text-left p-3 text-[#94A3B8] hidden md:table-cell">状态</th><th className="text-right p-3 text-[#94A3B8]">操作</th></tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/20">
                  <td className="p-3 font-mono text-xs text-[#F1F5F9]">{c.code}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{c.game_name || "-"}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${c.claimed_by ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                      {c.claimed_by ? "已领取" : "未领取"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => copyCode(c.code)} className="p-1.5 rounded text-[#64748B] hover:text-[#06B6D4]"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCode(c.id)} className="p-1.5 rounded text-[#64748B] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
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
