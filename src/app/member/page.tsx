"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Star, Shield, Gift, Users, Clock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/stripe-config";

type BillingCycle = "monthly" | "yearly";

export default function MemberPage() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const { checkout, loading } = useStripeCheckout();

  const handleBuy = async (tier: MembershipTier) => {
    setSelectedTier(tier);
    await checkout(tier, cycle);
  };

  const tiers = [
    { key: "free" as const, ...MEMBERSHIP_TIERS.free },
    { key: "silver" as const, ...MEMBERSHIP_TIERS.silver },
    { key: "gold" as const, ...MEMBERSHIP_TIERS.gold },
    { key: "diamond" as const, ...MEMBERSHIP_TIERS.diamond },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 已有 1,280+ 会员加入
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#F1F5F9] mb-3">
            选择你的<span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent"> 会员等级</span>
          </h1>
          <p className="text-[#94A3B8] max-w-lg mx-auto">
            解锁独家爆料、深度内容与专属权益，成为国产3A游戏的第一批知情人
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <span className={`text-sm ${cycle === "monthly" ? "text-[#F1F5F9]" : "text-[#64748B]"}`}>月付</span>
          <button
            onClick={() => setCycle(cycle === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-7 rounded-full bg-[#1E293B] border border-[#F59E0B]/20 transition-all"
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all ${cycle === "yearly" ? "left-7" : "left-0.5"}`} />
          </button>
          <span className={`text-sm font-semibold ${cycle === "yearly" ? "text-[#F59E0B]" : "text-[#64748B]"}`}>
            年付
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] rounded-full">
            省 {cycle === "monthly" ? "17%" : "已选"}
          </span>
        </motion.div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, i) => {
            const price = "priceMonthly" in tier ? (cycle === "monthly" ? tier.priceMonthly : tier.priceYearly) : 0;
            const isGold = tier.key === "gold";
            const isFree = tier.key === "free";

            return (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative glass-card p-6 flex flex-col ${
                  isGold
                    ? "border-[#F59E0B]/40 ring-1 ring-[#F59E0B]/20 scale-[1.02] shadow-[0_0_40px_rgba(245,158,11,0.08)]"
                    : ""
                }`}
              >
                {/* Popular badge */}
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold rounded-full shadow-[0_4px_16px_rgba(245,158,11,0.3)]">
                    最受欢迎
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isGold ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                  isFree ? "bg-[#64748B]/15 text-[#94A3B8]" :
                  "bg-[#06B6D4]/10 text-[#06B6D4]"
                }`}>
                  {isGold ? <Crown className="w-6 h-6" /> :
                   isFree ? <Users className="w-6 h-6" /> :
                   tier.key === "diamond" ? <Star className="w-6 h-6" /> :
                   <Shield className="w-6 h-6" />}
                </div>

                <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">{tier.name}</h3>
                <p className="text-xs text-[#64748B] mb-4">{tier.nameEn}</p>

                {/* Price */}
                {isFree ? (
                  <div className="mb-6">
                    <span className="text-3xl font-black text-[#F1F5F9]">免费</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm text-[#64748B]">¥</span>
                    <span className={`text-3xl font-black text-[#F1F5F9] ${(tier.key as string) !== "free" ? "cyber-price-pulse inline-block" : ""}`}>{price}</span>
                    <span className="text-sm text-[#64748B]">/{cycle === "monthly" ? "月" : "年"}</span>
                  </div>
                )}

                {/* Features */}
                <ul className="flex-1 space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isFree ? (
                  <Link
                    href="/auth"
                    className="block w-full py-3 rounded-xl text-center font-semibold border border-[rgba(30,41,59,0.6)] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#06B6D4]/20 transition-all"
                  >
                    免费注册
                  </Link>
                ) : (
                  <button
                    onClick={() => handleBuy(tier.key)}
                    disabled={loading && selectedTier === tier.key}
                    className={`block w-full py-3 rounded-xl text-center font-semibold text-white transition-all ${
                      isGold
                        ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:shadow-[0_0_28px_rgba(245,158,11,0.3)]"
                        : "bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    } disabled:opacity-50`}
                  >
                    {loading && selectedTier === tier.key ? "处理中..." : "立即订阅"}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-[#64748B]"
        >
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#10B981]" /> 安全支付 · Stripe 加密</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 随时取消续费</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> 7天无理由退款</span>
          <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-[#F59E0B]" /> 年付平均省17%</span>
        </motion.div>

        {/* FAQ quick */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-[#F1F5F9] text-center mb-8">常见问题</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ["如何取消订阅？", "前往账户设置 → 管理订阅，或联系客服取消。已支付期间的服务不受影响。"],
              ["支持哪些支付方式？", "支持微信支付、支付宝、Visa/Mastercard等所有主流支付方式。"],
              ["会员到期后会发生什么？", "到期后自动降为普通用户，之前收藏和购买的内容仍可查看。"],
              ["可以升级或降级会员吗？", "随时可以！升级立即生效，降级在当前周期结束后生效。"],
            ].map(([q, a]) => (
              <div key={q} className="glass-card p-5">
                <h4 className="font-semibold text-[#F1F5F9] mb-1.5">{q}</h4>
                <p className="text-[#94A3B8] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
