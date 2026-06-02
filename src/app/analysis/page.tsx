"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, PenLine, Users, TrendingUp, Clock, Lock, Eye, Flame, Newspaper } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { calculateReadingTime, calculateWordCount, formatDate } from "@/lib/article-utils";

const CATS = [
  { key: "all", icon: BookOpen, label: "全部", color: "text-[#F1F5F9]" },
  { key: "preview", icon: TrendingUp, label: "前瞻", color: "text-[#F59E0B]" },
  { key: "analysis", icon: BookOpen, label: "分析", color: "text-[#10B981]" },
  { key: "review", icon: PenLine, label: "评测", color: "text-[#06B6D4]" },
  { key: "leak", icon: Flame, label: "爆料", color: "text-[#F59E0B]" },
  { key: "news", icon: Newspaper, label: "新闻", color: "text-[#8B5CF6]" },
  { key: "interview", icon: Users, label: "访谈", color: "text-[#22D3EE]" },
];

const TIER_FILTERS = [
  { key: "all", label: "全部" },
  { key: "free", label: "免费", color: "text-[#64748B]" },
  { key: "silver", label: "白银", color: "text-[#94A3B8]" },
  { key: "gold", label: "黄金", color: "text-[#F59E0B]" },
  { key: "diamond", label: "钻石", color: "text-[#22D3EE]" },
];

export default function AnalysisPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("all");
  const [activeTier, setActiveTier] = useState("all");

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setArticles(data || []);
        setLoading(false);
      });
  }, []);

  // 筛选
  const filtered = articles.filter((a) => {
    if (activeCat !== "all" && a.category !== activeCat) return false;
    if (activeTier !== "all" && a.required_tier !== activeTier) return false;
    return true;
  });

  // 分类计数
  const catCounts: Record<string, number> = {};
  CATS.forEach((cat) => {
    if (cat.key === "all") catCounts[cat.key] = articles.length;
    else catCounts[cat.key] = articles.filter((a) => a.category === cat.key).length;
  });

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-[#06B6D4]" />
          <h1 className="text-3xl font-bold text-[#F1F5F9]">深度解析</h1>
        </div>
        <p className="text-[#94A3B8] mb-10">专业评测与行业深度分析</p>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATS.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCat(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCat === cat.key
                  ? "bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20"
                  : "bg-[#1E293B]/30 text-[#64748B] border border-transparent hover:text-[#94A3B8]"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
              <span className="opacity-60">({catCounts[cat.key] || 0})</span>
            </button>
          ))}
        </div>

        {/* 权限筛选 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TIER_FILTERS.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setActiveTier(tf.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                activeTier === tf.key
                  ? `${tf.color || "text-[#F1F5F9]"} bg-[#1E293B]/60 border border-current/30`
                  : "text-[#64748B] bg-transparent border border-transparent hover:border-[rgba(30,41,59,0.4)]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* 文章列表 */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-[#1E293B]/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((a, i) => {
              const isPaid = a.required_tier !== "free";
              const readTime = calculateReadingTime(a.content || "");
              const wordCount = calculateWordCount(a.content || "");

              return (
                <motion.article
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass-card overflow-hidden transition-all group ${
                    isPaid ? "article-card-paid" : "hover:border-[#06B6D4]/20"
                  }`}
                >
                  <Link href={`/articles/detail?id=${a.id}`} className="flex flex-col md:flex-row">
                    {/* 封面图 */}
                    {a.cover_image && (
                      <div className="md:w-48 shrink-0 h-36 md:h-auto overflow-hidden bg-[#1E293B]/40">
                        <img
                          src={a.cover_image}
                          alt={a.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 p-5 md:p-6">
                      {/* 元信息行 */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">
                          {categoryLabel(a.category)}
                        </span>
                        {isPaid && (
                          <span className="badge-member-exclusive">
                            <Lock className="w-2.5 h-2.5" />
                            {tierLabel(a.required_tier)}可见
                          </span>
                        )}
                        <span className="text-xs text-[#64748B] flex items-center gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {formatDate(a.created_at)}
                        </span>
                      </div>

                      {/* 标题 */}
                      <h3 className="text-lg font-bold text-[#F1F5F9] mb-2 group-hover:text-[#06B6D4] transition-colors">
                        {a.title}
                      </h3>

                      {/* 摘要 */}
                      {a.excerpt && (
                        <p className="text-sm text-[#94A3B8] line-clamp-2 mb-3">{a.excerpt}</p>
                      )}

                      {/* 底部信息 */}
                      <div className="flex items-center gap-4 text-xs text-[#64748B] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {readTime} 分钟
                        </span>
                        {wordCount > 0 && (
                          <span>{wordCount.toLocaleString()} 字</span>
                        )}
                        {a.view_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {a.view_count.toLocaleString()} 阅读
                          </span>
                        )}
                        {a.purchase_count > 0 && (
                          <span className="text-[#F59E0B]">
                            {a.purchase_count.toLocaleString()} 人已购
                          </span>
                        )}
                      </div>

                      {/* 标签 */}
                      {a.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {a.tags.map((t: string) => (
                            <span key={t} className="text-[10px] text-[#64748B] bg-[#1E293B]/40 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.article>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#64748B]">暂无匹配的文章</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    preview: "前瞻", analysis: "分析", review: "评测",
    interview: "访谈", opinion: "观点", leak: "爆料", news: "新闻", video: "视频",
  };
  return map[cat] || cat;
}

function tierLabel(tier: string): string {
  const map: Record<string, string> = { silver: "白银", gold: "黄金", diamond: "钻石", free: "免费" };
  return map[tier] || tier;
}
