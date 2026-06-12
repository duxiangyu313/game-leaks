"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Shield, Gift, Users, Clock, ArrowRight, Sparkles } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/stripe-config";
import { supabase } from "@/lib/supabase/client";

type BillingCycle = "monthly" | "yearly";

const TIER_FEATURES: Record<Exclude<MembershipTier, "free">, { text: string; highlight: boolean }[]> = {
  gold: [
    { text: "观看所有黄金内容（深度解析、独家攻略）", highlight: true },
    { text: "投稿免费 & 黄金内容", highlight: true },
    { text: "25% 创作者收益分成", highlight: false },
    { text: "高清原画下载", highlight: false },
    { text: "24小时优先审核", highlight: false },
  ],
  diamond: [
    { text: "黄金会员全部权益", highlight: true },
    { text: "观看钻石内容（全网独家爆料、开发者访谈）", highlight: true },
    { text: "投稿所有等级内容", highlight: true },
    { text: "40% 创作者收益分成", highlight: true },
    { text: "12小时优先审核", highlight: false },
    { text: "专属客服 + 邀请奖励翻倍", highlight: false },
  ],
};

export default function MemberPage() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const { checkout, loading } = useStripeCheckout();

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true })
        .in("required_tier", ["gold", "diamond"]).eq("status", "published"),
    ]).then(([{ count: mc }, { count: ac }]) => {
      if (mc) setMemberCount(mc);
      if (ac) setArticleCount(ac);
    });
  }, []);

  const handleBuy = async (tier: MembershipTier) => {
    setSelectedTier(tier);
    await checkout(tier, cycle);
  };

  const tiers = [
    { key: "free" as const, ...MEMBERSHIP_TIERS.free },
    { key: "gold" as const, ...MEMBERSHIP_TIERS.gold },
    { key: "diamond" as const, ...MEMBERSHIP_TIERS.diamond },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1020px] mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-[#F1F5F9] mb-3">
            解锁<span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent"> 深度内容</span>
          </h1>
          <p className="text-[#94A3B8] max-w-lg mx-auto text-sm">
            {articleCount} 篇付费内容，覆盖国产 3A 最新爆料、深度评测与独家分析
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Users className="w-4 h-4 text-[#3B82F6]" />
            <span><strong className="text-[#F1F5F9]">{memberCount || "—"}</strong> 位会员已加入</span>
          </div>
          <div className="w-px h-4 bg-[#334155] hidden sm:block" />
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Shield className="w-4 h-4 text-[#10B981]" /><span>7 天无理由退款</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm ${cycle === "monthly" ? "text-[#F1F5F9]" : "text-[#64748B]"}`}>月付</span>
          <button onClick={() => setCycle(cycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full bg-[#1E293B] border border-[#F59E0B]/20 transition-all">
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all ${cycle === "yearly" ? "left-7" : "left-0.5"}`} />
          </button>
          <span className={`text-sm font-semibold ${cycle === "yearly" ? "text-[#F59E0B]" : "text-[#64748B]"}`}>年付</span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] rounded-full">省 17% · 推荐</span>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[900px] mx-auto">
          {tiers.map((tier, i) => {
            const price = "priceMonthly" in tier ? (cycle === "monthly" ? tier.priceMonthly : tier.priceYearly) : 0;
            const isGold = tier.key === "gold"; const isFree = tier.key === "free"; const isDiamond = tier.key === "diamond";
            return (
              <motion.div key={tier.key} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`relative glass-card p-6 flex flex-col ${
                  isGold ? "border-[#F59E0B]/40 ring-1 ring-[#F59E0B]/20 scale-[1.03] shadow-[0_0_48px_rgba(245,158,11,0.1)]" :
                  isDiamond ? "border-[#3B82F6]/30" : isFree ? "opacity-70" : ""}`}>
                {isGold && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold rounded-full shadow-[0_4px_16px_rgba(245,158,11,0.3)]">最受欢迎</div>}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isGold ? "bg-[#F59E0B]/15 text-[#F59E0B]" : isDiamond ? "bg-[#3B82F6]/15 text-[#3B82F6]" : "bg-[#64748B]/10 text-[#64748B]"}`}>
                  {isGold ? <Crown className="w-6 h-6" /> : isDiamond ? <Sparkles className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">{tier.name}</h3>
                <p className="text-xs text-[#64748B] mb-4">{tier.nameEn}</p>
                {isFree ? (
                  <div className="mb-6"><span className="text-3xl font-black text-[#94A3B8]">¥0</span><span className="text-sm text-[#64748B] ml-1">永久</span></div>
                ) : (
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1"><span className="text-sm text-[#64748B]">¥</span><span className="text-4xl font-black text-[#F1F5F9]">{price}</span><span className="text-sm text-[#64748B]">/{cycle === "monthly" ? "月" : "年"}</span></div>
                    {cycle === "yearly" && <p className="text-[10px] text-[#10B981] mt-0.5">≈ ¥{Math.round(price/12)}/月</p>}
                  </div>
                )}
                <ul className="flex-1 space-y-2.5 mb-6">
                  {tier.key !== "free" && TIER_FEATURES[tier.key]?.map(f => (
                    <li key={f.text} className={`flex items-start gap-2 text-sm ${f.highlight ? "text-[#F1F5F9] font-medium" : "text-[#94A3B8]"}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${f.highlight ? "text-[#10B981]" : "text-[#475569]"}`} />{f.text}
                    </li>
                  ))}
                  {isFree && tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#64748B]"><Check className="w-4 h-4 text-[#475569] shrink-0 mt-0.5" />{f}</li>
                  ))}
                </ul>
                {isFree ? (
                  <LinkNoPrefetch href="/auth" className="block w-full py-3 rounded-xl text-center text-sm font-medium border border-[rgba(30,41,59,0.6)] text-[#64748B] hover:text-[#F1F5F9] transition-all">免费注册</LinkNoPrefetch>
                ) : (
                  <button onClick={() => handleBuy(tier.key)} disabled={loading && selectedTier === tier.key}
                    className={`block w-full py-3 rounded-xl text-center text-sm font-semibold text-white transition-all ${isGold ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:shadow-[0_0_28px_rgba(245,158,11,0.3)]" : "bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"} disabled:opacity-50`}>
                    {loading && selectedTier === tier.key ? "处理中..." : `立即订阅 · ¥${price}/${cycle === "monthly" ? "月" : "年"}`}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#10B981]" /> 支付宝 · 微信支付</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 随时取消，下期不续费</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> 7 天内无条件全额退款</span>
          <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-[#F59E0B]" /> 年付立省 17%</span>
        </motion.div>
      </div>
    </div>
  );
}
