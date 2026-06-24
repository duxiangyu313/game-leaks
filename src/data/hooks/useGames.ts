/**
 * 游戏相关 Hooks — 游戏库列表、游戏详情
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type GameRow = Database["public"]["Tables"]["games"]["Row"];

export interface GameListItem {
  id: string;
  title: string;
  developer: string | null;
  publisher: string | null;
  cover: string | null;
  genre: string[];
  platforms: string[];
  status: string | null;
  releaseDate: string | null;
  hypeScore: number;
  rating: number | null;
  description: string | null;
}

function mapGameListItem(g: GameRow): GameListItem {
  return {
    id: g.id,
    title: g.title,
    developer: g.developer,
    publisher: g.publisher,
    cover: g.cover,
    genre: g.genre ?? [],
    platforms: g.platforms ?? [],
    status: g.status,
    releaseDate: g.release_date,
    hypeScore: g.hype_score ?? 0,
    rating: g.rating,
    description: g.description,
  };
}

/** 游戏库列表 — 支持筛选和排序 */
export function useGames(filters?: {
  status?: string;
  developer?: string;
  search?: string;
  sort?: "title" | "hype_score" | "release_date" | "rating";
  ascending?: boolean;
  limit?: number;
}) {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from("games").select("*");

      if (filters?.status && filters.status !== "全部") {
        query = query.eq("status", filters.status);
      }
      if (filters?.developer) {
        query = query.ilike("developer", `%${filters.developer}%`);
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const sortCol = filters?.sort ?? "hype_score";
      const ascending = filters?.ascending ?? false;
      query = query.order(sortCol, { ascending });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setGames((data ?? []).map(mapGameListItem));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [JSON.stringify(filters)]);

  useEffect(() => { refresh(); }, [refresh]);

  return { games, loading, error, refresh };
}
