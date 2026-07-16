/**
 * 爆料相关 Hooks — 爆料列表、爆料详情、最新爆料
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type LeakRow = Database["public"]["Tables"]["leaks"]["Row"];

export interface LeakListItem {
  id: string;
  title: string;
  summary: string | null;
  gameName: string | null;
  source: string | null;
  credibility: string;
  publishedAt: string | null;
  viewCount: number;
  images: string[];
}

function mapLeak(l: LeakRow): LeakListItem {
  return {
    id: l.id,
    title: l.title,
    summary: l.summary,
    gameName: l.game_name,
    source: l.source,
    credibility: l.credibility ?? "rumor",
    publishedAt: l.published_at,
    viewCount: l.view_count ?? 0,
    images: l.images || [],
  };
}

/** 爆料列表 */
export function useLeaks(filters?: {
  credibility?: string;
  limit?: number;
}) {
  const [leaks, setLeaks] = useState<LeakListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("leaks")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (filters?.credibility && filters.credibility !== "all") {
        query = query.eq("credibility", filters.credibility);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setLeaks((data ?? []).map(mapLeak));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => { refresh(); }, [refresh]);

  return { leaks, loading, error, refresh };
}

/** 单条爆料详情 */
export function useLeakDetail(id: string | null) {
  const [leak, setLeak] = useState<LeakRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) { setLoading(false); setError("未提供爆料ID"); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("leaks")
        .select("*")
        .eq("id", id)
        .single();

      // PGRST116: 0 rows
      if (err && (err as { code: string }).code === "PGRST116") {
        setLeak(null);
      } else if (err) {
        throw err;
      } else {
        setLeak(data);
        supabase.rpc("increment_view", { leak_id: id }).then(() => {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { leak, loading, error, refresh };
}
