"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Send, Shield, Loader2, CheckCircle } from "lucide-react";

export default function SubmitPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [gameName, setGameName] = useState("");
  const [credibility, setCredibility] = useState("rumor");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return alert("请输入标题");
    setSubmitting(true);
    await supabase.from("anonymous_submissions").insert({
      title, content, game_name: gameName || null, credibility,
      submitter_fingerprint: "anon-" + Math.random().toString(36).slice(2, 10),
    });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="pt-20 pb-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">投稿成功！</h2>
          <p className="text-[#94A3B8] mb-4">你的爆料已匿名提交，审核通过后将发布。</p>
          <p className="text-sm text-[#64748B]">如果被采纳，你将获得会员奖励 🎁</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-[#06B6D4]" />
          <div>
            <h1 className="text-2xl font-black text-[#F1F5F9]">匿名爆料投稿</h1>
            <p className="text-sm text-[#64748B]">你的身份将完全保密</p>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">爆料标题 *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40" />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">详细内容</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40 resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">关联游戏</label>
              <input type="text" value={gameName} onChange={e => setGameName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">可信度</label>
              <select value={credibility} onChange={e => setCredibility(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
                <option value="rumor">传闻</option><option value="likely">高可信</option><option value="confirmed">已确认</option>
              </select>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "提交中..." : "匿名提交"}
          </button>
        </div>
      </div>
    </div>
  );
}
