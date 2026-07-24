"use client";

import { motion } from "framer-motion";
import { Send, Gamepad2, TrendingUp, Flame } from "lucide-react";

interface PromoScene4Props {
  active: boolean;
}

/** 场景四：创作者投稿 — 快捷爆料现金奖励 + 游戏提名会员延期 */
export default function PromoScene4({ active }: PromoScene4Props) {
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
        创作者<span className="text-rose-400">投稿</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-1 text-center text-sm text-white/50"
      >
        你也可以成为情报源
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-8 h-px w-24 bg-gradient-to-r from-transparent via-rose-400 to-transparent"
      />

      {/* 两栏：快捷爆料 + 游戏提名 */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
        {/* 快捷爆料 */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.55, delay: 0.6, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-xl border border-green-400/30 bg-green-400/[0.04] p-5 backdrop-blur-md transition-all hover:border-green-400/50"
        >
          <div className="mb-3 inline-flex rounded-lg bg-green-400/10 p-2.5">
            <Send className="h-5 w-5 text-green-400" />
          </div>
          <h3 className="mb-1 text-base font-bold text-white">快捷爆料</h3>
          <p className="mb-4 text-xs text-white/50">
            提交国产3A独家情报，审核发布即获现金
          </p>

          {/* 审核奖励 */}
          <div className="mb-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-2 text-[10px] font-bold tracking-wider text-white/40">
              审核通过奖励
            </div>
            <div className="flex gap-3">
              {[
                { label: "传闻", amount: "¥3", color: "#F5A623" },
                { label: "可靠", amount: "¥5", color: "#22d3ee" },
                { label: "确认", amount: "¥10", color: "#10B981" },
              ].map((t) => (
                <div key={t.label} className="flex-1 text-center">
                  <div className="text-lg font-black" style={{ color: t.color }}>
                    {t.amount}
                  </div>
                  <div className="text-[10px] text-white/40">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 热门追加 */}
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
            <Flame className="h-4 w-4 shrink-0 text-orange-400" />
            <div className="text-[10px] text-white/60">
              <span className="text-orange-400 font-bold">热门追加</span>
              ：1000浏览 +¥5 · 5000浏览 +¥20
            </div>
          </div>

          {/* 提现门槛 */}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/40">
            <TrendingUp className="h-3 w-3" />
            满 ¥20 可提现
          </div>
        </motion.div>

        {/* 游戏提名 */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.55, delay: 0.8, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-xl border border-cyan-400/30 bg-cyan-400/[0.04] p-5 backdrop-blur-md transition-all hover:border-cyan-400/50"
        >
          <div className="mb-3 inline-flex rounded-lg bg-cyan-400/10 p-2.5">
            <Gamepad2 className="h-5 w-5 text-cyan-400" />
          </div>
          <h3 className="mb-1 text-base font-bold text-white">游戏提名</h3>
          <p className="mb-4 text-xs text-white/50">
            提名未收录的国产3A游戏，审核通过奖励会员
          </p>

          {/* 奖励 */}
          <div className="mb-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-3xl font-black text-cyan-300">+3<sub className="text-sm">天</sub></div>
            <div className="mt-1 text-xs text-white/50">会员延期</div>
          </div>

          {/* 规则 */ }
          <div className="space-y-1.5 text-[10px] text-white/50">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
              提名审核通过即获 +3天会员
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
              本月限额 <span className="font-bold text-white/70">10 人</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
              重复提名不重复发放
            </div>
          </div>
        </motion.div>
      </div>

      {/* 底部标语 */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="mt-7 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[11px] text-white/40"
      >
        🔒 匿名提交 · 编辑团队审核 · 24小时内答复
      </motion.div>
    </motion.div>
  );
}
