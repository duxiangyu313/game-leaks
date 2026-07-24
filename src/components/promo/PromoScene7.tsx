"use client";

import { motion } from "framer-motion";
import { Crown, Star } from "lucide-react";

interface PromoScene7Props {
  active: boolean;
}

interface TierCard {
  name: string;
  price: string;
  period: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glow: string;
  benefits: string[];
  highlight?: boolean;
  icon?: "crown" | "star";
}

const TIERS: TierCard[] = [
  {
    name: "FREE",
    price: "¥0",
    period: "永久",
    color: "#94A3B8",
    bgColor: "rgba(148, 163, 184, 0.06)",
    borderColor: "rgba(148, 163, 184, 0.25)",
    glow: "rgba(148, 163, 184, 0.15)",
    benefits: ["公开内容浏览", "社区论坛", "游戏库查询"],
  },
  {
    name: "GOLD",
    price: "¥299",
    period: "/年",
    color: "#F5A623",
    bgColor: "rgba(245, 166, 35, 0.08)",
    borderColor: "rgba(245, 166, 35, 0.4)",
    glow: "rgba(245, 166, 35, 0.3)",
    benefits: ["深度解析文章", "独家攻略", "高清原画下载", "24小时优先审核"],
    icon: "star",
  },
  {
    name: "DIAMOND",
    price: "¥899",
    period: "/年",
    color: "#22d3ee",
    bgColor: "rgba(34, 211, 238, 0.08)",
    borderColor: "rgba(34, 211, 238, 0.4)",
    glow: "rgba(34, 211, 238, 0.3)",
    benefits: ["黄金全部权益", "全网独家爆料", "开发者访谈", "40%创作者分成", "专属客服"],
    highlight: true,
    icon: "crown",
  },
];

/** 场景七：会员体系 — Free/Gold/Diamond 三卡并排，CTA收尾前 */
export default function PromoScene7({ active }: PromoScene7Props) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-4"
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
        深度解析 <span className="text-amber-300">会员体系</span>
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-10 h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
      />

      {/* 会员卡片 — 三列 */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              active
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            transition={{
              duration: 0.6,
              delay: 0.6 + i * 0.2,
              ease: "easeOut",
            }}
            whileHover={{ y: -6 }}
            className="relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md"
            style={{
              backgroundColor: tier.bgColor,
              borderColor: tier.borderColor,
              boxShadow: `0 0 30px ${tier.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {/* 角标 */}
            {tier.highlight && (
              <div
                className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider"
                style={{
                  backgroundColor: tier.color,
                  color: "#000",
                }}
              >
                推荐
              </div>
            )}

            {/* 图标 + 等级名 */}
            <div className="flex items-center gap-2">
              {tier.icon === "crown" && <Crown className="h-4 w-4" style={{ color: tier.color }} />}
              {tier.icon === "star" && <Star className="h-4 w-4" style={{ color: tier.color }} />}
              <div
                className="text-xs font-bold tracking-[0.3em]"
                style={{ color: tier.color }}
              >
                {tier.name}
              </div>
            </div>

            {/* 价格 */}
            <div className="mt-2 flex items-baseline gap-1">
              <span
                className="text-3xl font-black sm:text-4xl"
                style={{ color: tier.color }}
              >
                {tier.price}
              </span>
              <span className="text-xs text-white/40">{tier.period}</span>
            </div>

            {/* 分隔线 */}
            <div
              className="my-4 h-px w-full"
              style={{
                background: `linear-gradient(to right, ${tier.color}, transparent)`,
                opacity: 0.3,
              }}
            />

            {/* 权益列表 */}
            <ul className="space-y-2">
              {tier.benefits.map((benefit, j) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={
                    active ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                  }
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.2 + j * 0.1 }}
                  className="flex items-center gap-2 text-xs text-white/80"
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
