/**
 * 会员配置 — 客户端安全，不导入 Stripe 服务端库
 */

// Price ID 与 Supabase Edge Function (stripe-checkout) 保持同步
export const MEMBERSHIP_PRICES = {
  silver:  { monthly: "price_1TeENpQ9NyBUwMBMVfMk8ww9", yearly: "price_1TeFVKQ9NyBUwMBMrfstRBsO" },
  gold:    { monthly: "price_1TeFD3Q9NyBUwMBMKDAdmRvr", yearly: "price_1TeFVsQ9NyBUwMBMOXo9f5dC" },
  diamond: { monthly: "price_1TeFHRQ9NyBUwMBMOYF3290s", yearly: "price_1TeFWIQ9NyBUwMBMZFCQ9i8U" },
} as const;

export const MEMBERSHIP_TIERS = {
  free: { name: "普通用户", nameEn: "Free", tier: 0, features: ["浏览公开资讯", "参与论坛讨论", "查看游戏库"] },
  silver: { name: "白银会员", nameEn: "Silver", tier: 1, priceMonthly: 29, priceYearly: 199, features: ["普通用户全部权益", "查看所有深度解析内容", "高清原画下载"], color: "from-slate-400 to-slate-500", highlight: false },
  gold: { name: "黄金会员", nameEn: "Gold", tier: 2, priceMonthly: 59, priceYearly: 399, features: ["白银会员全部权益", "所有独家爆料内容", "开发进度追踪", "每周行业情报速递", "优先参与线上活动"], color: "from-amber-400 to-yellow-500", highlight: true },
  diamond: { name: "钻石会员", nameEn: "Diamond", tier: 3, priceMonthly: 199, priceYearly: 1299, features: ["黄金会员全部权益", "游戏测试资格优先", "专属VIP社群", "制作人月度AMA", "年度专属实体礼品", "一对一客服支持"], color: "from-cyan-400 to-blue-500", highlight: false },
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_TIERS;
