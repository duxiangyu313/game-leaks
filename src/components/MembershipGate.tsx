"use client";
import { useEffect, useState } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/stripe-config";
import type { ContentLevel } from "@/types";

interface Props { requiredTier?: MembershipTier; contentLevel?: ContentLevel; children: React.ReactNode; fallback?: React.ReactNode; }

export default function MembershipGate({ requiredTier, contentLevel, children, fallback }: Props) {
  const [tier, setTier] = useState<MembershipTier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTier("free"); setLoading(false); return; }
    const { data: p } = await supabase.from("profiles").select("membership").eq("id", user.id).maybeSingle();
    setTier(p?.membership || "free"); setLoading(false);
  })(); }, []);

  if (loading) return <div className="animate-pulse bg-[#1E293B]/40 rounded-xl h-32" />;

  const cur = MEMBERSHIP_TIERS[tier || "free"].tier;

  if (contentLevel) {
    const CR: Record<ContentLevel, number> = { free: 0, gold: 1, diamond: 2 };
    if (cur >= (CR[contentLevel] ?? 0)) return <>{children}</>;
  }
  if (requiredTier) {
    const req = MEMBERSHIP_TIERS[requiredTier].tier;
    if (cur >= req) return <>{children}</>;
  }
  if (!requiredTier && !contentLevel) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const label = contentLevel ? (contentLevel === "diamond" ? "钻石" : "黄金") : MEMBERSHIP_TIERS[requiredTier!].name;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/20 bg-gradient-to-br from-[#1A2332] to-[#162030] p-8 text-center">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#F59E0B]/5 blur-[40px]" />
      <Lock className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" />
      <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">此内容需要 {label}{contentLevel ? "会员" : "及以上"}</h3>
      <p className="text-sm text-[#94A3B8] mb-6 max-w-md mx-auto">升级会员即可解锁此内容</p>
      <LinkNoPrefetch href="/member" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all">
        <Crown className="w-4 h-4" />立即升级<ArrowRight className="w-4 h-4" /></LinkNoPrefetch>
    </div>
  );
}
