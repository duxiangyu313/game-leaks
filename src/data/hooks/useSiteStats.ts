/**
 * 站点统计 Hook — 管理后台仪表盘
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface SiteStats {
  articles: number;
  leaks: number;
  games: number;
  users: number;
  orders: number;
  totalViews: number;
  pendingSubmissions: number;
  pendingWithdrawals: number;
  revenueTotal: number;
}

export function useSiteStats() {
  const [stats, setStats] = useState<SiteStats>({
    articles: 0, leaks: 0, games: 0, users: 0,
    orders: 0, totalViews: 0, pendingSubmissions: 0,
    pendingWithdrawals: 0, revenueTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, l, g, u, p, v, s, w, r] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("leaks").select("id", { count: "exact", head: true }),
        supabase.from("games").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }),
        supabase.from("leaks").select("view_count").eq("status", "published"),
        supabase.from("anonymous_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawal_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("revenue_records").select("amount"),
      ]);

      const totalViews = v.data?.reduce((sum, row) => sum + (row.view_count ?? 0), 0) ?? 0;
      const revenueTotal = r.data?.reduce((sum, row) => sum + ((row as { amount: number }).amount ?? 0), 0) ?? 0;

      setStats({
        articles: a.count ?? 0, leaks: l.count ?? 0, games: g.count ?? 0,
        users: u.count ?? 0, orders: p.count ?? 0, totalViews,
        pendingSubmissions: s.count ?? 0, pendingWithdrawals: w.count ?? 0,
        revenueTotal,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, loading, error, refresh };
}
