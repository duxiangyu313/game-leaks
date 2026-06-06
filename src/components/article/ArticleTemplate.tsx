"use client";

import { useMemo, useState, useCallback } from "react";
import { Clock, Eye, Tag, Lock } from "lucide-react";
import type { Article, MembershipTier, InteractionCounts } from "@/types";
import { calculateReadingTime, calculateWordCount, generateTOC, formatDate, extractImages } from "@/lib/article-utils";
import { getVisibilityLabel } from "@/lib/auth";
import { getDefaultTemplateType } from "@/lib/markdown";

import ArticleRenderer from "./ArticleRenderer";
import PaywallBlur from "./PaywallBlur";
import TableOfContents from "./TableOfContents";
import ReadStats from "./ReadStats";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import ShareButton from "./ShareButton";
import CredibilityVote from "./CredibilityVote";
import SmartPaywallNudge from "./SmartPaywallNudge";
import RelatedArticles from "./RelatedArticles";
import Lightbox from "./Lightbox";

interface Props {
  article: Article;
  membershipLevel: MembershipTier;
  interactionCounts?: InteractionCounts;
  userLiked?: boolean;
  userBookmarked?: boolean;
}

/**
 * 文章模板包装器
 * 根据文章分类自动选择模板类型并渲染标准化结构
 */
export default function ArticleTemplate({
  article,
  membershipLevel,
  interactionCounts,
  userLiked,
  userBookmarked,
}: Props) {
  const templateType = article.templateType || getDefaultTemplateType(article.category);
  const isPaid = article.requiredTier !== "free";
  const isLeak = article.category === "leak";

  // Lightbox 状态
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // 计算派生值
  const wordCount = article.wordCount || calculateWordCount(article.content || "");
  const readTime = article.readTime || calculateReadingTime(article.content || "");
  const tocItems = useMemo(() => generateTOC(article.content || ""), [article.content]);
  const allImages = useMemo(() => extractImages(article.content || ""), [article.content]);

  // 摘要
  const summary = article.excerpt || extractSummary(article.content || "");

  const handleImageClick = useCallback(
    (src: string, index: number) => {
      setLightboxIndex(index >= 0 ? index : 0);
      setLightboxOpen(true);
    },
    []
  );

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-6">
      {/* ── Hero 头图 ── */}
      {article.coverImage && (
        <div className={`article-hero ${isPaid ? "article-hero--paid" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export 不使用 next/image 优化 */}
          <img src={article.coverImage} alt={article.title} loading="lazy" />
        </div>
      )}

      {/* 分类 + 会员标识 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="px-2.5 py-0.5 text-xs rounded-full bg-[#06B6D4]/10 text-[#06B6D4] font-medium">
          {categoryLabel(article.category)}
        </span>
        {isPaid && (
          <span className="badge-member-exclusive">
            <Lock className="w-3 h-3" />
            {getVisibilityLabel(article.requiredTier)}可见
          </span>
        )}
        <span className="text-xs text-[#64748B] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(article.createdAt || article.publishedAt || "")}
        </span>
      </div>

      {/* 标题 */}
      <h1 className="text-3xl md:text-4xl font-black text-[#F1F5F9] mb-3 leading-tight">
        {article.title}
      </h1>

      {/* 元信息行 */}
      <div className="flex items-center gap-4 mb-8 flex-wrap text-sm">
        <ReadStats wordCount={wordCount} readTime={readTime} />
        {article.purchaseCount != null && article.purchaseCount > 0 && (
          <span className="text-xs text-[#F59E0B] flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.purchaseCount.toLocaleString()} 人已阅读
          </span>
        )}
        {allImages.length > 0 && (
          <span className="text-xs text-[#64748B]">含 {allImages.length} 张图片</span>
        )}
      </div>

      {/* ── 双栏布局 ── */}
      <div className="flex gap-10">
        {/* 左侧正文 */}
        <div className="flex-1 min-w-0">
          {/* 摘要 */}
          {summary && templateType !== "standard" && (
            <div className={`article-summary-card ${isPaid ? "gold" : ""}`}>
              <h4>{isPaid ? "核心要点" : "TL;DR"}</h4>
              <p className="text-sm text-[#94A3B8] leading-relaxed">{summary}</p>
            </div>
          )}

          {/* 移动端目录 */}
          <div className="lg:hidden">
            <TableOfContents items={tocItems} isPaid={isPaid} />
          </div>

          {/* 正文 + 付费墙 */}
          {isPaid ? (
            <PaywallBlur
              membershipLevel={membershipLevel}
              requiredTier={article.requiredTier}
              articleId={article.id}
            >
              <ArticleRenderer
                content={article.content}
                canRead={true}
                onImageClick={handleImageClick}
              />
            </PaywallBlur>
          ) : (
            <ArticleRenderer
              content={article.content}
              canRead={true}
              onImageClick={handleImageClick}
            />
          )}

          {/* 可信度投票（爆料类） */}
          {isLeak && (
            <CredibilityVote
              articleId={article.id}
              initialBelieve={interactionCounts?.credibility_believe || 0}
              initialSkeptical={interactionCounts?.credibility_skeptical || 0}
            />
          )}

          {/* 标签 */}
          {article.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[rgba(30,41,59,0.4)] flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-[#64748B]" />
              {article.tags.map((t) => (
                <span key={t} className="text-xs text-[#64748B] bg-[#1E293B]/40 px-2.5 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* 会员专属页脚 */}
          {isPaid && (
            <div className="mt-12 p-5 rounded-2xl border border-[#F59E0B]/20 bg-gradient-to-r from-[#F59E0B]/5 to-transparent">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#F59E0B]" />
                <span className="text-sm text-[#F59E0B] font-semibold">
                  本文为{getVisibilityLabel(article.requiredTier)}专属内容，禁止转载
                </span>
              </div>
            </div>
          )}

          {/* 相关文章 */}
          <RelatedArticles
            currentArticleId={article.id}
            category={article.category}
          />
        </div>

        {/* 右侧 sticky 侧栏（桌面端） */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <TableOfContents items={tocItems} isPaid={isPaid} />

            {/* 互动按钮 */}
            <div className="interaction-bar mt-4 pt-4 border-t border-[rgba(30,41,59,0.4)]">
              <LikeButton
                articleId={article.id}
                initialCount={interactionCounts?.likes || 0}
                initialLiked={userLiked}
                isGold={isPaid}
              />
              <BookmarkButton
                articleId={article.id}
                initialBookmarked={userBookmarked}
              />
              <ShareButton articleId={article.id} title={article.title} />
            </div>
          </div>
        </div>
      </div>

      {/* 移动端底部互动栏 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/90 backdrop-blur-xl border-t border-[rgba(30,41,59,0.4)]">
        <div className="flex items-center justify-center gap-8 py-2">
          <LikeButton
            articleId={article.id}
            initialCount={interactionCounts?.likes || 0}
            initialLiked={userLiked}
            isGold={isPaid}
          />
          <BookmarkButton
            articleId={article.id}
            initialBookmarked={userBookmarked}
          />
          <ShareButton articleId={article.id} title={article.title} />
        </div>
      </div>

      {/* 智能付费引导（免费文章） */}
      {!isPaid && <SmartPaywallNudge membershipLevel={membershipLevel} />}

      {/* 灯箱 */}
      <Lightbox
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
}

/** 分类中文标签 */
function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    leak: "爆料", review: "评测", analysis: "深度分析",
    preview: "前瞻", interview: "访谈", opinion: "观点",
    news: "新闻", video: "视频",
  };
  return map[cat] || "文章";
}

/** 提取摘要 */
function extractSummary(content: string, maxLen = 200): string {
  if (!content) return "";
  const firstSection = content.split("##")[0] || content;
  const plain = firstSection
    .replace(/[#*`>\[\]!|-]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}
