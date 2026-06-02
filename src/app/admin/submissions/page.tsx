"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";

const TIERS = ["free", "silver", "gold", "diamond"];

export default function SubmissionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [reward, setReward] = useState("silver");

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    const { data } = await supabase.from("anonymous_submissions").select("*").order("created_at", { ascending: false });
    setSubs(data || []); setLoading(false);
  };

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase.from("anonymous_submissions").update({
      status, reviewer_note: note || null,
      reward_tier: status === "approved" ? reward : null,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    await supabase.from("admin_logs").insert({ action: `review_submission_${status}`, detail: id, user_id: userId });
    setSelected(null); setNote(""); loadSubs();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">匿名投稿审核</h1>
        <p className="text-sm text-[#64748B] mt-1">待审核: {subs.filter(s => s.status === "pending").length} 条</p>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div> : (
        <div className="space-y-4">
          {subs.map(s => (
            <div key={s.id} className={`glass-card p-5 cursor-pointer hover:border-[#06B6D4]/20 transition-all ${selected?.id === s.id ? "border-[#06B6D4]/30" : ""}`} onClick={() => setSelected(selected?.id === s.id ? null : s)}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#F1F5F9]">{s.title}</h3>
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${s.status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : s.status === "approved" ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>
                  {s.status === "pending" ? "待审核" : s.status === "approved" ? "已通过" : "已拒绝"}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8] line-clamp-2 mb-2">{s.content}</p>
              <div className="flex gap-3 text-xs text-[#64748B]">
                <span>游戏: {s.game_name || "-"}</span><span>可信度: {s.credibility}</span><span>{new Date(s.created_at).toLocaleDateString("zh-CN")}</span>
              </div>

              {/* Review actions */}
              {selected?.id === s.id && s.status === "pending" && (
                <div className="mt-4 pt-4 border-t border-[rgba(30,41,59,0.3)] space-y-3" onClick={e => e.stopPropagation()}>
                  <div>
                    <label className="text-xs text-[#64748B]">备注</label>
                    <input value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-sm text-[#F1F5F9] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-[#64748B]">奖励会员等级</label>
                    <select value={reward} onChange={e => setReward(e.target.value)} className="w-full px-3 py-2 mt-1 rounded-lg bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-sm text-[#F1F5F9] outline-none">
                      {TIERS.filter(t => t !== "free").map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(s.id, "approved")} className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-xl"><CheckCircle className="w-4 h-4" /> 通过并奖励</button>
                    <button onClick={() => handleReview(s.id, "rejected")} className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] text-white text-sm font-semibold rounded-xl"><XCircle className="w-4 h-4" /> 拒绝</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
