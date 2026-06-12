"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Loader2, Upload, X, Globe, Star, Crown, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getUserLevel, canSubmitContent, isColdStart } from "@/lib/auth";
import type { MembershipLevel } from "@/lib/auth";
import type { ContentLevel, ArticleCategory } from "@/types";

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: "analysis", label: "深度分析" }, { value: "leak", label: "独家爆料" },
  { value: "review", label: "游戏评测" }, { value: "preview", label: "前瞻" },
  { value: "news", label: "新闻资讯" }, { value: "opinion", label: "观点评论" },
  { value: "video", label: "视频内容" }, { value: "misc", label: "其他" },
];

const CONTENT_LEVELS: { value: ContentLevel; label: string; icon: typeof Globe }[] = [
  { value: "free", label: "免费内容", icon: Globe },
  { value: "gold", label: "黄金内容", icon: Star },
  { value: "diamond", label: "钻石内容", icon: Crown },
];

export default function SubmitPage() {
  const router = useRouter();
  const [userLevel, setUserLevel] = useState<MembershipLevel | null>(null);
  const [coldStart, setColdStart] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentLevel, setContentLevel] = useState<ContentLevel>("free");
  const [category, setCategory] = useState<ArticleCategory>("analysis");
  const [gameName, setGameName] = useState("");
  const [tags, setTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {(async () => {
    const level = await getUserLevel(); const cs = await isColdStart();
    setUserLevel(level); setColdStart(cs); setAuthLoading(false);
    if (cs && level !== "diamond") setError("冷启动期间仅钻石会员可投稿");
    else if (level === "free") setError("仅黄金或钻石会员可投稿");
  })();}, []);

  const canSubmit = useCallback((level: ContentLevel): boolean => {
    if (!userLevel) return false;
    if (coldStart) return userLevel === "diamond";
    return canSubmitContent(userLevel, level);
  }, [userLevel, coldStart]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError("请输入标题"); return; }
    if (!content.trim()) { setError("请输入内容"); return; }
    if (!canSubmit(contentLevel)) { setError("你的会员等级无法投稿该等级内容"); return; }
    setSubmitting(true); setError("");
    try {
      let coverUrl = "";
      if (coverFile) {
        const { data: presignData } = await supabase.functions.invoke("upload-presign", {
          body: { fileName: `ugc/${Date.now()}-${coverFile.name}`, contentType: coverFile.type }});
        if (presignData?.url) {
          await fetch(presignData.url, { method: "PUT", body: coverFile, headers: { "Content-Type": coverFile.type } });
          coverUrl = presignData.publicUrl || "";
        }
      }
      const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      const { error: submitErr } = await supabase.from("ugc_submissions").insert({
        title: title.trim(), content: content.trim(), cover_image: coverUrl || null,
        category, content_level: contentLevel, game_name: gameName.trim() || null,
        tags: tagArray, status: "pending",
      });
      if (submitErr) throw new Error(submitErr.message);
      setDone(true);
    } catch (e: any) { setError(e.message || "提交失败"); }
    finally { setSubmitting(false); }
  };

  if (authLoading) return <div className="pt-20 pb-20 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#64748B]" /></div>;

  if (done) return (
    <div className="pt-20 pb-20"><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-4"><Send className="w-8 h-8 text-[#10B981]" /></div>
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">投稿成功！</h2>
      <p className="text-[#94A3B8] mb-2">你的内容已提交审核，通过后将在对应内容区发布。</p>
      <p className="text-sm text-[#64748B]">审核通常在 {contentLevel === "diamond" ? "12" : "24"} 小时内完成。</p>
    </motion.div></div>
  );

  return (
    <div className="pt-20 pb-20"><div className="max-w-3xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] flex items-center justify-center"><Send className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-black text-[#F1F5F9]">创作者投稿</h1>
          <p className="text-sm text-[#64748B]"><span className={`font-medium ${userLevel === "diamond" ? "text-[#3B82F6]" : "text-[#F59E0B]"}`}>{userLevel === "diamond" ? "钻石会员" : "黄金会员"}</span>{coldStart && <span className="text-amber-400 ml-2">· 冷启动模式</span>}</p></div>
      </div>
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
        <div><p className="text-sm text-[#EF4444]">{error}</p>
          {error.includes("升级") && <button onClick={() => router.push("/member")} className="mt-2 px-4 py-1.5 text-xs font-semibold bg-[#EF4444] text-white rounded-lg">去升级</button>}</div>
      </motion.div>}
      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">内容等级</label>
          <div className="grid grid-cols-3 gap-3">
            {CONTENT_LEVELS.map(({ value, label, icon: Icon }) => {
              const allowed = canSubmit(value);
              return <button key={value} type="button" disabled={!allowed} onClick={() => allowed && setContentLevel(value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  contentLevel === value
                    ? value === "diamond" ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                    : value === "gold" ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "border-[#64748B] bg-[#64748B]/10 text-[#F1F5F9]"
                    : allowed ? "border-[#334155] text-[#94A3B8] hover:border-[#475569]"
                    : "border-[#1E293B] text-[#475569] opacity-50 cursor-not-allowed"
                }`}><Icon className="w-4 h-4" />{label}</button>;
            })}
          </div>
        </div>
        <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">标题 *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="给你的内容起个好标题..."
            className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
        <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">正文（Markdown）*</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={14}
            placeholder="支持 Markdown 格式..."
            className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm font-mono outline-none focus:border-[#F59E0B]/40 resize-y" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">分类</label>
            <select value={category} onChange={e => setCategory(e.target.value as ArticleCategory)}
              className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">关联游戏</label>
            <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} placeholder="输入游戏名称..."
              className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">标签（逗号分隔）</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="如：黑神话, 影之刃零"
              className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
          <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">封面图（可选）</label>
            <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all ${coverPreview ? "border-[#10B981]/40 bg-[#10B981]/5" : "border-[#334155] hover:border-[#475569] bg-[#1E293B]/20"}`}>
              {coverPreview ? <div className="flex items-center gap-2"><img src={coverPreview} className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm text-[#10B981]">已选择</span></div>
                : <span className="text-sm text-[#64748B] flex items-center gap-2"><Upload className="w-4 h-4" />点击上传</span>}
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }} className="hidden" /></label></div>
        </div>
        <div className="pt-2 border-t border-[#1E293B]">
          <button onClick={handleSubmit} disabled={submitting || !!error && !error.includes("升级")}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 ${
              submitting ? "bg-[#475569]" : error && !error.includes("升级") ? "bg-[#334155] text-[#64748B] cursor-not-allowed" : "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:shadow-[0_0_28px_rgba(245,158,11,0.2)]"}`}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{submitting ? "提交中..." : "提交审核"}</button>
        </div>
      </div>
    </div></div>
  );
}
