"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/stripe-config";

interface Props {
  requiredTier: MembershipTier;
  children: React.ReactNode;
  fallback?: React.ReactNode; // 自定义无权限提示
}

/**
 * 内容门控组件 — 根据会员等级控制内容可见性
 *
 * 用法:
 * <MembershipGate requiredTier="gold">
 *   <SecretContent />
 * </MembershipGate>
 */
export default function MembershipGate({ requiredTier, children, fallback }: Props) {
  const [tier, setTier] = useState<MembershipTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTier("free"); setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("membership, subscription_end_date")
        .eq("id", user.id)
        .single();

      // 检查会员是否过期
      if (profile?.subscription_end_date) {
        const end = new Date(profile.subscription_end_date);
        if (end < new Date()) {
          // 已过期，降为免费
          await supabase.from("profiles").update({ membership: "free" }).eq("id", user.id);
          setTier("free");
          setLoading(false);
          return;
        }
      }

      setTier(profile?.membership || "free");
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-[#1E293B]/40 rounded-xl h-32" />;
  }

  const currentTierLevel = MEMBERSHIP_TIERS[tier || "free"].tier;
  const requiredLevel = MEMBERSHIP_TIERS[requiredTier].tier;

  if (currentTierLevel >= requiredLevel) {
    return <>{children}</>;
  }

  // 无权限 — 显示升级提示
  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/20 bg-gradient-to-br from-[#1A2332] to-[#162030] p-8 text-center">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#F59E0B]/5 blur-[40px]" />
      <Lock className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" />
      <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">
        此内容需要 {MEMBERSHIP_TIERS[requiredTier].name} 及以上
      </h3>
      <p className="text-sm text-[#94A3B8] mb-6 max-w-md mx-auto">
        升级会员即可解锁此内容，获取独家爆料与深度解析
      </p>
      <Link
        href="/member"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all"
      >
        <Crown className="w-4 h-4" />
        立即升级
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
