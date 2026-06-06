/**
 * Stripe 服务端客户端
 * 用于 API Routes 和 Supabase Edge Functions
 */
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2025-06-01.acacia" as any,
  typescript: true,
});

/* ── 会员价格配置 ── */
export const MEMBERSHIP_PRICES = {
  silver:  { monthly: "price_1TeENpQ9NyBUwMBMVfMk8ww9", yearly: "price_1TeFVKQ9NyBUwMBMrfstRBsO" },
  gold:    { monthly: "price_1TeFD3Q9NyBUwMBMKDAdmRvr", yearly: "price_1TeFVsQ9NyBUwMBMOXo9f5dC" },
  diamond: { monthly: "price_1TeFHRQ9NyBUwMBMOYF3290s", yearly: "price_1TeFWIQ9NyBUwMBMZFCQ9i8U" },
} as const;

// MEMBERSHIP_TIERS 和 MembershipTier 类型统一从 stripe-config.ts 导出
// 本文件仅用于服务端 Stripe SDK 初始化
export type { MembershipTier } from "@/lib/stripe-config";
export { MEMBERSHIP_TIERS } from "@/lib/stripe-config";
