"use client";

import { motion } from "framer-motion";
import { Calendar, Play, ExternalLink, Clock, Zap } from "lucide-react";

interface PromoScene8Props {
  active: boolean;
}

const STATS = [
  { value: 41, label: "游戏追踪", color: "#22d3ee" },
  { value: 97, label: "独家爆料", color: "#F5A623" },
  { value: 3, label: "搜索引擎收录", color: "#10B981" },
];

const SPECIALS = [
  { title: "ChinaJoy 2026", desc: "试玩指南+前线报道", color: "#E94560" },
  { title: "国际工作室转UE5", desc: "九阴、抵抗者全解析", color: "#F5A623" },
  { title: "国产3A排行榜", desc: "每月更新，实时热度", color: "#22d3ee" },
];

/** 场景八(独立文件)：多媒体+日历+游戏专题 */
export default function PromoScene8({ active }: PromoScene8Props) {
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
        <Calendar className="mr-2 inline h-6 w-6 text-rose-400" />
        追踪日历 &amp; <span className="text-rose-400">游戏专题</span>
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-8 h-px w-24 bg-gradient-to-r from-transparent via-rose-400 to-transparent"
      />

      {/* 内容区 */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
        {/* 视频区 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md"
        >
          <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-[#1E293B]/60">
            <div className="text-center">
              <Play className="mx-auto mb-2 h-10 w-10 text-rose-400" />
              <p className="text-xs text-white/50">B站视频报道</p>
            </div>
          </div>
          <h3 className="mb-1 text-sm font-bold text-white">ChinaJoy 2026 · 专题页</h3>
          <p className="mb-3 text-xs text-white/50">
            抵抗者、九阴UE5、朝夕光年 — 试玩指南已上线
          </p>
          <div className="flex items-center gap-1 text-xs font-medium text-rose-400">
            <ExternalLink className="h-3 w-3" /> 立即观看
          </div>
        </motion.div>

        {/* 日历+专题 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-3"
        >
          {/* 日历 */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/60">
              <Clock className="h-3.5 w-3.5" /> 即将到来
            </h3>
            <div className="space-y-2">
              {[
                { date: "7/31", title: "ChinaJoy 2026 开幕", color: "#E94560" },
                { date: "7/30", title: "雾影猎人 全球发售", color: "#F5A623" },
                { date: "8/20", title: "梦战：剑之海 首测", color: "#22d3ee" },
              ].map((ev, i) => (
                <motion.div
                  key={ev.title}
                  initial={{ opacity: 0, x: 15 }}
                  animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.12 }}
                  className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span
                    className="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: ev.color }}
                  >
                    {ev.date}
                  </span>
                  <span className="text-xs text-white/70">{ev.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 游戏专题 */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-white/60">
              <Zap className="h-3.5 w-3.5" /> 不定时专题更新
            </h3>
            <div className="space-y-2">
              {SPECIALS.map((sp, i) => (
                <motion.div
                  key={sp.title}
                  initial={{ opacity: 0, x: 15 }}
                  animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
                  transition={{ duration: 0.4, delay: 1.3 + i * 0.12 }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: sp.color }}
                  />
                  <span className="text-xs font-medium text-white/80">{sp.title}</span>
                  <span className="ml-auto text-[10px] text-white/30">{sp.desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部数字 */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 1.6 + i * 0.2 }}
            className="text-center"
          >
            <div
              className="text-3xl font-black sm:text-4xl"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/40">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
