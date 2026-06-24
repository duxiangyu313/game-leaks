/**
 * 搜索 Hook — 跨表搜索游戏/爆料/文章
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "game" | "leak" | "article";
  link: string;
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const term = `%${trimmed}%`;

      const [{ data: games }, { data: leaks }, { data: articles }] = await Promise.all([
        supabase.from("games").select("id,title,developer,genre").ilike("title", term).limit(5),
        supabase.from("leaks").select("id,title,summary,game_name").eq("status", "published").ilike("title", term).limit(5),
        supabase.from("articles").select("id,title,excerpt,category").eq("status", "published").ilike("title", term).limit(5),
      ]);

      const items: SearchResult[] = [];
      for (const g of games ?? []) {
        items.push({
          id: g.id, title: g.title,
          subtitle: `${g.developer ?? ""} · ${(g.genre ?? []).join("、")}`,
          type: "game", link: `/games/detail?id=${g.id}`,
        });
      }
      for (const l of leaks ?? []) {
        items.push({
          id: l.id, title: l.title,
          subtitle: l.summary?.slice(0, 100) ?? l.game_name ?? "",
          type: "leak", link: `/leaks/detail?id=${l.id}`,
        });
      }
      for (const a of articles ?? []) {
        items.push({
          id: a.id, title: a.title,
          subtitle: a.excerpt?.slice(0, 100) ?? a.category ?? "",
          type: "article", link: `/articles/detail?id=${a.id}`,
        });
      }

      setResults(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "搜索失败");
    }
    setLoading(false);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  return { results, loading, error };
}
