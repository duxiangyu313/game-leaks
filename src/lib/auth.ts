/**
 * 权限验证 — UGC 3级会员制：free / gold / diamond
 */
import { supabase } from "@/lib/supabase/client";
import type { MembershipTier, ContentLevel } from "@/types";

export type MembershipLevel = MembershipTier;
export type Visibility = "free" | "public" | "silver" | "gold" | "diamond";

const LEVEL_RANK: Record<MembershipLevel, number> = { free: 0, silver: 0.5, gold: 1, diamond: 2 };

export async function getUserLevel(): Promise<MembershipLevel> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";
  // 只查 membership — 简化后的 profiles 表已无 subscription_end_date/banned 列
  const { data: profile } = await supabase
    .from("profiles").select("membership")
    .eq("id", user.id).maybeSingle();
  return ((profile as { membership?: string } | null)?.membership || "free") as MembershipLevel;
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
  const MAX: Record<MembershipLevel, number> = { free: -1, silver: 0, gold: 1, diamond: 2 };
  const CR: Record<ContentLevel, number> = { free: 0, gold: 1, diamond: 2 };
  return CR[contentLevel] <= (MAX[userLevel] ?? -1);
}

export function getVisibilityLabel(v: Visibility | MembershipLevel): string {
  const l: Record<string, string> = { public: "免费", free: "免费", silver: "白银会员", gold: "黄金会员", diamond: "钻石会员" };
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
  try {
    const level = await getUserLevel();
    if (level === "diamond") return true;
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    return !!(user?.email && adminEmails.includes(user.email.toLowerCase()));
  } catch {
    // Supabase 查询失败时，退回到纯邮箱检查
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      return !!(user?.email && adminEmails.includes(user.email.toLowerCase()));
    } catch {
      return false;
    }
  }
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
