"use client";

import { motion } from "framer-motion";

interface PromoScene5Props {
  active: boolean;
}

interface PostCard {
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  author: string;
  replies: number;
  likes: number;
}

const POSTS: PostCard[] = [
  {
    category: "讨论",
    categoryColor: "#22d3ee",
    title: "黑神话悟空 DLC 何时上线？",
    excerpt: "据说要在第二季度发布，大家觉得会跳票吗…",
    author: "@玩家_0712",
    replies: 234,
    likes: 89,
  },
  {
    category: "爆料",
    categoryColor: "#F5A623",
    title: "影之刃零新角色技能曝光",
    excerpt: "内部消息：新角色将带来双刀流玩法，连招机制大改…",
    author: "@爆料姬",
    replies: 512,
    likes: 267,
  },
  {
    category: "综合",
    categoryColor: "#E94560",
    title: "2026 国产 3A 排行榜投票",
    excerpt: "今年你最期待的国产大作是哪一款？来投票吧…",
    author: "@温度计君",
    replies: 1089,
    likes: 432,
  },
];

/** 场景五：社区 — 3张帖子卡片 + CTA */
export default function PromoScene5({ active }: PromoScene5Props) {
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
        className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl"
      >
        玩家 <span className="text-cyan-300">社区</span>
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-10 h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      />

      {/* 帖子卡片 */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {POSTS.map((post, i) => (
          <motion.div
            key={post.title}
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
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-colors hover:border-white/20"
          >
            {/* 顶部装饰条 */}
            <div
              className="absolute left-0 top-0 h-1 w-full"
              style={{
                background: `linear-gradient(to right, ${post.categoryColor}, transparent)`,
              }}
            />

            {/* 分类标签 */}
            <div className="mb-3 flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider"
                style={{
                  backgroundColor: `${post.categoryColor}20`,
                  color: post.categoryColor,
                }}
              >
                {post.category}
              </span>
              <span className="text-[10px] text-white/30">{post.author}</span>
            </div>

            {/* 标题 */}
            <h3 className="mb-2 text-sm font-bold leading-snug text-white">
              {post.title}
            </h3>

            {/* 摘要 */}
            <p className="mb-4 line-clamp-2 text-xs text-white/50">{post.excerpt}</p>

            {/* 互动数据 */}
            <div className="flex items-center gap-4 border-t border-white/5 pt-3 text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <span className="text-cyan-300">💬</span> {post.replies}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-rose-300">♥</span> {post.likes}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA — 可点击跳到论坛 */}
      <motion.a
        href="/forum"
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-400/40 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-200"
      >
        <span>加入讨论</span>
        <motion.span
          animate={active ? { x: [0, 6, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          →
        </motion.span>
      </motion.a>
    </motion.div>
  );
}
