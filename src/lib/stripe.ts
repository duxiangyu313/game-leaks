/**
 * Stripe 服务端客户端
 * 用于 API Routes 和 Supabase Edge Functions
 */
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-01.acacia" as any,
  typescript: true,
});

/* ── 会员价格配置 ── */
export const MEMBERSHIP_PRICES = {
  silver: {
    monthly: "price_silver_monthly",   // 替换为实际 Stripe Price ID
    yearly: "price_silver_yearly",
  },
  gold: {
    monthly: "price_gold_monthly",
    yearly: "price_gold_yearly",
  },
  diamond: {
    monthly: "price_diamond_monthly",
    yearly: "price_diamond_yearly",
  },
} as const;

/* ── 会员权益配置 ── */
export const MEMBERSHIP_TIERS = {
  free: {
    name: "普通用户",
    nameEn: "Free",
    tier: 0,
    features: [
      "浏览公开资讯",
      "参与论坛讨论",
      "查看游戏库",
    ],
  },
  silver: {
    name: "白银会员",
    nameEn: "Silver",
    tier: 1,
    priceMonthly: 29,
    priceYearly: 199,
    features: [
      "普通用户全部权益",
      "查看所有深度解析内容",
      "高清原画下载",
    ],
    color: "from-slate-400 to-slate-500",
    highlight: false,
  },
  gold: {
    name: "黄金会员",
    nameEn: "Gold",
    tier: 2,
    priceMonthly: 59,
    priceYearly: 399,
    features: [
      "白银会员全部权益",
      "所有独家爆料内容",
      "开发进度追踪",
      "每周行业情报速递",
      "优先参与线上活动",
    ],
    color: "from-amber-400 to-yellow-500",
    highlight: true,
  },
  diamond: {
    name: "钻石会员",
    nameEn: "Diamond",
    tier: 3,
    priceMonthly: 199,
    priceYearly: 1299,
    features: [
      "黄金会员全部权益",
      "游戏测试资格优先",
      "专属VIP社群",
      "制作人月度AMA",
      "年度专属实体礼品",
      "一对一客服支持",
    ],
    color: "from-cyan-400 to-blue-500",
    highlight: false,
  },
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_TIERS;
