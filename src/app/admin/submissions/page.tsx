"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import type { UgcSubmission, ContentLevel } from "@/types";

const CL_LABEL: Record<ContentLevel, string> = { free: "免费", gold: "黄金", diamond: "钻石" };
const CL_COLOR: Record<ContentLevel, string> = { free: "bg-gray-500/10 text-gray-400", gold: "bg-amber-500/10 text-amber-400", diamond: "bg-blue-500/10 text-blue-400" };

export default function SubmissionsPage() {
  const [subs, setSubs] = useState<UgcSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UgcSubmission | null>(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("ugc_submissions").select("*").order("submitted_at", { ascending: false });
    setSubs((data || []) as UgcSubmission[]); setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { error } = await supabase.from("ugc_submissions").update({
      status, reviewer_id: userId, review_note: note || null, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (!error) await supabase.from("admin_logs").insert({ action: `ugc_review_${status}`, detail: JSON.stringify({ submission_id: id, note }), user_id: userId });
    setSelected(null); setNote(""); setActionLoading(false); load();
  };

  const pending = subs.filter(s => s.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-[#F1F5F9]">UGC 投稿审核</h1>
          <p className="text-sm text-[#64748B] mt-1">待审核: <span className="text-[#F59E0B] font-semibold">{pending}</span> 条</p></div>
        <button onClick={load} className="px-3 py-1.5 text-xs rounded-lg border border-[#334155] text-[#94A3B8] hover:text-[#F1F5F9]">刷新</button>
      </div>
      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" /></div> : (
        <div className="space-y-4">
          {subs.map(s => (
            <div key={s.id} className={`glass-card p-5 cursor-pointer hover:border-[#3B82F6]/20 transition-all ${selected?.id === s.id ? "border-[#3B82F6]/30" : ""}`}
              onClick={() => setSelected(selected?.id === s.id ? null : s)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2"><h3 className="font-semibold text-[#F1F5F9]">{s.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full ${CL_COLOR[s.contentLevel]}`}>{CL_LABEL[s.contentLevel]}</span></div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                  s.status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : s.status === "approved" ? "bg-[#10B981]/10 text-[#10B981]" : s.status === "rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#3B82F6]/10 text-[#3B82F6]"}`}>
                  {s.status === "pending" ? "待审核" : s.status === "approved" ? "已通过" : s.status === "rejected" ? "已拒绝" : "需修改"}</span>
              </div>
              <p className="text-sm text-[#94A3B8] line-clamp-2 mb-2">{s.content}</p>
              <div className="flex gap-3 text-xs text-[#64748B]"><span>游戏: {s.gameName || "-"}</span><span>分类: {s.category}</span><span>{new Date(s.submittedAt).toLocaleDateString("zh-CN")}</span></div>
              {selected?.id === s.id && s.status === "pending" && (
                <div className="mt-4 pt-4 border-t border-[#1E293B] space-y-3" onClick={e => e.stopPropagation()}>
                  <div><label className="block text-xs text-[#64748B] mb-1">审核批注</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="通过/拒绝理由..."
                      className="w-full px-3 py-2 rounded-lg bg-[#1E293B]/40 border border-[#334155] text-[#F1F5F9] text-xs outline-none focus:border-[#3B82F6]/40 resize-none" /></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(s.id, "approved")} disabled={actionLoading}
                      className="flex-1 py-2 rounded-lg bg-[#10B981]/15 text-[#10B981] text-sm font-semibold hover:bg-[#10B981]/25 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" />通过并发布</button>
                    <button onClick={() => handleReview(s.id, "rejected")} disabled={actionLoading}
                      className="flex-1 py-2 rounded-lg bg-[#EF4444]/15 text-[#EF4444] text-sm font-semibold hover:bg-[#EF4444]/25 flex items-center justify-center gap-2"><XCircle className="w-4 h-4" />拒绝</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {subs.length === 0 && <div className="text-center py-16 text-[#64748B]"><Eye className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">暂无投稿</p></div>}
        </div>
      )}
    </div>
  );
}
