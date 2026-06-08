"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { MembershipTier } from "@/lib/stripe-config";

const FN_BASE = "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1";

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);

  const checkout = async (tier: MembershipTier, cycle: "monthly" | "yearly") => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("请先登录");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${FN_BASE}/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ tier, cycle }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "支付请求失败");
      if (result.url) window.location.href = result.url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "支付失败，请稍后重试");
    } finally { setLoading(false); }
  };

  const manageSubscription = async (customerId: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${FN_BASE}/stripe-portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ customerId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "请求失败");
      if (result.url) {
        // Stripe门户在海外，国内加载慢是正常的，直接跳转
        window.open(result.url, "_blank");
      } else {
        alert("无法获取管理页面链接");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Stripe门户暂时不可用，请稍后重试或联系客服");
    } finally { setLoading(false); }
  };

  return { checkout, manageSubscription, loading };
}
