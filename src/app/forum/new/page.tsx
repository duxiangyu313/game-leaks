"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = [
  { value: "general", label: "综合讨论" },
  { value: "leaks", label: "爆料交流" },
  { value: "review", label: "游戏评测" },
  { value: "tech", label: "技术交流" },
  { value: "feedback", label: "建议反馈" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) { setError("请输入标题"); return; }
    if (!content.trim()) { setError("请输入内容"); return; }

    setSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("请先登录"); setSubmitting(false); return; }

    const { error: insertError } = await supabase.from("forum_posts").insert({
      title, content, category,
      user_id: user.id,
      author_name: user.email?.split("@")[0] || "匿名用户",
    });

    if (insertError) {
      setError("发布失败: " + insertError.message);
    } else {
      router.push("/forum/" + category);
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/forum" className="text-[#64748B] hover:text-[#F1F5F9]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#F1F5F9]">发布新帖</h1>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">板块</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">标题 *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="一句话说清楚你要讨论什么..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40" />
          </div>

          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">内容 *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
              placeholder="详细描述你的观点..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40 resize-y" />
          </div>

          {error && <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-sm text-[#EF4444]">{error}</div>}

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "发布中..." : "发布帖子"}
          </button>
        </div>
      </div>
    </div>
  );
}
