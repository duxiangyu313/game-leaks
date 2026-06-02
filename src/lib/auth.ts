/**
 * 权限验证工具函数
 * 用于检查用户会员等级和内容访问权限
 */
import { supabase } from "@/lib/supabase/client";

export type MembershipLevel = "free" | "silver" | "gold" | "diamond";
export type Visibility = "free" | "public" | "silver" | "gold" | "diamond";

const LEVEL_RANK: Record<MembershipLevel, number> = { free: 0, silver: 1, gold: 2, diamond: 3 };

/** 获取当前用户的会员等级（含到期检查） */
export async function getUserLevel(): Promise<MembershipLevel> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free";

  const { data: profile } = await supabase
    .from("profiles")
    .select("membership, subscription_end_date")
    .eq("id", user.id)
    .single();

  const level = (profile?.membership || "free") as MembershipLevel;

  // 检查会员是否过期
  if (profile?.subscription_end_date) {
    const end = new Date(profile.subscription_end_date);
    if (end < new Date() && level !== "free") {
      await supabase.from("profiles").update({ membership: "free", subscription_status: "inactive" }).eq("id", user.id);
      return "free";
    }
  }

  return level;
}

/** 检查用户是否有权限访问指定等级的内容 */
export function hasAccess(userLevel: MembershipLevel, requiredLevel: Visibility): boolean {
  if (requiredLevel === "public") return true;
  return LEVEL_RANK[userLevel] >= LEVEL_RANK[requiredLevel];
}

/** 获取可见性对应的会员等级标签 */
export function getVisibilityLabel(visibility: Visibility | MembershipLevel): string {
  const labels: Record<string, string> = { public: "免费", free: "免费", silver: "白银会员", gold: "黄金会员", diamond: "钻石会员" };
  return labels[visibility] || visibility;
}

/** 获取可见性对应的颜色样式 */
export function getVisibilityColor(visibility: Visibility | MembershipLevel): string {
  const colors: Record<string, string> = { public: "text-[#64748B]", free: "text-[#64748B]", silver: "text-[#94A3B8]", gold: "text-[#F59E0B]", diamond: "text-[#22D3EE]" };
  return colors[visibility] || "";
}

/** 获取可见性对应的背景样式 */
export function getVisibilityBg(visibility: Visibility | MembershipLevel): string {
  const bgs: Record<string, string> = { public: "bg-[#64748B]/10", free: "bg-[#64748B]/10", silver: "bg-[#94A3B8]/10", gold: "bg-[#F59E0B]/10", diamond: "bg-[#22D3EE]/10" };
  return bgs[visibility] || "";
}

/** 检查是否是管理员 */
export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
  return adminEmails.includes(user.email || "");
}

/** 获取用户需要升级到的等级 */
export function getUpgradeTier(userLevel: MembershipLevel, requiredLevel: Visibility): MembershipLevel | null {
  if (hasAccess(userLevel, requiredLevel)) return null;
  // 返回比 requiredLevel 高一级的等级
  const ranks: MembershipLevel[] = ["free", "silver", "gold", "diamond"];
  const required = ranks.indexOf(requiredLevel as MembershipLevel);
  return required >= 0 ? ranks[Math.max(required, ranks.indexOf(userLevel) + 1)] : null;
}
