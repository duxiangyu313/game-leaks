"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Article {
  id: string; title: string; category: string; required_tier: string;
  status: string; view_count: number; created_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("id,title,category,required_tier,status,view_count,created_at")
        .order("created_at", { ascending: false });
      setArticles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这篇文章？")) return;
    await supabase.from("articles").delete().eq("id", id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const tierLabel = (t: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ free: "免费", silver: "白银", gold: "黄金", diamond: "钻石" } as any)[t] || t;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">文章管理</h1>
          <p className="text-sm text-[#64748B] mt-1">共 {articles.length} 篇</p>
        </div>
        <Link href="/admin/articles/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl hover:bg-[#0891B2] transition-all">
          <Plus className="w-4 h-4" /> 新建文章
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] flex-1">
          <Search className="w-4 h-4 text-[#64748B]" />
          <input type="text" placeholder="搜索文章..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#F1F5F9] outline-none flex-1" />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[#1E293B]/30 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#1E293B]/40">
              <tr>
                <th className="text-left p-3 text-[#94A3B8] font-medium">标题</th>
                <th className="text-left p-3 text-[#94A3B8] font-medium hidden md:table-cell">分类</th>
                <th className="text-left p-3 text-[#94A3B8] font-medium hidden md:table-cell">权限</th>
                <th className="text-left p-3 text-[#94A3B8] font-medium hidden md:table-cell">浏览</th>
                <th className="text-right p-3 text-[#94A3B8] font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t border-[rgba(30,41,59,0.3)] hover:bg-[#1E293B]/20">
                  <td className="p-3 text-[#F1F5F9] font-medium">{a.title}</td>
                  <td className="p-3 text-[#94A3B8] hidden md:table-cell">{a.category}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">{tierLabel(a.required_tier)}</span>
                  </td>
                  <td className="p-3 text-[#64748B] hidden md:table-cell">{a.view_count}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/articles/edit?id=${a.id}`} className="p-1.5 rounded text-[#94A3B8] hover:text-[#06B6D4] hover:bg-[#06B6D4]/10"><Pencil className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-[#64748B]">暂无文章</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
