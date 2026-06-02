"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";

function CompareContent() {
  const params = useSearchParams();
  const ids = (params.get("ids") || "").split(",").filter(Boolean).slice(0, 3);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map(id => supabase.from("games").select("*, game_requirements(*)").eq("id", id).single()))
      .then(results => { setGames(results.map(r => r.data).filter(Boolean)); setLoading(false); });
  }, [ids.join(",")]);

  const fields = [
    { key: "developer", label: "开发商" },
    { key: "publisher", label: "发行商" },
    { key: "release_date", label: "发售日期" },
    { key: "status", label: "状态" },
    { key: "genre", label: "类型", render: (v: string[]) => v?.join("、") || "-" },
    { key: "platforms", label: "平台", render: (v: string[]) => v?.join("、") || "-" },
    { key: "hype_score", label: "期待度", render: (v: number) => v ? v + "%" : "-" },
    { key: "rating", label: "评分", render: (v: number) => v || "-" },
  ];

  const reqFields = [
    { key: "cpu_min", label: "CPU最低" },
    { key: "gpu_min", label: "显卡最低" },
    { key: "ram_min", label: "内存最低" },
    { key: "storage_min", label: "存储最低" },
  ];

  if (loading) return <div className="pt-20 pb-20 text-center"><div className="w-8 h-8 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  if (ids.length < 2) return <div className="pt-20 pb-20 text-center text-[#64748B]">请在游戏详情页选择2-3款游戏进行对比</div>;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Link href="/games" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] mb-6"><ArrowLeft className="w-4 h-4" /> 返回游戏库</Link>
        <h1 className="text-3xl font-black text-[#F1F5F9] mb-2 flex items-center gap-3"><GitCompare className="w-8 h-8 text-[#06B6D4]" />游戏对比</h1>
        <p className="text-[#94A3B8] mb-8">共 {games.length} 款游戏</p>

        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(30,41,59,0.4)]">
                <th className="text-left p-4 text-[#94A3B8] font-medium w-24">参数</th>
                {games.map(g => <th key={g.id} className="text-center p-4 text-[#F1F5F9] font-bold">{g.title}</th>)}
              </tr>
            </thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.key} className="border-b border-[rgba(30,41,59,0.2)] hover:bg-[#1E293B]/20">
                  <td className="p-4 text-[#64748B]">{f.label}</td>
                  {games.map(g => <td key={g.id} className="text-center p-4 text-[#F1F5F9]">{f.render ? f.render(g[f.key]) : (g[f.key] || "-")}</td>)}
                </tr>
              ))}
              {games.some(g => g.game_requirements) && (
                <>
                  <tr className="border-b border-[rgba(30,41,59,0.2)]"><td colSpan={games.length + 1} className="p-4 text-[#06B6D4] font-semibold">配置要求</td></tr>
                  {reqFields.map(f => (
                    <tr key={f.key} className="border-b border-[rgba(30,41,59,0.2)] hover:bg-[#1E293B]/20">
                      <td className="p-4 text-[#64748B]">{f.label}</td>
                      {games.map(g => <td key={g.id} className="text-center p-4 text-[#F1F5F9] text-xs">{g.game_requirements?.[f.key] || "-"}</td>)}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return <Suspense><CompareContent /></Suspense>;
}
