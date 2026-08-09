"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { getUserLevel, type MembershipLevel, type Visibility } from "@/lib/auth";
import { calculateReadingTime, calculateWordCount } from "@/lib/article-utils";
import { useArticleDetail } from "@/data/hooks";
import { addHistory } from "@/components/account/BrowsingHistory";
import type { InteractionCounts, ArticleCategory } from "@/types";
import ArticleTemplate from "@/components/article/ArticleTemplate";
import type { Database } from "@/types/database";
import { BreadcrumbListSchema, NewsArticleSchema } from "@/components/StructuredData";

type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];

function DetailContent({ id }: { id: string }) {
  const { article, loading, userLike, userBookmark } = useArticleDetail(id);

  const [userLevel, setUserLevel] = useState<MembershipLevel>("free");
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [interactionCounts, setInteractionCounts] = useState<InteractionCounts>({
    likes: 0, bookmarks: 0, shares: 0, comments: 0,
    credibility_believe: 0, credibility_skeptical: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── 用户等级 + 浏览历史 + 浏览量 + 评论 + 互动统计（标题/描述由服务端 generateMetadata 处理，此处不再改） ──
  useEffect(() => {
    if (!article) return;
    getUserLevel().then(setUserLevel);

    addHistory({ id: article.id, title: article.title, link: `/articles/${article.id}`, type: "article" });

    supabase.rpc("increment_view", { article_id: id }).then(() => {});

    supabase.from("post_comments").select("*").eq("article_id", id).order("created_at", { ascending: false })
      .then(({ data: c }) => {
        setComments(c || []);
        setInteractionCounts((prev) => ({ ...prev, comments: c?.length || 0 }));
      });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !article) return;
      const types = ["like", "bookmark", "share", "credibility_believe", "credibility_skeptical"] as const;
      for (const t of types) {
        supabase.from("article_interactions")
          .select("id", { count: "exact", head: true })
          .eq("article_id", id)
          .eq("interaction_type", t)
          .then(({ count }) => {
            if (count != null) {
              setInteractionCounts((prev) => ({ ...prev, [t]: count,
                likes: t === "like" ? count : prev.likes,
                bookmarks: t === "bookmark" ? count : prev.bookmarks,
                shares: t === "share" ? count : prev.shares,
                credibility_believe: t === "credibility_believe" ? count : prev.credibility_believe,
                credibility_skeptical: t === "credibility_skeptical" ? count : prev.credibility_skeptical,
              }));
            }
          });
      }
    });
  }, [article, id]);

  // 禁止右键和快捷键（付费文章）
  useEffect(() => {
    if (!article || (article.required_tier || "free") === "free") return;
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
    if (!article || (article.required_tier || "free") === "free" || !canvasRef.current) return;
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
    }).select().maybeSingle();
    if (data) setComments((prev) => [data, ...prev]);
    setCommentText("");
    setSubmittingComment(false);
  };

  if (loading) return (
    <div className="pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-[#1E293B]/30 rounded" />
        <div className="h-64 bg-[#1E293B]/20 rounded-xl" />
        <div className="h-8 w-3/4 bg-[#1E293B]/30 rounded" />
        <div className="h-4 w-full bg-[#1E293B]/20 rounded" />
      </div>
    </div>
  );

  if (!article) return (
    <div className="pt-20 pb-20 text-center text-[#64748B]">
      <p className="text-lg mb-2">文章未找到</p>
      <LinkNoPrefetch href="/analysis" className="text-[#06B6D4] text-sm hover:underline">返回文章列表</LinkNoPrefetch>
    </div>
  );

  const visibility = (article.required_tier || "public") as Visibility;
  const isPaid = visibility !== "public";

  return (
    <div className="pt-20 pb-20">
      {/* 结构化数据 — 搜索引擎收录（URL 改为路径式） */}
      <BreadcrumbListSchema items={[
        { name: "首页", url: "https://news.guoyouwenduji.cc/" },
        { name: "深度解析", url: "https://news.guoyouwenduji.cc/analysis/" },
        { name: article.title, url: `https://news.guoyouwenduji.cc/articles/${article.id}` },
      ]} />
      <NewsArticleSchema
        title={article.title}
        description={article.excerpt || article.title}
        datePublished={article.published_at || article.created_at || ""}
        author={article.author_name}
        url={`https://news.guoyouwenduji.cc/articles/${article.id}`}
        image={article.cover_image || undefined}
        category={article.category}
      />

      {isPaid && <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-[999]" />}

      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6">
        <LinkNoPrefetch href="/analysis" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回文章列表
        </LinkNoPrefetch>
      </div>

      <ArticleTemplate
        article={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || undefined,
          content: article.content || "",
          coverImage: article.cover_image || "",
          category: (article.category || "analysis") as ArticleCategory,
          templateType: (article as any).template_type,
          gameId: (article as any).game_id,
          gameName: (article as any).game_name,
          authorId: article.author_id || "",
          authorName: (article as any).author_name,
          publishedAt: article.created_at || "",
          readTime: (article as any).read_time || calculateReadingTime(article.content || ""),
          wordCount: (article as any).word_count || calculateWordCount(article.content || ""),
          tags: article.tags || [],
          requiredTier: (article.required_tier || "free") as "free" | "gold" | "diamond",
          purchaseCount: (article as any).purchase_count,
          credibilityScore: (article as any).credibility_score,
          videoUrl: (article as any).video_url,
          status: (article.status || "published") as "published" | "draft" | "scheduled",
          viewCount: article.view_count || 0,
          createdAt: article.created_at || "",
          updatedAt: article.updated_at || "",
        }}
        membershipLevel={userLevel}
        interactionCounts={interactionCounts}
        userLiked={userLike}
        userBookmarked={userBookmark}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-[rgba(30,41,59,0.4)]">
        <h3 className="text-lg font-bold text-[#F1F5F9] mb-6">评论 ({comments.length})</h3>

        <div className="glass-card p-4 mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] text-sm outline-none resize-y mb-3"
          />
          <button onClick={handleComment} disabled={submittingComment || !commentText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50 transition-all">
            {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 发布评论
          </button>
        </div>

        {comments.length === 0 && <p className="text-[#64748B] text-center py-8">暂无评论，来抢沙发吧</p>}
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#F1F5F9]">{c.user_id?.slice(0, 8) || "匿名"}</span>
                <span className="text-xs text-[#64748B]">{c.created_at ? new Date(c.created_at).toLocaleDateString("zh-CN") : ""}</span>
              </div>
              <p className="text-sm text-[#94A3B8]">{c.content}</p>
              {c.paragraph_index != null && (
                <span className="text-[10px] text-[#64748B] mt-1 block">段落 {c.paragraph_index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailClient({ id }: { id: string }) {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-[#1E293B]/30 rounded" />
          <div className="h-64 bg-[#1E293B]/20 rounded-xl" />
          <div className="h-8 w-3/4 bg-[#1E293B]/30 rounded" />
          <div className="h-4 w-full bg-[#1E293B]/20 rounded" />
        </div>
      </div>
    }>
      <DetailContent id={id} />
    </Suspense>
  );
}
