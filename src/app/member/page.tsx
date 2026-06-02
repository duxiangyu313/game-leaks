import { Metadata } from "next";
import { Crown, Check, Zap, Shield, MessageCircle, Gift, Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "会员中心 · 国游爆料",
  description: "加入国游爆料VIP会员，获取独家爆料、无广告体验、制作人AMA等专属权益",
};

const PLANS = [
  {
    name: "月度会员",
    price: "19.9",
    period: "月",
    tag: "热门",
    color: "from-[#06B6D4] to-[#0891B2]",
    borderColor: "border-[#06B6D4]/30",
    benefits: ["独家爆料提前查看", "无广告浏览", "VIP讨论区", "每月1次Key抽奖"],
  },
  {
    name: "年度会员",
    price: "199",
    period: "年",
    tag: "最值",
    color: "from-[#F59E0B] to-[#D97706]",
    borderColor: "border-[#F59E0B]/30",
    benefits: ["月度全部权益", "专属徽章+头衔", "制作人AMA优先提问", "每月3次Key抽奖", "年度实体礼物"],
    featured: true,
  },
];

export default function MemberPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Crown className="w-12 h-12 text-[#F59E0B] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#F1F5F9] mb-3">加入国游爆料会员</h1>
          <p className="text-[#94A3B8] max-w-lg mx-auto">
            获取独家爆料的优先查看权，参与制作人AMA，享受无广告纯净浏览体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass-card p-8 ${
                plan.featured ? "border-[#F59E0B]/30 ring-1 ring-[#F59E0B]/20" : ""
              }`}
            >
              {plan.tag && (
                <span className={`absolute -top-3 right-6 px-3 py-1 text-xs font-bold bg-gradient-to-r ${plan.color} text-white rounded-full`}>
                  {plan.tag}
                </span>
              )}
              <h3 className="text-xl font-bold text-[#F1F5F9] mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-black text-[#F1F5F9]">¥{plan.price}</span>
                <span className="text-[#64748B]">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth"
                className={`block w-full text-center py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${plan.color} hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all`}
              >
                立即订阅
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-[#F1F5F9] text-center mb-6">所有会员均享</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: "提前爆料", desc: "24小时优先查看" },
              { icon: Shield, label: "无广告", desc: "纯净浏览体验" },
              { icon: MessageCircle, label: "VIP讨论区", desc: "专属交流空间" },
              { icon: Gift, label: "游戏Key", desc: "每月抽奖资格" },
            ].map((item) => (
              <div key={item.label} className="glass-card p-5 text-center">
                <item.icon className="w-7 h-7 text-[#06B6D4] mx-auto mb-2" />
                <div className="text-sm font-semibold text-[#F1F5F9]">{item.label}</div>
                <div className="text-xs text-[#64748B] mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
