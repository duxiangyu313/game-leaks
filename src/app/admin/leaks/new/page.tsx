"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewLeakPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [credibility, setCredibility] = useState("likely");
  const [gameName, setGameName] = useState("");
  const [source, setSource] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (publishNow: boolean) => {
    if (!title.trim()) return alert("请输入标题");
    setSaving(true);
    const { error } = await supabase.from("leaks").insert({
      title, summary, content, credibility, game_name: gameName, source,
      status: publishNow ? "published" : "scheduled",
      scheduled_at: publishNow ? null : scheduledAt || null,
      published_at: publishNow ? new Date().toISOString() : null,
      author_id: (await supabase.auth.getUser()).data.user?.id,
    });
    if (error) { alert(error.message); setSaving(false); return; }
    await supabase.from("admin_logs").insert({ action: "create_leak", detail: title, user_id: (await supabase.auth.getUser()).data.user?.id });
    router.push("/admin/leaks");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/leaks" className="text-[#64748B] hover:text-[#F1F5F9]"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">新建爆料</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 text-sm border border-[rgba(30,41,59,0.6)] text-[#94A3B8] rounded-xl hover:text-[#F1F5F9] disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin inline"/> : null} 定时发布
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white text-sm font-semibold rounded-xl hover:bg-[#D97706] disabled:opacity-50">
            <Save className="w-4 h-4" /> 立即发布
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="爆料标题" className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-lg font-bold outline-none focus:border-[#F59E0B]/40" />
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="一句话摘要（首页展示）" rows={2} className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] outline-none focus:border-[#F59E0B]/40 text-sm resize-none" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="详细内容（Markdown）" rows={16} className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] outline-none focus:border-[#F59E0B]/40 text-sm font-mono resize-y" />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#F1F5F9]">爆料设置</h3>
            <div>
              <label className="text-xs text-[#64748B]">可信度</label>
              <select value={credibility} onChange={(e) => setCredibility(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
                <option value="confirmed">已确认</option><option value="likely">高可信</option><option value="rumor">传闻</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[#64748B]">关联游戏</label>
              <input type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="例如: 归唐" className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#64748B]">来源</label>
              <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="例如: 内部消息" className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-[#64748B]">定时发布 (可选)</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
