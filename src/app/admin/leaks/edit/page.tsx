"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

function EditForm() {
  const router = useRouter(); const params = useSearchParams(); const id = params.get("id");
  const [loading, setLoading] = useState(true); const [title, setTitle] = useState("");
  const [summary, setSummary] = useState(""); const [content, setContent] = useState("");
  const [credibility, setCredibility] = useState("likely"); const [gameName, setGameName] = useState("");
  const [source, setSource] = useState(""); const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) { router.push("/admin/leaks"); return; }
    supabase.from("leaks").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setTitle(data.title); setSummary(data.summary || ""); setContent(data.content || ""); setCredibility(data.credibility || "likely"); setGameName(data.game_name || ""); setSource(data.source || ""); setScheduledAt(data.scheduled_at||""); }
      setLoading(false);
    });
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("leaks").update({ title, summary, content, credibility, game_name: gameName, source, scheduled_at: scheduledAt||null }).eq("id", id!);
    router.push("/admin/leaks");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin"/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><LinkNoPrefetch href="/admin/leaks" className="text-[#64748B] hover:text-[#F1F5F9]"><ArrowLeft className="w-5 h-5"/></LinkNoPrefetch><h1 className="text-2xl font-bold text-[#F1F5F9]">编辑爆料</h1></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white text-sm font-semibold rounded-xl disabled:opacity-50">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>} 保存</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-lg font-bold outline-none"/>
          <textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] outline-none text-sm resize-none"/>
          <textarea value={content} onChange={e=>setContent(e.target.value)} rows={16} className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] outline-none text-sm font-mono resize-y"/>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[#F1F5F9]">设置</h3>
          <div><label className="text-xs text-[#64748B]">可信度</label><select value={credibility} onChange={e=>setCredibility(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"><option value="confirmed">已确认</option><option value="likely">高可信</option><option value="rumor">传闻</option></select></div>
          <div><label className="text-xs text-[#64748B]">关联游戏</label><input type="text" value={gameName} onChange={e=>setGameName(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
          <div><label className="text-xs text-[#64748B]">来源</label><input type="text" value={source} onChange={e=>setSource(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none"/></div>
        </div>
      </div>
    </div>
  );
}

export default function EditLeakPage() {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin"/></div>}><EditForm/></Suspense>;
}
