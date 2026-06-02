"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

function EditForm() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("analysis");
  const [requiredTier, setRequiredTier] = useState("free");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) { router.push("/admin/articles"); return; }
    supabase.from("articles").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setTitle(data.title); setContent(data.content); setCategory(data.category); setRequiredTier(data.required_tier); }
      setLoading(false);
    });
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("articles").update({ title, content, category, required_tier: requiredTier }).eq("id", id);
    await supabase.from("admin_logs").insert({ action: "edit_article", detail: title, user_id: (await supabase.auth.getUser()).data.user?.id });
    router.push("/admin/articles");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="text-[#64748B] hover:text-[#F1F5F9]"><ArrowLeft className="w-5 h-5"/></Link>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">编辑文章</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-semibold rounded-xl disabled:opacity-50">
          {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>} 保存
        </button>
      </div>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 mb-4 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-lg font-bold outline-none" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] outline-none font-mono text-sm resize-y" />
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#F1F5F9]">设置</h3>
          <div>
            <label className="text-xs text-[#64748B]">分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
              <option value="analysis">深度分析</option><option value="review">评测</option><option value="preview">前瞻</option><option value="interview">访谈</option><option value="opinion">观点</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#64748B]">可见权限</label>
            <select value={requiredTier} onChange={(e) => setRequiredTier(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
              <option value="free">免费</option><option value="silver">白银</option><option value="gold">黄金</option><option value="diamond">钻石</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditArticlePage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin"/></div>}><EditForm/></Suspense>;
}
