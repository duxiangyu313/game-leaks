"use client";

import { motion } from "framer-motion";
import { FileText, Lock, Eye } from "lucide-react";

interface PromoScene3Props {
  active: boolean;
}

const ARTICLES = [
  {
    title: "归唐：定价困局与破局之道",
    category: "深度解析",
    categoryColor: "#F5A623",
    level: "gold",
    views: "2.3k",
  },
  {
    title: "影之刃零：战斗系统全面拆解",
    category: "独家攻略",
    categoryColor: "#E94560",
    level: "gold",
    views: "4.1k",
  },
  {
    title: "ChinaJoy 2026 试玩报告",
    category: "前线报道",
    categoryColor: "#22d3ee",
    level: "free",
    views: "1.8k",
  },
];

/** 场景三：深度解析 — 文章卡片 + 等级门控 */
export default function PromoScene3({ active }: PromoScene3Props) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* 标题 */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        className="mb-2 text-center text-2xl font-bold text-white sm:text-3xl"
      >
        <FileText className="mr-2 inline h-6 w-6 text-amber-300" />
        深度<span className="text-amber-300">解析</span>
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-8 h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
      />

      {/* 文章卡片 */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {ARTICLES.map((article, i) => (
          <motion.div
            key={article.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={
              active
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 30, scale: 0.95 }
            }
            transition={{
              duration: 0.55,
              delay: 0.6 + i * 0.15,
              ease: "easeOut",
            }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-colors hover:border-amber-400/30"
          >
            {/* 顶部装饰条 */}
            <div
              className="absolute left-0 top-0 h-0.5 w-full"
              style={{
                background: `linear-gradient(to right, ${article.categoryColor}, transparent)`,
              }}
            />

            {/* 分类 + 等级 */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider"
                style={{
                  backgroundColor: `${article.categoryColor}20`,
                  color: article.categoryColor,
                }}
              >
                {article.category}
              </span>
              {article.level !== "free" && (
                <Lock className="h-3 w-3 text-amber-400/70" />
              )}
            </div>

            {/* 标题 */}
            <h3 className="mb-2 text-sm font-bold leading-snug text-white">
              {article.title}
            </h3>

            {/* 底部 */}
            <div className="flex items-center gap-3 border-t border-white/5 pt-3 text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {article.views}
              </span>
              {article.level === "free" ? (
                <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-white/50">公开</span>
              ) : (
                <span className="ml-auto rounded bg-amber-400/15 px-1.5 py-0.5 text-amber-300">会员</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-6 text-[11px] tracking-widest text-white/30"
      >
        独家长文 · 前线报道 · 系统拆解
      </motion.p>
    </motion.div>
  );
}
