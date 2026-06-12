"use client";

import { Crown, Star, Shield, Lock } from "lucide-react";
import type { MembershipTier } from "@/types";

interface Props {
  tier: MembershipTier;
  size?: "sm" | "md" | "lg";
}

const TIER_CONFIG: Record<MembershipTier, { icon: typeof Crown; label: string; color: string; bg: string; border: string }> = {
  free: { icon: Lock, label: "免费", color: "text-[#64748B]", bg: "bg-[#64748B]/10", border: "border-[#64748B]/20" },
  gold: { icon: Crown, label: "黄金会员", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/25" },
  diamond: { icon: Star, label: "钻石会员", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/25" },
};

const SIZE_MAP = { sm: "text-[10px] px-2 py-0.5 gap-1", md: "text-xs px-2.5 py-1 gap-1.5", lg: "text-sm px-3 py-1.5 gap-2" };

/** 会员等级徽章 */
export default function MemberBadge({ tier, size = "md" }: Props) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center rounded-full border ${config.color} ${config.bg} ${config.border} ${SIZE_MAP[size]} font-semibold`}>
      <Icon className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      {config.label}
    </span>
  );
}
