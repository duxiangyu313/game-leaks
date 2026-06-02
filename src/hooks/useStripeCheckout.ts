"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MembershipTier } from "@/lib/stripe-config";

/**
 * Stripe Checkout Hook — 客户端支付流程
 * 使用方式: const { checkout, loading } = useStripeCheckout();
 */
export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);

  const checkout = async (tier: MembershipTier, cycle: "monthly" | "yearly") => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("请先登录");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, cycle, userId: user.id, email: user.email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "支付请求失败");
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      alert(err.message || "支付失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  /** 打开 Stripe Customer Portal 管理订阅 */
  const manageSubscription = async (customerId: string) => {
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      alert("无法打开管理页面");
    }
  };

  return { checkout, manageSubscription, loading };
}
