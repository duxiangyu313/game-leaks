"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Clock, Tag, Shield, Lock, Crown, Send, Loader2, Eye, Share2 } from "lucide-react";
import { getUserLevel, hasAccess, getVisibilityLabel, getVisibilityColor, getVisibilityBg, getUpgradeTier, type MembershipLevel, type Visibility } from "@/lib/auth";

function DetailContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [article, setArticle] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<MembershipLevel>("free");
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("articles").select("*").eq("id", id).single(),
      supabase.from("post_comments").select("*").eq("article_id", id).order("created_at", { ascending: false }),
      getUserLevel(),
    ]).then(([{ data: a }, { data: c }, level]) => {
      setArticle(a);
      setComments(c || []);
      setUserLevel(level);
      setLoading(false);
    });
  }, [id]);

  // 禁止右键和快捷键
  useEffect(() => {
    if (!article || article.required_tier === "free") return;
    const block = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "s" || e.key === "p")) || e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("keydown", blockKeys);
    return () => { document.removeEventListener("contextmenu", block); document.removeEventListener("keydown", blockKeys); };
  }, [article]);

  // 动态水印
  useEffect(() => {
    if (!article || article.required_tier === "free" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.font = "14px sans-serif";
      const uid = userLevel === "free" ? "guest" : userLevel;
      const text = `${uid} | ${new Date().toLocaleString("zh-CN")}`;
      const w = ctx.measureText(text).width + 100;
      for (let y = 50; y < canvas.height; y += 70) {
        for (let x = -w; x < canvas.width + w; x += w) {
          ctx.save(); ctx.translate(x + (y % 140 === 0 ? 40 : 0), y); ctx.rotate(-0.25); ctx.fillText(text, 0, 0); ctx.restore();
        }
      }
      requestAnimationFrame(render);
    };
    render();
  }, [article, userLevel]);

  // 提交评论
  const handleComment = async () => {
    if (!commentText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("请先登录");
    setSubmittingComment(true);
    const { data } = await supabase.from("post_comments").insert({ article_id: id, user_id: user.id, content: commentText }).select().single();
    if (data) setComments(prev => [data, ...prev]);
    setCommentText(""); setSubmittingComment(false);
  };

  // 复制分享链接
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("链接已复制");
  };

  if (loading) return (
    <div className="pt-20 pb-20"><div className="max-w-3xl mx-auto px-4 animate-pulse"><div className="h-8 w-64 bg-[#1E293B]/30 rounded mb-4" /><div className="h-96 bg-[#1E293B]/20 rounded-xl" /></div></div>
  );
  if (!article) return <div className="pt-20 pb-20 text-center text-[#64748B]">文章未找到</div>;

  const visibility = (article.required_tier || "free") as Visibility;
  const canRead = hasAccess(userLevel, visibility);
  const upgradeTier = canRead ? null : getUpgradeTier(userLevel, visibility);
  const isPaid = visibility !== "public";
  const readTime = Math.max(1, Math.ceil((article.content?.length || 0) / 500));

  return (
    <div className="pt-20 pb-20">
      {/* Watermark canvas */}
      {isPaid && <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[999]" />}

      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <Link href="/analysis" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </Link>

        {/* Video embed */}
        {article.category === "video" && article.content?.includes("<iframe") && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-[rgba(30,41,59,0.4)]" dangerouslySetInnerHTML={{ __html: (article.content.match(/<iframe[^>]*><\/iframe>/)?.[0] || "").replace("<iframe", '<iframe loading="lazy"') }} />
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">
            {article.category === "video" ? "视频" : article.category === "analysis" ? "深度分析" : article.category === "review" ? "评测" : article.category === "preview" ? "前瞻" : "文章"}
          </span>
          {isPaid && (
            <span className={`px-2.5 py-0.5 text-xs rounded-full flex items-center gap-1 ${getVisibilityBg(visibility)} ${getVisibilityColor(visibility)}`}>
              <Lock className="w-3 h-3" /> {getVisibilityLabel(visibility)}可见
            </span>
          )}
          <span className="text-xs text-[#64748B] flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.created_at).toLocaleDateString("zh-CN")}</span>
          <span className="text-xs text-[#64748B] flex items-center gap-1"><Eye className="w-3 h-3" /> {readTime} 分钟阅读</span>
          <button onClick={handleShare} className="text-xs text-[#64748B] hover:text-[#06B6D4] flex items-center gap-1"><Share2 className="w-3 h-3" /> 分享</button>
        </div>

        <h1 className="text-3xl font-black text-[#F1F5F9] mb-8">{article.title}</h1>

        {/* Content */}
        <div className="relative">
          <div className="text-[#c4bfb6] leading-relaxed text-[17px] space-y-4">
            {renderContent(article.content?.replace(/<iframe[^>]*><\/iframe>/g, ""), canRead)}
          </div>

          {/* Paywall */}
          {!canRead && (
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent flex flex-col items-center justify-end pb-8">
              <Lock className="w-10 h-10 text-[#F59E0B] mb-3" />
              <p className="text-lg font-bold text-[#F1F5F9] mb-1">此内容仅{getVisibilityLabel(visibility)}可见</p>
              <p className="text-sm text-[#94A3B8] mb-4">你当前的会员等级：{userLevel === "free" ? "普通用户" : userLevel}</p>
              <Link href="/member"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all">
                <Crown className="w-4 h-4" />
                升级到{getVisibilityLabel(upgradeTier as Visibility || visibility)}
              </Link>
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[rgba(30,41,59,0.4)] flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-[#64748B]" />
            {article.tags.map((t: string) => <span key={t} className="text-xs text-[#64748B] bg-[#1E293B]/40 px-2.5 py-1 rounded-full">{t}</span>)}
          </div>
        )}

        {/* Comments */}
        <div className="mt-12 pt-8 border-t border-[rgba(30,41,59,0.4)]">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-6">评论 ({comments.length})</h3>

          {/* Comment form */}
          <div className="glass-card p-4 mb-6">
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写下你的评论..." rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] text-sm outline-none resize-y mb-3" />
            <button onClick={handleComment} disabled={submittingComment || !commentText.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50 transition-all">
              {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 发布评论
            </button>
          </div>

          {comments.length === 0 && <p className="text-[#64748B] text-center py-8">暂无评论</p>}
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F1F5F9]">{c.user_id?.slice(0, 8)}</span>
                  <span className="text-xs text-[#64748B]">{new Date(c.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
                <p className="text-sm text-[#94A3B8]">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 渲染内容：非会员只显示前20% */
function renderContent(content: string, canRead: boolean) {
  const lines = content?.split("\n") || [];
  const visibleLines = canRead ? lines : lines.slice(0, Math.ceil(lines.length * 0.2));

  return visibleLines.map((line: string, i: number) => {
    if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-[#F1F5F9] mt-10 mb-4 pl-3 border-l-3 border-[#06B6D4]">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-[#F1F5F9] mt-8 mb-3">{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <li key={i} className="ml-4 text-[#94A3B8]">{line.slice(2)}</li>;
    if (line.startsWith("**")) {
      const parts = line.split("**");
      return <p key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-[#F1F5F9]">{p}</strong> : p)}</p>;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i}>{line}</p>;
  });
}

export default function ArticleDetailPage() {
  return <Suspense fallback={<div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>}><DetailContent /></Suspense>;
}
