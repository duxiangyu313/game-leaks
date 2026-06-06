"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ReviewFormProps {
  gameId: string;
  onSuccess: (review: any) => void;
}

export default function ReviewForm({ gameId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(8);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [playtime, setPlaytime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) { setError("请输入评测内容"); return; }
    setSubmitting(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("请先登录"); setSubmitting(false); return; }
    const { data, error: insertError } = await supabase.from("game_reviews").insert({
      game_id: gameId, user_id: user.id, rating, title, content, pros, cons,
      playtime_hours: playtime ? parseInt(playtime) : null,
    }).select().single();
    if (insertError) {
      if (insertError.message.includes("duplicate")) setError("你已经为这款游戏写过评测了");
      else setError("发布失败: " + insertError.message);
    } else if (data) {
      onSuccess(data);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#64748B]">评分:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
            <button key={s} onClick={() => setRating(s)}>
              <Star className={`w-5 h-5 ${s <= rating ? "fill-[#F5A623] text-[#F5A623]" : "text-[#64748B]"}`} />
            </button>
          ))}
        </div>
        <span className="text-lg font-black text-[#F5A623]">{rating}/10</span>
      </div>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="评测标题（可选）" className="w-full px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="详细评测内容..." className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="text" value={pros} onChange={e => setPros(e.target.value)} placeholder="优点（逗号分隔）" className="px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
        <input type="text" value={cons} onChange={e => setCons(e.target.value)} placeholder="缺点（逗号分隔）" className="px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
        <input type="number" value={playtime} onChange={e => setPlaytime(e.target.value)} placeholder="游戏时长（小时）" className="px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
      </div>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50">
        {submitting ? "发布中..." : "发布评测"}
      </button>
    </div>
  );
}
