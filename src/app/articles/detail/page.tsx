"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { getUserLevel, type MembershipLevel, type Visibility } from "@/lib/auth";
import { calculateReadingTime, calculateWordCount } from "@/lib/article-utils";

import type { InteractionCounts } from "@/types";
import ArticleTemplate from "@/components/article/ArticleTemplate";

function DetailContent() {
  const params = useSearchParams();
  const id = params.get("id");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [article, setArticle] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [comments, setComments] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<MembershipLevel>("free");
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [interactionCounts, setInteractionCounts] = useState<InteractionCounts>({
    likes: 0, bookmarks: 0, shares: 0, comments: 0,
    credibility_believe: 0, credibility_skeptical: 0,
  });
  const [userLiked, setUserLiked] = useState(false);
  const [userBookmarked, setUserBookmarked] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── SEO: 客户端更新 document.title 和 meta description ──
  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} · 国游爆料`;
    const desc = article.summary || article.title || "";
    let meta = document.querySelector("meta[name='description']");
    if (meta) { meta.setAttribute("content", desc); }
    else { meta = document.createElement("meta"); meta.setAttribute("name", "description"); meta.setAttribute("content", desc); document.head.appendChild(meta); }
  }, [article]);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const level = await getUserLevel();
      setUserLevel(level);

      const { data: a } = await supabase.from("articles").select("*").eq("id", id).single();
      setArticle(a);

      // 增加浏览量
      if (a) {
        supabase.from("articles").update({ view_count: (a.view_count || 0) + 1 }).eq("id", id).then();
      }

      const { data: c } = await supabase.from("post_comments").select("*").eq("article_id", id).order("created_at", { ascending: false });
      setComments(c || []);
      setInteractionCounts((prev) => ({ ...prev, comments: c?.length || 0 }));

      // 加载互动统计
      const { data: { user } } = await supabase.auth.getUser();
      if (user && a) {
        // 各项互动计数
        const types = ["like", "bookmark", "share", "credibility_believe", "credibility_skeptical"];
        for (const t of types) {
          const { count } = await supabase
            .from("article_interactions")
            .select("id", { count: "exact", head: true })
            .eq("article_id", id)
            .eq("interaction_type", t);
          setInteractionCounts((prev) => ({
            ...prev,
            [t]: count || 0,
            likes: t === "like" ? count || 0 : prev.likes,
            bookmarks: t === "bookmark" ? count || 0 : prev.bookmarks,
            shares: t === "share" ? count || 0 : prev.shares,
            credibility_believe: t === "credibility_believe" ? count || 0 : prev.credibility_believe,
            credibility_skeptical: t === "credibility_skeptical" ? count || 0 : prev.credibility_skeptical,
          }));
        }

        // 用户互动状态
        const { data: uLike } = await supabase.from("article_interactions").select("id").eq("article_id", id).eq("user_id", user.id).eq("interaction_type", "like").single();
        setUserLiked(!!uLike);

        const { data: uBookmark } = await supabase.from("article_interactions").select("id").eq("article_id", id).eq("user_id", user.id).eq("interaction_type", "bookmark").single();
        setUserBookmarked(!!uBookmark);
      }

      setLoading(false);
    };

    loadData();
  }, [id]);

  // 禁止右键和快捷键（付费文章）
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

  // 动态水印（付费文章）
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
    const { data } = await supabase.from("post_comments").insert({
      article_id: id, user_id: user.id, content: commentText
    }).select().single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data) setComments((prev: any[]) => [data, ...prev]);
    setCommentText("");
    setSubmittingComment(false);
  };

  // Loading
  if (loading) return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-[#1E293B]/30 rounded" />
        <div className="h-64 bg-[#1E293B]/20 rounded-xl" />
        <div className="h-8 w-3/4 bg-[#1E293B]/30 rounded" />
        <div className="h-4 w-full bg-[#1E293B]/20 rounded" />
        <div className="h-4 w-5/6 bg-[#1E293B]/20 rounded" />
        <div className="h-4 w-2/3 bg-[#1E293B]/20 rounded" />
      </div>
    </div>
  );

  // Not found
  if (!article) return (
    <div className="pt-20 pb-20 text-center text-[#64748B]">
      <p className="text-lg mb-2">文章未找到</p>
      <Link href="/analysis" className="text-[#06B6D4] text-sm hover:underline">返回文章列表</Link>
    </div>
  );

  const visibility = (article.required_tier || "public") as Visibility;
  const isPaid = visibility !== "public";

  return (
    <div className="pt-20 pb-20">
      {/* Watermark canvas */}
      {isPaid && <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[999]" />}

      {/* 返回链接 */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mb-6">
        <Link href="/analysis" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回文章列表
        </Link>
      </div>

      {/* 文章主体 — 使用新模板系统 */}
      <ArticleTemplate
        article={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content || "",
          coverImage: article.cover_image || "",
          category: article.category || "analysis",
          templateType: article.template_type,
          gameId: article.game_id,
          gameName: article.game_name,
          authorId: article.author_id,
          authorName: article.author_name,
          publishedAt: article.created_at,
          readTime: article.read_time || calculateReadingTime(article.content || ""),
          wordCount: article.word_count || calculateWordCount(article.content || ""),
          tags: article.tags || [],
          requiredTier: article.required_tier || "free",
          purchaseCount: article.purchase_count,
          credibilityScore: article.credibility_score,
          videoUrl: article.video_url,
          status: article.status || "published",
          viewCount: article.view_count,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
        }}
        membershipLevel={userLevel}
        interactionCounts={interactionCounts}
        userLiked={userLiked}
        userBookmarked={userBookmarked}
      />

      {/* ── 评论区域 ── */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-[rgba(30,41,59,0.4)]">
        <h3 className="text-lg font-bold text-[#F1F5F9] mb-6">
          评论 ({comments.length})
        </h3>

        {/* 评论输入 */}
        <div className="glass-card p-4 mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] text-sm outline-none resize-y mb-3"
          />
          <button
            onClick={handleComment}
            disabled={submittingComment || !commentText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50 transition-all"
          >
            {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            发布评论
          </button>
        </div>

        {/* 评论列表 */}
        {comments.length === 0 && (
          <p className="text-[#64748B] text-center py-8">暂无评论，来抢沙发吧</p>
        )}
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {comments.map((c: any) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#F1F5F9]">
                    {c.user_id?.slice(0, 8) || "匿名"}
                  </span>
                </div>
                <span className="text-xs text-[#64748B]">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString("zh-CN") : ""}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8]">{c.content}</p>
              {/* 段落级评论标识 */}
              {c.paragraph_index != null && (
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  段落 {c.paragraph_index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-20 flex justify-center">
        <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" />
      </div>
    }>
      <DetailContent />
    </Suspense>
  );
}
