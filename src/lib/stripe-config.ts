/**
 * 会员配置 — 客户端安全 · UGC 4级会员制
 */
import type { ContentLevel, MembershipTier } from "@/types";

export const MEMBERSHIP_PRICES = {
  gold:    { monthly: "price_1ThRsgQ9NyBUwMBMt0b5WkXA", yearly: "price_1ThRtDQ9NyBUwMBMSpWF4J6Y" },
  diamond: { monthly: "price_1ThRtcQ9NyBUwMBMY5BWeUnh", yearly: "price_1ThRtrQ9NyBUwMBMY3VpweNz" },
} as const;

export const MEMBERSHIP_TIERS = {
  free: {
    name: "普通用户", nameEn: "Free", tier: 0, priceMonthly: 0, priceYearly: 0,
    features: ["浏览免费资讯", "参与论坛讨论", "查看游戏库"],
    color: "from-gray-500 to-gray-600", highlight: false,
  },
  silver: {
    name: "白银会员", nameEn: "Silver", tier: 0.5, priceMonthly: 9, priceYearly: 99,
    features: ["普通用户全部权益", "白银专享内容"],
    color: "from-slate-300 to-slate-400", highlight: false,
  },
  gold: {
    name: "黄金会员", nameEn: "Gold", tier: 1, priceMonthly: 29, priceYearly: 299,
    features: ["普通用户全部权益", "观看黄金内容", "投稿免费 & 黄金内容", "25% 创作者分成", "高清原画下载", "24小时优先审核"],
    color: "from-amber-400 to-yellow-500", highlight: true,
  },
  diamond: {
    name: "钻石会员", nameEn: "Diamond", tier: 2, priceMonthly: 89, priceYearly: 899,
    features: ["黄金会员全部权益", "观看钻石内容", "投稿所有等级内容", "40% 创作者分成", "12小时优先审核", "专属客服", "邀请奖励翻倍"],
    color: "from-blue-500 to-cyan-500", highlight: false,
  },
} as const;

export type { MembershipTier };

export const CONTENT_LEVEL_META: Record<ContentLevel, {
  name: string; color: string; badge: string; canView: MembershipTier; canSubmit: MembershipTier;
}> = {
  free: { name: "免费内容", color: "text-gray-400", badge: "bg-gray-500/20 text-gray-400", canView: "free", canSubmit: "gold" },
  gold: { name: "黄金内容", color: "text-amber-400", badge: "bg-amber-500/20 text-amber-400", canView: "gold", canSubmit: "gold" },
  diamond: { name: "钻石内容", color: "text-blue-400", badge: "bg-blue-500/20 text-blue-400", canView: "diamond", canSubmit: "diamond" },
};
