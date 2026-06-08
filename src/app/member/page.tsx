"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Star, Shield, Gift, Users, Clock, Sparkles, ArrowRight, FileText, Eye, MessageCircle } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/stripe-config";
import { supabase } from "@/lib/supabase/client";

type BillingCycle = "monthly" | "yearly";

const TIER_FEATURES = {
  silver: [
    { icon: FileText, text: "15+ 篇深度解析文章完整阅读", highlight: true },
    { icon: Eye, text: "开发进度追踪与行业周报", highlight: false },
    { icon: MessageCircle, text: "优先参与线上讨论与活动", highlight: false },
  ],
  gold: [
    { icon: FileText, text: "白银全部 + 独家爆料首发阅读", highlight: true },
    { icon: Eye, text: "每周行业情报速递（邮件）", highlight: true },
    { icon: Star, text: "付费社区讨论区 + 制作人 AMA", highlight: true },
  ],
  diamond: [
    { icon: FileText, text: "黄金全部 + 游戏测试资格优先", highlight: true },
    { icon: Star, text: "年度专属实体礼品 + 1v1 客服", highlight: true },
    { icon: Crown, text: "专属 VIP 社群 + 月度 AMA", highlight: true },
  ],
};

const STAT_CARDS = [
  { value: "15+", label: "深度文章", icon: FileText },
  { value: "每周更新", label: "行业情报", icon: Clock },
  { value: "7天", label: "无理由退款", icon: Shield },
];

export default function MemberPage() {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const { checkout, loading } = useStripeCheckout();

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }).in("required_tier", ["silver", "gold", "diamond"]).eq("status", "published"),
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
    { key: "silver" as const, ...MEMBERSHIP_TIERS.silver },
    { key: "gold" as const, ...MEMBERSHIP_TIERS.gold },
    { key: "diamond" as const, ...MEMBERSHIP_TIERS.diamond },
  ];

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-[#F1F5F9] mb-3">
            解锁<span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] bg-clip-text text-transparent"> 深度内容</span>
          </h1>
          <p className="text-[#94A3B8] max-w-lg mx-auto text-sm">
            {articleCount} 篇付费文章，覆盖国产 3A 最新爆料、深度评测与行业分析
          </p>
        </motion.div>

        {/* Social proof stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
            <Users className="w-4 h-4 text-[#06B6D4]" />
            <span><strong className="text-[#F1F5F9]">{memberCount || "—"}</strong> 位会员已加入</span>
          </div>
          <div className="w-px h-4 bg-[#334155] hidden sm:block" />
          {STAT_CARDS.map(s => (
            <div key={s.label} className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <s.icon className="w-4 h-4 text-[#10B981]" />
              <span><strong className="text-[#F1F5F9]">{s.value}</strong> {s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Billing toggle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm ${cycle === "monthly" ? "text-[#F1F5F9]" : "text-[#64748B]"}`}>月付</span>
          <button onClick={() => setCycle(cycle === "monthly" ? "yearly" : "monthly")} className="relative w-14 h-7 rounded-full bg-[#1E293B] border border-[#F59E0B]/20 transition-all">
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] transition-all ${cycle === "yearly" ? "left-7" : "left-0.5"}`} />
          </button>
          <span className={`text-sm font-semibold ${cycle === "yearly" ? "text-[#F59E0B]" : "text-[#64748B]"}`}>年付</span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] rounded-full">省 17% · 推荐</span>
        </motion.div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, i) => {
            const price = "priceMonthly" in tier ? (cycle === "monthly" ? tier.priceMonthly : tier.priceYearly) : 0;
            const isGold = tier.key === "gold";
            const isFree = tier.key === "free";
            const monthlyPrice = "priceMonthly" in tier ? (cycle === "monthly" ? tier.priceMonthly : Math.round(tier.priceYearly / 12)) : 0;

            return (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative glass-card p-6 flex flex-col ${
                  isGold ? "border-[#F59E0B]/40 ring-1 ring-[#F59E0B]/20 scale-[1.03] shadow-[0_0_48px_rgba(245,158,11,0.1)]" : isFree ? "opacity-70" : ""
                }`}
              >
                {isGold && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-xs font-bold rounded-full shadow-[0_4px_16px_rgba(245,158,11,0.3)]">最受欢迎</div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isGold ? "bg-[#F59E0B]/15 text-[#F59E0B]" : isFree ? "bg-[#64748B]/10 text-[#64748B]" : "bg-[#06B6D4]/10 text-[#06B6D4]"
                }`}>
                  {isGold ? <Crown className="w-6 h-6" /> : isFree ? <Users className="w-6 h-6" /> : tier.key === "diamond" ? <Star className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                </div>

                <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">{tier.name}</h3>
                <p className="text-xs text-[#64748B] mb-4">{tier.nameEn}</p>

                {isFree ? (
                  <div className="mb-6"><span className="text-3xl font-black text-[#94A3B8]">¥0</span></div>
                ) : (
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-[#64748B]">¥</span>
                      <span className="text-4xl font-black text-[#F1F5F9]">{price}</span>
                      <span className="text-sm text-[#64748B]">/{cycle === "monthly" ? "月" : "年"}</span>
                    </div>
                    {cycle === "yearly" && (
                      <p className="text-[10px] text-[#10B981] mt-0.5">≈ ¥{monthlyPrice}/月，年省 ¥{tier.priceMonthly * 12 - tier.priceYearly}</p>
                    )}
                  </div>
                )}

                <ul className="flex-1 space-y-2.5 mb-6">
                  {tier.key !== "free" && TIER_FEATURES[tier.key as "silver" | "gold" | "diamond"]?.map((f) => (
                    <li key={f.text} className={`flex items-start gap-2 text-sm ${f.highlight ? "text-[#F1F5F9] font-medium" : "text-[#94A3B8]"}`}>
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${f.highlight ? "text-[#10B981]" : "text-[#475569]"}`} />
                      {f.text}
                    </li>
                  ))}
                  {isFree && tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#64748B]">
                      <Check className="w-4 h-4 text-[#475569] shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>

                {isFree ? (
                  <LinkNoPrefetch href="/auth" className="block w-full py-3 rounded-xl text-center text-sm font-medium border border-[rgba(30,41,59,0.6)] text-[#64748B] hover:text-[#F1F5F9] hover:border-[#475569] transition-all">免费注册</LinkNoPrefetch>
                ) : (
                  <button onClick={() => handleBuy(tier.key)} disabled={loading && selectedTier === tier.key}
                    className={`block w-full py-3 rounded-xl text-center text-sm font-semibold text-white transition-all ${
                      isGold ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:shadow-[0_0_28px_rgba(245,158,11,0.3)]" : "bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    } disabled:opacity-50`}>
                    {loading && selectedTier === tier.key ? "处理中..." : `立即订阅 · ¥${price}/${cycle === "monthly" ? "月" : "年"}`}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust bar */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748B]">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#10B981]" /> Stripe 加密支付</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 随时取消，下期不续费</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> 7 天内无条件全额退款</span>
          <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-[#F59E0B]" /> 年付立省 17%，相当于白送 2 个月</span>
        </motion.div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-[#F1F5F9] text-center mb-8">常见问题</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              ["如何取消订阅？", "前往账户 → 管理订阅，随时可取消。已付费期间服务不受影响。"],
              ["支持哪些支付方式？", "微信、支付宝、银联、Visa/Mastercard，Stripe 处理所有支付。"],
              ["会员到期后会怎样？", "自动降为普通用户。已收藏和购买的内容仍可访问。"],
              ["可以升级或降级吗？", "升级立即生效（按比例补差价），降级在下个周期生效。"],
              ["7 天退款怎么操作？", "联系客服即可，无需理由。我们会在 3 个工作日内原路退回。"],
              ["有免费试用吗？", "有的！<a href='/trial' class='text-[#F59E0B] hover:underline'>点此免费试用</a> 3 天白银会员，无需绑定支付方式。"],
            ].map(([q, a]) => (
              <div key={q} className="glass-card p-5">
                <h4 className="font-semibold text-[#F1F5F9] mb-1.5">{q}</h4>
                <p className="text-[#94A3B8] leading-relaxed" dangerouslySetInnerHTML={{ __html: a }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
