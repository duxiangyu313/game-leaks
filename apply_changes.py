#!/usr/bin/env python3
"""Apply all UGC 3-tier changes to the cloned repo."""
import re, os

ROOT = r"D:\cc项目\next-game-site-tmp"

def read(path):
    with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
        return f.read()

def write(path, content):
    with open(os.path.join(ROOT, path), "w", encoding="utf-8") as f:
        f.write(content)

# ====== 1. src/types/index.ts ======
c = read("src/types/index.ts")
c = c.replace("export type MembershipTier = 'free' | 'silver' | 'gold' | 'diamond';",
              "export type MembershipTier = 'free' | 'gold' | 'diamond';\nexport type ContentLevel = 'free' | 'gold' | 'diamond';\nexport type PayoutMethod = 'alipay' | 'wechat';")
c = c.replace("export type ArticleCategory = 'review' | 'preview' | 'analysis' | 'interview' | 'opinion' | 'leak' | 'news' | 'video';",
              "export type ArticleCategory = 'review' | 'preview' | 'analysis' | 'interview' | 'opinion' | 'leak' | 'news' | 'video' | 'misc';")
c = c.replace("  requiredTier: MembershipTier;\n  purchaseCount?: number;",
              "  requiredTier: MembershipTier;\n  contentLevel?: ContentLevel;\n  isUgc?: boolean;\n  creatorId?: string;\n  revenueSplit?: number;\n  canDeleteAfter?: string;\n  purchaseCount?: number;")
c = c.replace("  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'inactive';",
              "  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'inactive' | 'trialing';")
c = c.replace("  stripeSessionId: string;\n  amount: number;",
              "  stripeSessionId?: string;\n  alipayTradeNo?: string;\n  amount: number;")
c = c.replace("  status: 'pending' | 'completed' | 'refunded' | 'failed';\n  createdAt: string;",
              "  status: 'pending' | 'completed' | 'refunded' | 'failed';\n  paymentMethod: 'stripe' | 'alipay' | 'wechat';\n  relatedReferralId?: string;\n  createdAt: string;")
c = c.replace("  bookmarks: string[];\n  following: string[];\n}",
              "  bookmarks: string[];\n  following: string[];\n  referralCode?: string;\n  referrerId?: string;\n  revenueBalance?: number;\n  totalEarned?: number;\n  banned?: boolean;\n}")
c = c.replace("  silver_info: string;\n  gold_info: string;",
              "  gold_info: string;\n  diamond_info?: string;")
c += """
// ═══ UGC 系统类型 ═══
export interface UgcSubmission {
  id: string; userId: string; title: string; content: string;
  coverImage?: string; category: ArticleCategory; contentLevel: ContentLevel;
  gameName?: string; gameId?: string; tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  reviewerId?: string; reviewNote?: string; revenueSplit?: number;
  submittedAt: string; reviewedAt?: string;
}
export interface UgcContent {
  id: string; submissionId?: string; userId: string; title: string; content: string;
  coverImage?: string; category: string; contentLevel: ContentLevel;
  gameName?: string; gameId?: string; tags: string[];
  viewCount: number; likeCount: number; commentCount: number;
  publishedAt: string; canDeleteAfter?: string;
}
export interface RevenueRecord {
  id: string; contentId: string; contentType: 'ugc' | 'article' | 'leak';
  creatorId: string; amount: number; revenueType: 'ad_share' | 'subscription_share' | 'bonus';
  settlementMonth?: string; settlementStatus: 'pending' | 'settled' | 'withdrawn';
  settlementSplit?: number; notes?: string; createdAt: string;
}
export interface WithdrawalRequest {
  id: string; userId: string; amount: number; method: PayoutMethod;
  accountInfo: string; realName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminId?: string; adminNote?: string; processedAt?: string; createdAt: string;
}
export interface ReferralRecord {
  id: string; referrerId: string; invitedUserId?: string; referralCode: string;
  rewardDays: number; rewardApplied: boolean; invitedAt: string; rewardExpiresAt?: string;
}
export interface PlatformSetting {
  key: string; value: Record<string, unknown>; updatedAt: string;
}
"""
write("src/types/index.ts", c)
print("1. types/index.ts OK")

# ====== 2. src/lib/auth.ts (full rewrite) ======
write("src/lib/auth.ts", '''/**
 * 权限验证 — UGC 3级会员制：free / gold / diamond
 */
import { supabase } from "@/lib/supabase/client";
import type { MembershipTier, ContentLevel } from "@/types";

export type MembershipLevel = MembershipTier;
export type Visibility = "free" | "public" | "gold" | "diamond";

const LEVEL_RANK: Record<MembershipLevel, number> = { free: 0, gold: 1, diamond: 2 };

export async function getUserLevel(): Promise<MembershipLevel> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  const { data: profile } = await supabase
    .from("profiles").select("membership, subscription_end_date, banned")
    .eq("id", user.id).single();
  if (profile?.banned) return "free";
  const level = (profile?.membership || "free") as MembershipLevel;
  if (profile?.subscription_end_date) {
    const end = new Date(profile.subscription_end_date);
    if (end < new Date() && level !== "free") {
      await supabase.from("profiles")
        .update({ membership: "free", subscription_status: "inactive" }).eq("id", user.id);
      return "free";
    }
  }
  return level;
}

export function hasAccess(userLevel: MembershipLevel, requiredLevel: Visibility): boolean {
  if (requiredLevel === "public") return true;
  return LEVEL_RANK[userLevel] >= (LEVEL_RANK[requiredLevel as MembershipLevel] ?? 0);
}

export function hasContentAccess(userLevel: MembershipLevel, contentLevel: ContentLevel): boolean {
  const CR: Record<ContentLevel, number> = { free: 0, gold: 1, diamond: 2 };
  return LEVEL_RANK[userLevel] >= (CR[contentLevel] ?? 0);
}

export function canSubmitContent(userLevel: MembershipLevel, contentLevel: ContentLevel): boolean {
  const MAX: Record<MembershipLevel, number> = { free: -1, gold: 1, diamond: 2 };
  const CR: Record<ContentLevel, number> = { free: 0, gold: 1, diamond: 2 };
  return CR[contentLevel] <= (MAX[userLevel] ?? -1);
}

export function getVisibilityLabel(v: Visibility | MembershipLevel): string {
  const l: Record<string, string> = { public: "免费", free: "免费", gold: "黄金会员", diamond: "钻石会员" };
  return l[v] || v;
}

export function getContentLevelLabel(level: ContentLevel): string {
  const l: Record<ContentLevel, string> = { free: "免费内容", gold: "黄金内容", diamond: "钻石内容" };
  return l[level];
}

export function getVisibilityColor(v: Visibility | MembershipLevel): string {
  const c: Record<string, string> = { public: "text-[#64748B]", free: "text-[#64748B]", gold: "text-[#F59E0B]", diamond: "text-[#3B82F6]" };
  return c[v] || "";
}

export function getVisibilityBg(v: Visibility | MembershipLevel): string {
  const b: Record<string, string> = { public: "bg-[#64748B]/10", free: "bg-[#64748B]/10", gold: "bg-[#F59E0B]/10", diamond: "bg-[#3B82F6]/10" };
  return b[v] || "";
}

export async function isAdmin(): Promise<boolean> {
  const level = await getUserLevel();
  if (level === "diamond") return true;
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  return !!(user?.email && adminEmails.includes(user.email.toLowerCase()));
}

export function getUpgradeTier(userLevel: MembershipLevel, requiredLevel: Visibility): MembershipLevel | null {
  if (hasAccess(userLevel, requiredLevel)) return null;
  if (userLevel === "free") return "gold";
  return "diamond";
}

// ═══ 冷启动 ═══
let _csCache: { enabled: boolean; at: number } | null = null;
export async function isColdStart(): Promise<boolean> {
  if (_csCache && Date.now() - _csCache.at < 300000) return _csCache.enabled;
  try {
    const { data } = await supabase.from("platform_settings")
      .select("value").eq("key", "cold_start").single();
    if (!data) { _csCache = { enabled: false, at: Date.now() }; return false; }
    const s = data.value as { enabled: boolean; started_at: string };
    if (!s.enabled) { _csCache = { enabled: false, at: Date.now() }; return false; }
    const start = new Date(s.started_at);
    const end = new Date(start); end.setMonth(end.getMonth() + 3);
    const active = new Date() < end;
    _csCache = { enabled: active, at: Date.now() };
    return active;
  } catch { return false; }
}

export async function getWithdrawalMin(): Promise<number> {
  try {
    const { data } = await supabase.from("platform_settings")
      .select("value").eq("key", "cold_start").single();
    if (data) { const s = data.value as any; return s.withdrawal_min || 2000; }
  } catch {}
  return 5000;
}

export async function getDiamondSplit(): Promise<number> {
  if (!(await isColdStart())) return 40;
  try {
    const { data } = await supabase.from("platform_settings")
      .select("value").eq("key", "cold_start").single();
    if (data) { const s = data.value as any; return s.diamond_split || 50; }
  } catch {}
  return 50;
}
''')
print("2. lib/auth.ts OK")

# ====== 3. src/lib/stripe-config.ts (full rewrite) ======
write("src/lib/stripe-config.ts", '''/**
 * 会员配置 — 客户端安全 · UGC 3级会员制
 */
import type { ContentLevel } from "@/types";

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

export type MembershipTier = keyof typeof MEMBERSHIP_TIERS;

export const CONTENT_LEVEL_META: Record<ContentLevel, {
  name: string; color: string; badge: string; canView: MembershipTier; canSubmit: MembershipTier;
}> = {
  free: { name: "免费内容", color: "text-gray-400", badge: "bg-gray-500/20 text-gray-400", canView: "free", canSubmit: "gold" },
  gold: { name: "黄金内容", color: "text-amber-400", badge: "bg-amber-500/20 text-amber-400", canView: "gold", canSubmit: "gold" },
  diamond: { name: "钻石内容", color: "text-blue-400", badge: "bg-blue-500/20 text-blue-400", canView: "diamond", canSubmit: "diamond" },
};
''')
print("3. stripe-config.ts OK")

# ====== 4. src/lib/stripe.ts — update prices ======
c = read("src/lib/stripe.ts")
c = c.replace(
    '  silver:  { monthly: "price_1TeENpQ9NyBUwMBMVfMk8ww9", yearly: "price_1TeFVKQ9NyBUwMBMrfstRBsO" },\n  gold:    { monthly: "price_1TeFD3Q9NyBUwMBMKDAdmRvr", yearly: "price_1TeFVsQ9NyBUwMBMOXo9f5dC" },\n  diamond: { monthly: "price_1TeFHRQ9NyBUwMBMOYF3290s", yearly: "price_1TeFWIQ9NyBUwMBMZFCQ9i8U" },',
    '  gold:    { monthly: "price_1ThRsgQ9NyBUwMBMt0b5WkXA", yearly: "price_1ThRtDQ9NyBUwMBMSpWF4J6Y" },\n  diamond: { monthly: "price_1ThRtcQ9NyBUwMBMY5BWeUnh", yearly: "price_1ThRtrQ9NyBUwMBMY3VpweNz" },')
write("src/lib/stripe.ts", c)
print("4. lib/stripe.ts OK")

print("\n✅ All core files updated!")
