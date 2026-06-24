/**
 * 论坛相关 Hooks
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ForumPostRow = Database["public"]["Tables"]["forum_posts"]["Row"];

/** 论坛帖子列表 */
export function useForumPosts(category?: string) {
  const [posts, setPosts] = useState<ForumPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setPosts(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [category]);

  useEffect(() => { refresh(); }, [refresh]);

  return { posts, loading, error, refresh };
}

/** 论坛帖子详情 + 回复 */
export function useForumPost(id: string | null) {
  const [post, setPost] = useState<ForumPostRow | null>(null);
  const [replies, setReplies] = useState<Database["public"]["Tables"]["forum_replies"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("forum_posts").select("*").eq("id", id).single(),
        supabase.from("forum_replies").select("*").eq("post_id", id).order("created_at", { ascending: true }),
      ]);

      if (p) setPost(p);
      setReplies(r ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { post, replies, loading, error, refresh };
}
