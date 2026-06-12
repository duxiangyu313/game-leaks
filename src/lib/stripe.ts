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
  gold:    { monthly: "price_1ThRsgQ9NyBUwMBMt0b5WkXA", yearly: "price_1ThRtDQ9NyBUwMBMSpWF4J6Y" },
  diamond: { monthly: "price_1ThRtcQ9NyBUwMBMY5BWeUnh", yearly: "price_1ThRtrQ9NyBUwMBMY3VpweNz" },
} as const;

// MEMBERSHIP_TIERS 和 MembershipTier 类型统一从 stripe-config.ts 导出
// 本文件仅用于服务端 Stripe SDK 初始化
export type { MembershipTier } from "@/lib/stripe-config";
export { MEMBERSHIP_TIERS } from "@/lib/stripe-config";
