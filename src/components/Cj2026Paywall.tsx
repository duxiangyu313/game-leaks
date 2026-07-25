"use client";

/**
 * CJ2026 付费内容解锁组件
 * - 未付费：显示模糊遮罩 + 解锁引导
 * - 已付费：完整显示内容
 * - 支持「找回购买」入口
 */
import { useState, useEffect } from "react";
import { supabase, db } from "@/lib/supabase/client";
import { getLocalAccess, getPrice } from "@/lib/cj2026-utils";
import { Lock, Mail, ArrowRight, RefreshCw } from "lucide-react";

interface Cj2026PaywallProps {
  children: React.ReactNode;
  onUnlock?: () => void;
}

export default function Cj2026Paywall({ children, onUnlock }: Cj2026PaywallProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [error, setError] = useState("");
  const [showRecover, setShowRecover] = useState(false);

  const price = getPrice();

  // 检查解锁状态
  useEffect(() => {
    const local = getLocalAccess();
    if (local) {
      // 有本地缓存，异步验证数据库是否仍为 confirmed
      setIsUnlocked(true);
      setChecking(false);
      // 后台校验
      db
        .from("cj2026_purchases")
        .select("id, status")
        .eq("email", local.email)
        .eq("status", "confirmed")
        .limit(1)
        .then(({ data }: { data: Array<{ id: string; status: string }> | null }) => {
          if (!data || data.length === 0) {
            setIsUnlocked(false);
            setShowRecover(true);
          }
        });
    } else {
      setChecking(false);
    }
  }, []);

  // 找回购买
  async function handleRecover() {
    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setRecovering(true);
    setError("");
    const { data } = await db
      .from("cj2026_purchases")
      .select("id, status, payment_method")
      .eq("email", email.trim().toLowerCase())
      .eq("status", "confirmed")
      .limit(1);

    if (data && data.length > 0) {
      const { setLocalAccess } = await import("@/lib/cj2026-utils");
      setLocalAccess({
        email: email.trim().toLowerCase(),
        unlockedAt: new Date().toISOString(),
        paymentMethod: data[0].payment_method,
      });
      setIsUnlocked(true);
      setShowRecover(false);
    } else {
      setError("未找到该邮箱的已确认订单，请检查邮箱或先购买");
    }
    setRecovering(false);
  }

  if (checking) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-[#1E293B]/20 rounded-2xl" />
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* 模糊内容 */}
      <div className="blur-[8px] pointer-events-none select-none opacity-30">
        {children}
      </div>

      {/* 解锁引导 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A]/80 rounded-2xl border border-[#F5A623]/10">
        <div className="text-center px-6 py-8 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-[#F5A623]/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#F5A623]" />
          </div>
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">
            解锁 CJ2026 专属内容
          </h3>
          <p className="text-sm text-[#94A3B8] mb-4">
            16款游戏深度评分 · 4天每日速递 · 读者群
          </p>

          {!showRecover ? (
            <>
              <button
                onClick={onUnlock}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all flex items-center justify-center gap-2 mb-3"
              >
                ¥{price.amount} 立即解锁 <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRecover(true)}
                className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors"
              >
                已经是付费用户？找回购买
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#94A3B8]">请输入购买时使用的邮箱找回访问权限</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm rounded-lg focus:outline-none focus:border-[#F5A623]/30 placeholder:text-[#475569]"
                  />
                </div>
                <button
                  onClick={handleRecover}
                  disabled={recovering}
                  className="px-4 py-2 bg-[#06B6D4] text-white text-xs font-semibold rounded-lg hover:bg-[#0891B2] disabled:opacity-50 transition-all flex items-center gap-1"
                >
                  {recovering ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    "找回"
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-[#E94560]">{error}</p>}
              <button
                onClick={() => { setShowRecover(false); setError(""); }}
                className="text-xs text-[#64748B] hover:text-[#94A3B8]"
              >
                返回购买
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
