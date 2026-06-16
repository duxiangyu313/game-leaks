"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Upload, X, Globe, Star, Crown, AlertTriangle, FileText, Flame, Gamepad, DollarSign, Gift, Play } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getUserLevel, canSubmitContent, isColdStart } from "@/lib/auth";
import type { MembershipLevel } from "@/lib/auth";
import type { ContentLevel, ArticleCategory } from "@/types";

type SubmitType = "article" | "leak" | "game_nomination" | "video";

const SUBMIT_TYPES: { key: SubmitType; icon: typeof FileText; label: string; desc: string }[] = [
  { key: "article", icon: FileText, label: "文章投稿", desc: "深度分析、评测、观点文章" },
  { key: "leak", icon: Flame, label: "快捷爆料", desc: "新闻线索、内幕消息" },
  { key: "game_nomination", icon: Gamepad, label: "游戏提名", desc: "推荐新游戏入库" },
  { key: "video", icon: Play, label: "视频投稿", desc: "B站/YouTube 嵌入 + 文字解读" },
];

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: "analysis", label: "深度分析" }, { value: "leak", label: "独家爆料" },
  { value: "review", label: "游戏评测" }, { value: "preview", label: "前瞻" },
  { value: "news", label: "新闻资讯" }, { value: "opinion", label: "观点评论" },
  { value: "video", label: "视频内容" }, { value: "misc", label: "其他" },
];

const CREDIBILITIES = [
  { value: "rumor", label: "传闻", desc: "未经证实的小道消息" },
  { value: "likely", label: "可靠", desc: "有可靠信源佐证" },
  { value: "confirmed", label: "确认", desc: "官方已确认" },
];

const CONTENT_LEVELS: { value: ContentLevel; label: string; icon: typeof Globe }[] = [
  { value: "free", label: "免费内容", icon: Globe },
  { value: "gold", label: "黄金内容", icon: Star },
  { value: "diamond", label: "钻石内容", icon: Crown },
];

export default function SubmitPage() {
  const router = useRouter();
  const [submitType, setSubmitType] = useState<SubmitType>("article");
  const [userLevel, setUserLevel] = useState<MembershipLevel | null>(null);
  const [coldStart, setColdStart] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // common fields
  const [contentLevel, setContentLevel] = useState<ContentLevel>("free");
  const [gameName, setGameName] = useState("");
  const [tags, setTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  // article fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("analysis");

  // leak fields
  const [leakTitle, setLeakTitle] = useState("");
  const [leakSource, setLeakSource] = useState("");
  const [leakCredibility, setLeakCredibility] = useState("likely");
  const [leakDesc, setLeakDesc] = useState("");

  // game nomination fields
  const [nomGameName, setNomGameName] = useState("");
  const [nomDeveloper, setNomDeveloper] = useState("");
  const [nomDesc, setNomDesc] = useState("");
  const [nomRelease, setNomRelease] = useState("");

  // video fields
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");

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
    setError("");

    // validation per type
    if (submitType === "article") {
      if (!title.trim()) { setError("请输入标题"); return; }
      if (!content.trim()) { setError("请输入正文"); return; }
    } else if (submitType === "leak") {
      if (!leakTitle.trim()) { setError("请输入爆料标题"); return; }
      if (!leakDesc.trim()) { setError("请输入爆料描述"); return; }
    } else if (submitType === "game_nomination") {
      if (!nomGameName.trim()) { setError("请输入游戏名称"); return; }
      if (!nomDesc.trim()) { setError("请输入游戏描述"); return; }
    } else if (submitType === "video") {
      if (!videoUrl.trim()) { setError("请输入视频链接"); return; }
      if (!videoTitle.trim()) { setError("请输入视频标题"); return; }
    }
    // video投稿 contentLevel 固定 free（视频嵌入免费看，文字解读可设付费）
    const actualLevel = submitType === "video" ? "free" : contentLevel;
    if (!canSubmit(actualLevel)) { setError("你的会员等级无法投稿该等级内容"); return; }

    setSubmitting(true);
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

      // build submission payload based on type
      let payload: Record<string, unknown> = {
        content_level: contentLevel, tags: tagArray, status: "pending",
        cover_image: coverUrl || null,
      };

      if (submitType === "article") {
        payload.title = title.trim();
        payload.content = content.trim();
        payload.category = category;
        payload.game_name = gameName.trim() || null;
      } else if (submitType === "leak") {
        payload.title = leakTitle.trim();
        payload.content = `**来源**: ${leakSource.trim() || "未提供"}\n**可信度**: ${CREDIBILITIES.find(c => c.value === leakCredibility)?.label || leakCredibility}\n\n${leakDesc.trim()}`;
        payload.category = "leak";
        payload.game_name = gameName.trim() || null;
      } else if (submitType === "game_nomination") {
        payload.title = `[游戏提名] ${nomGameName.trim()}`;
        payload.content = `**开发商**: ${nomDeveloper.trim() || "未知"}\n**预计发售**: ${nomRelease.trim() || "未知"}\n\n${nomDesc.trim()}`;
        payload.category = "misc";
        payload.game_name = nomGameName.trim();
      } else if (submitType === "video") {
        payload.title = videoTitle.trim();
        payload.content = `**视频链接**: ${videoUrl.trim()}\n\n${videoDesc.trim() || ""}`;
        payload.category = "video";
        payload.content_level = "free";
        payload.game_name = gameName.trim() || null;
      }

      const { error: submitErr } = await supabase.from("ugc_submissions").insert(payload);
      if (submitErr) throw new Error(submitErr.message);
      setDone(true);
    } catch (e: any) { setError(e.message || "提交失败"); }
    finally { setSubmitting(false); }
  };

  const switchType = (type: SubmitType) => {
    setSubmitType(type);
    setError("");
    if (type !== "article") setContentLevel("free");
  };

  if (authLoading) return <div className="pt-20 pb-20 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#64748B]" /></div>;

  if (done) return (
    <div className="pt-20 pb-20"><motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-4"><Send className="w-8 h-8 text-[#10B981]" /></div>
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">投稿成功！</h2>
      <p className="text-[#94A3B8] mb-2">你的内容已提交审核，通过后将发布。</p>
      <p className="text-sm text-[#64748B]">审核通常在 {contentLevel === "diamond" ? "12" : "24"} 小时内完成。</p>
      <button onClick={() => { setDone(false); switchType("article"); }} className="mt-6 text-sm text-[#3B82F6] hover:underline">继续投稿</button>
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

      {/* ── Submission type selector ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {SUBMIT_TYPES.map(({ key, icon: Icon, label, desc }) => (
          <button key={key} type="button" onClick={() => switchType(key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              submitType === key
                ? "border-[#F59E0B] bg-[#F59E0B]/5"
                : "border-[#1E293B] bg-[#1E293B]/20 hover:border-[#334155]"}`}>
            <Icon className={`w-5 h-5 mb-2 ${submitType === key ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
            <div className={`text-sm font-semibold ${submitType === key ? "text-[#F1F5F9]" : "text-[#94A3B8]"}`}>{label}</div>
            <div className="text-[10px] text-[#475569] mt-0.5">{desc}</div>
          </button>
        ))}
      </div>

      <div className="glass-card p-6 space-y-5">
        <AnimatePresence mode="wait">

          {/* ═══ ARTICLE ═══ */}
          {submitType === "article" && <motion.div key="article" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
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
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="给你的文章起个好标题..."
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
          </motion.div>}

          {/* ═══ LEAK ═══ */}
          {submitType === "leak" && <motion.div key="leak" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/10">
              <Flame className="w-4 h-4 text-[#F59E0B]" />
              <p className="text-xs text-[#F59E0B]">快捷爆料只需填写关键信息，无需长篇大论</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#10B981]/5 border border-[#10B981]/10 flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#10B981]">审核通过可获得现金奖励</p>
                <p className="text-xs text-[#64748B] mt-1">传闻 ¥3 · 可靠 ¥5 · 确认 ¥10　|　热门追加：1000 浏览 +¥5，5000 浏览 +¥20　|　满 ¥20 可提现</p>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">爆料标题 *</label>
              <input type="text" value={leakTitle} onChange={e => setLeakTitle(e.target.value)}
                placeholder="一句话概括，如：影之刃零新Trailer将于下周发布"
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">来源链接</label>
                <input type="url" value={leakSource} onChange={e => setLeakSource(e.target.value)}
                  placeholder="https:// 或留空"
                  className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
              <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">可信度</label>
                <select value={leakCredibility} onChange={e => setLeakCredibility(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40">
                  {CREDIBILITIES.map(c => <option key={c.value} value={c.value}>{c.label} — {c.desc}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">详细描述 *</label>
              <textarea value={leakDesc} onChange={e => setLeakDesc(e.target.value)} rows={6}
                placeholder="补充更多细节：发生了什么？从哪听说的？有何影响？..."
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40 resize-y" /></div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">关联游戏</label>
              <input type="text" value={gameName} onChange={e => setGameName(e.target.value)} placeholder="输入游戏名称..."
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
          </motion.div>}

          {/* ═══ GAME NOMINATION ═══ */}
          {submitType === "game_nomination" && <motion.div key="nomination" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#06B6D4]/5 border border-[#06B6D4]/10">
              <Gamepad className="w-4 h-4 text-[#06B6D4]" />
              <p className="text-xs text-[#06B6D4]">推荐一款尚未收录的游戏，审核通过后将加入游戏库</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 flex items-start gap-3">
              <Gift className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#8B5CF6]">审核通过送会员延期</p>
                <p className="text-xs text-[#64748B] mt-1">提名通过获 +3 天会员延期　|　本月限额 10 人　|　重复提名不发放</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">游戏名称 *</label>
                <input type="text" value={nomGameName} onChange={e => setNomGameName(e.target.value)}
                  placeholder="如：湮灭之潮"
                  className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40" /></div>
              <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">开发商</label>
                <input type="text" value={nomDeveloper} onChange={e => setNomDeveloper(e.target.value)}
                  placeholder="如：游戏科学"
                  className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40" /></div>
            </div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">游戏简介 *</label>
              <textarea value={nomDesc} onChange={e => setNomDesc(e.target.value)} rows={4}
                placeholder="简单介绍这款游戏的类型、玩法、亮点..."
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40 resize-y" /></div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">预计发售日期</label>
              <input type="text" value={nomRelease} onChange={e => setNomRelease(e.target.value)}
                placeholder="如：2026年Q3 或 2026年9月"
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#06B6D4]/40" /></div>
          </motion.div>}

          {/* ═══ VIDEO ═══ */}
          {submitType === "video" && <motion.div key="video" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#E94560]/5 border border-[#E94560]/10">
              <Play className="w-4 h-4 text-[#E94560]" />
              <p className="text-xs text-[#E94560]">粘贴 B站/YouTube 链接 + 写你的独家文字解读</p>
            </div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">视频链接 *</label>
              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.bilibili.com/video/BVxxx 或 https://youtube.com/watch?v=xxx"
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#E94560]/40" /></div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">视频标题 *</label>
              <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)}
                placeholder="给你的视频起个标题..."
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#E94560]/40" /></div>
            <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">文字解读（可选，支持 Markdown）</label>
              <textarea value={videoDesc} onChange={e => setVideoDesc(e.target.value)} rows={5}
                placeholder="写一段独家解读——视频在哪都能看，但你的分析才是核心价值。这里可以设为付费内容。"
                className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#E94560]/40 resize-y" /></div>
            <div className="px-4 py-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/10 flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#F59E0B]">视频投稿奖励</p>
                <p className="text-xs text-[#64748B] mt-1">审核通过后 ¥2 现金奖励 + 文字解读部分浏览量高可获追投</p>
              </div>
            </div>
          </motion.div>}

        </AnimatePresence>

        {/* ── Common fields ── */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1E293B]">
          <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">标签（逗号分隔）</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="如：黑神话, 影之刃零"
              className="w-full px-4 py-3 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none focus:border-[#F59E0B]/40" /></div>
          <div><label className="block text-sm font-medium text-[#94A3B8] mb-1.5">封面图（可选）</label>
            <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all ${coverPreview ? "border-[#10B981]/40 bg-[#10B981]/5" : "border-[#334155] hover:border-[#475569] bg-[#1E293B]/20"}`}>
              {coverPreview ? <div className="flex items-center gap-2"><img src={coverPreview} alt="封面预览" className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm text-[#10B981]">已选择</span></div>
                : <span className="text-sm text-[#64748B] flex items-center gap-2"><Upload className="w-4 h-4" />点击上传</span>}
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }} className="hidden" /></label></div>
        </div>

        <div className="pt-2 border-t border-[#1E293B]">
          <button onClick={handleSubmit} disabled={submitting || (!!error && !error.includes("升级"))}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 ${
              submitting ? "bg-[#475569]" : error && !error.includes("升级") ? "bg-[#334155] text-[#64748B] cursor-not-allowed" : "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:shadow-[0_0_28px_rgba(245,158,11,0.2)]"}`}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{submitting ? "提交中..." : "提交审核"}</button>
        </div>
      </div>
    </div></div>
  );
}
