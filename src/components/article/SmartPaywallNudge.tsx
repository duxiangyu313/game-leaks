"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Mail, X } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import type { MembershipTier } from "@/types";

interface Props {
  membershipLevel: MembershipTier;
  triggerAtPct?: number;
}

/** 智能付费引导 — 免费/白银用户阅读超过50%时底部弹出 */
export default function SmartPaywallNudge({ membershipLevel, triggerAtPct = 50 }: Props) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    // 检查是否已关闭过（lazy init，避免 setState in effect）
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("paywall_nudge_dismissed");
    if (stored) {
      const ts = parseInt(stored, 10);
      if (Date.now() - ts < 86400000) return true;
    }
    return false;
  });
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 登录态 — 未登录访客优先引导免费注册/订阅，而非直接推付费
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // 会员无需引导（hooks 之后才能 early return）
  const isPremium = membershipLevel === "gold" || membershipLevel === "diamond";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  useEffect(() => {
    if (isPremium || dismissed) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isPremium, dismissed]);

  if (isPremium) return null;

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("paywall_nudge_dismissed", Date.now().toString());
  };

  const getUpgradeTier = (): string => {
    if (membershipLevel === "free") return "黄金";
    return "钻石";
  };

  const getUpgradePrice = (): string => {
    if (membershipLevel === "free") return "¥59/月";
    return "¥59/月";
  };

  return (
    <>
      {/* 滚动哨兵 */}
      <div ref={sentinelRef} className="h-1" style={{ marginTop: `${triggerAtPct}vh` }} />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="paywall-nudge"
          >
            <div className="max-w-[1280px] mx-auto px-4">
              {isLoggedIn ? (
                /* ── 已登录 free 用户：付费升级引导 ── */
                <div className="glass-card-intense p-5 flex items-center justify-between border border-[#F59E0B]/20 bg-gradient-to-r from-[#1A2332] to-[#162030]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F59E0B]/15 flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F1F5F9]">
                        喜欢这篇文章？升级{getUpgradeTier()}会员解锁更多深度内容
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        独家爆料 · 深度解析 · 行业报告 • 7天无理由退款
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <LinkNoPrefetch
                      href="/member"
                      className="px-5 py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-sm font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all whitespace-nowrap"
                    >
                      仅 {getUpgradePrice()} · 立即升级
                    </LinkNoPrefetch>
                    <button
                      onClick={handleDismiss}
                      className="p-2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                      aria-label="关闭"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* ── 未登录访客：先引导免费注册/订阅（低门槛），付费为次级 ── */
                <div className="glass-card-intense p-5 flex items-center justify-between border border-[#06B6D4]/20 bg-gradient-to-r from-[#16242A] to-[#14202C]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#06B6D4]/15 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#06B6D4]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F1F5F9]">
                        喜欢这篇爆料？免费订阅，新游发售/实机/预售第一时间提醒
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        免费注册即可订阅 · 无垃圾邮件 · 随时退订
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <LinkNoPrefetch
                      href="/auth"
                      className="px-5 py-2.5 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white text-sm font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all whitespace-nowrap"
                    >
                      免费注册
                    </LinkNoPrefetch>
                    <LinkNoPrefetch
                      href="/subscribe"
                      className="hidden md:inline text-xs text-[#64748B] hover:text-[#06B6D4] transition-colors whitespace-nowrap"
                    >
                      或订阅邮件
                    </LinkNoPrefetch>
                    <button
                      onClick={handleDismiss}
                      className="p-2 text-[#64748B] hover:text-[#94A3B8] transition-colors"
                      aria-label="关闭"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
