/**
 * 文章相关 Hooks — 文章列表、文章详情、互动状态
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

export interface ArticleListItem {
  id: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  requiredTier: "free" | "silver" | "gold" | "diamond" | null;
  status: string | null;
  viewCount: number;
  createdAt: string | null;
  tags: string[];
}

function mapArticle(a: ArticleRow): ArticleListItem {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.cover_image,
    category: a.category,
    requiredTier: a.required_tier as ArticleListItem["requiredTier"],
    status: a.status,
    viewCount: a.view_count ?? 0,
    createdAt: a.created_at,
    tags: a.tags ?? [],
  };
}

/** 文章列表 */
export function useArticles(filters?: {
  category?: string;
  tier?: string;
  limit?: number;
}) {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.tier) {
        query = query.eq("required_tier", filters.tier as "free" | "silver" | "gold" | "diamond");
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setArticles((data ?? []).map(mapArticle));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [JSON.stringify(filters)]);

  useEffect(() => { refresh(); }, [refresh]);

  return { articles, loading, error, refresh };
}

/** 文章详情 + 用户互动状态 */
export function useArticleDetail(id: string | null) {
  const [article, setArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLike, setUserLike] = useState(false);
  const [userBookmark, setUserBookmark] = useState(false);

  const refresh = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (err) throw err;
      setArticle(data);

      // 用户互动状态
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const [{ data: uLike }, { data: uBookmark }] = await Promise.all([
          supabase.from("article_interactions").select("id").eq("article_id", id!).eq("user_id", user.id).eq("interaction_type", "like").maybeSingle(),
          supabase.from("article_interactions").select("id").eq("article_id", id!).eq("user_id", user.id).eq("interaction_type", "bookmark").maybeSingle(),
        ]);
        setUserLike(!!uLike);
        setUserBookmark(!!uBookmark);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { article, loading, error, refresh, userLike, userBookmark };
}
