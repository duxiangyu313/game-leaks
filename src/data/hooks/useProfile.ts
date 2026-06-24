/**
 * 用户资料 Hook — 个人中心、会员等级、权限判断
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MembershipTier = "free" | "silver" | "gold" | "diamond";

export interface UserProfile {
  id: string;
  email: string | null;
  username: string | null;
  membership: MembershipTier;
  subscriptionStatus: string | null;
  subscriptionEndDate: string | null;
  stripeCustomerId: string | null;
}

function mapProfile(p: ProfileRow | null): UserProfile | null {
  if (!p) return null;
  return {
    id: p.id,
    email: null, // 由 auth.user 补充
    username: p.username,
    membership: (p.membership as MembershipTier) || "free",
    subscriptionStatus: p.subscription_status,
    subscriptionEndDate: p.subscription_end_date,
    stripeCustomerId: p.stripe_customer_id,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: p, error: err } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (err) throw err;

      const mapped = mapProfile(p);
      if (mapped) mapped.email = user.email ?? null;
      setProfile(mapped);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const membership: MembershipTier = profile?.membership ?? "free";
  const isLoggedIn = !!profile;
  const isGold = membership === "gold" || membership === "diamond";
  const isDiamond = membership === "diamond";

  return { profile, loading, error, refresh, membership, isLoggedIn, isGold, isDiamond };
}

/** 获取当前用户等级（非 hook 版本，用于非组件上下文） */
export async function getUserMembership(): Promise<MembershipTier> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "free";
    const { data } = await supabase
      .from("profiles")
      .select("membership")
      .eq("id", user.id)
      .maybeSingle();
    return (data?.membership as MembershipTier) || "free";
  } catch {
    return "free";
  }
}
