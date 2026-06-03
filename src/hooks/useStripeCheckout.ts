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
    try {
      const res = await fetch(`${FN_BASE}/stripe-portal`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { alert("无法打开管理页面"); }
  };

  return { checkout, manageSubscription, loading };
}
