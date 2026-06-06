"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, Check, Zap, Shield, MessageCircle, Gift, ArrowRight } from "lucide-react";

const BENEFITS = [
  { icon: Zap, text: "独家爆料提前24小时查看" },
  { icon: Shield, text: "无广告纯净浏览体验" },
  { icon: MessageCircle, text: "专属VIP讨论区与制作人AMA" },
  { icon: Gift, text: "每月游戏Key抽奖资格" },
];

export default function MemberPromo() {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A2332] via-[#162030] to-[#0F172A] p-8 md:p-12 cyber-border-glow"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#06B6D4]/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#22D3EE]/3 blur-[60px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-[#F59E0B]" />
              <span className="text-sm font-semibold text-[#F59E0B] tracking-wider uppercase">VIP Membership</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F1F5F9] mb-4">
              加入<span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent"> 国游爆料会员 </span>
            </h2>
            <p className="text-[#94A3B8] mb-6 max-w-md">
              获取独家爆料的优先查看权，参与制作人AMA，享受无广告纯净浏览。白银会员低至 ¥199/年。
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {BENEFITS.map((b) => (
                <li key={b.text} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  {b.text}
                </li>
              ))}
            </ul>
            <Link
              href="/member"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all"
            >
              <Crown className="w-4 h-4" />
              立即加入 · <span className="cyber-price-pulse inline-block">¥199</span>/年起
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Visual placeholder */}
          <div className="hidden lg:flex w-64 h-64 rounded-2xl bg-gradient-to-br from-[#F59E0B]/10 to-[#06B6D4]/5 border border-[rgba(245,158,11,0.15)] items-center justify-center">
            <Crown className="w-24 h-24 text-[#F59E0B]/30" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
