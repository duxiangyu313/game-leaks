"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Crown, Clock, CreditCard, Settings, LogOut, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { MEMBERSHIP_TIERS, type MembershipTier } from "@/lib/stripe-config";

interface Profile {
  username: string;
  membership: MembershipTier;
  subscription_status: string;
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { manageSubscription } = useStripeCheckout();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("profiles")
        .select("username, membership, subscription_status, subscription_end_date, stripe_customer_id")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-[#1E293B]/40 rounded-2xl" />
            <div className="h-24 bg-[#1E293B]/40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-20 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <User className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">请先登录</h1>
          <p className="text-[#94A3B8] mb-6">登录后可查看和管理你的会员信息</p>
          <Link
            href="/auth"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-semibold rounded-xl"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  const tier = MEMBERSHIP_TIERS[profile.membership];
  const isActive = profile.subscription_status === "active";
  const daysLeft = profile.subscription_end_date
    ? Math.ceil((new Date(profile.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-[#F1F5F9] mb-8"
        >
          我的账户
        </motion.h1>

        {/* Membership card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-8 mb-6 relative overflow-hidden ${
            profile.membership !== "free" ? "border-[#F59E0B]/20" : ""
          }`}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#F59E0B]/3 blur-[40px]" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className={`w-5 h-5 ${profile.membership !== "free" ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
                <span className="text-sm font-semibold text-[#F1F5F9]">{tier.name}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#64748B]/15 text-[#64748B]"
                }`}>
                  {isActive ? "生效中" : "未激活"}
                </span>
              </div>
              {isActive && daysLeft > 0 && (
                <p className="text-sm text-[#94A3B8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  剩余 {daysLeft} 天
                  {daysLeft <= 7 && (
                    <span className="flex items-center gap-1 text-[#F59E0B]">
                      <AlertTriangle className="w-3.5 h-3.5" /> 即将到期
                    </span>
                  )}
                </p>
              )}
              {!isActive && profile.membership === "free" && (
                <p className="text-sm text-[#64748B]">升级会员解锁更多内容</p>
              )}
            </div>
            <div className="flex gap-2">
              {isActive && (
                <button
                  onClick={() => manageSubscription(profile.stripe_customer_id!)}
                  className="px-4 py-2 text-sm font-medium border border-[rgba(30,41,59,0.6)] text-[#94A3B8] rounded-lg hover:text-[#F1F5F9] hover:border-[#06B6D4]/20 transition-all"
                >
                  管理订阅
                </button>
              )}
              {profile.membership === "free" && (
                <Link
                  href="/member"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-lg"
                >
                  升级会员
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          {[
            { icon: Clock, label: "浏览记录", href: "#" },
            { icon: CreditCard, label: "支付记录", href: "#" },
            { icon: Settings, label: "账号设置", href: "#" },
            { icon: Shield, label: "隐私设置", href: "#" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="glass-card p-4 flex items-center gap-3 hover:border-[#06B6D4]/20 transition-all"
            >
              <item.icon className="w-5 h-5 text-[#64748B]" />
              <span className="text-sm text-[#94A3B8]">{item.label}</span>
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-sm text-[#EF4444] hover:text-[#FCA5A5] transition-colors"
          >
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </motion.div>
      </div>
    </div>
  );
}
