/**
 * 游戏详情 Hook — 包含所有关联数据（评论/DLC/价格/Wiki/评测/投票/配置）
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type GameRow = Database["public"]["Tables"]["games"]["Row"];
type GameRequirementRow = Database["public"]["Tables"]["game_requirements"]["Row"];
type GameWikiRow = Database["public"]["Tables"]["game_wiki"]["Row"];
type GameReviewRow = Database["public"]["Tables"]["game_reviews"]["Row"];
type GameCommentRow = Database["public"]["Tables"]["game_comments"]["Row"];
type GameDlcRow = Database["public"]["Tables"]["game_dlc"]["Row"];
type GamePriceRow = Database["public"]["Tables"]["game_prices"]["Row"];
type GamePreorderRow = Database["public"]["Tables"]["game_preorders"]["Row"];
type LeakRow = Database["public"]["Tables"]["leaks"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

export interface GameDetail {
  game: GameRow;
  requirements: GameRequirementRow | null;
  wiki: GameWikiRow | null;
  reviews: GameReviewRow[];
  comments: GameCommentRow[];
  dlcs: GameDlcRow[];
  prices: GamePriceRow[];
  preorders: GamePreorderRow[];
  relatedLeaks: LeakRow[];
  relatedVideos: ArticleRow[];
  relatedGames: GameRow[];
  userVote: string | null;
  userReview: GameReviewRow | null;
}

export function useGameDetail(id: string | null) {
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("未提供游戏ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        { data: game },
        { data: requirements },
        { data: leaks },
        { data: relatedGames },
        { data: comments },
        { data: reviews },
        { data: preorders },
        { data: prices },
        { data: dlcs },
        { data: wiki },
        { data: videos },
        { data: votes },
      ] = await Promise.all([
        supabase.from("games").select("*").eq("id", id).single(),
        supabase.from("game_requirements").select("*").eq("game_id", id).maybeSingle(),
        supabase.from("leaks").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(5),
        supabase.from("games").select("*").neq("id", id).order("hype_score", { ascending: false }).limit(4),
        supabase.from("game_comments").select("*").eq("game_id", id).order("created_at", { ascending: false }),
        supabase.from("game_reviews").select("*").eq("game_id", id).order("created_at", { ascending: false }),
        supabase.from("game_preorders").select("*").eq("game_id", id).order("price"),
        supabase.from("game_prices").select("*").eq("game_id", id).order("recorded_at", { ascending: false }),
        supabase.from("game_dlc").select("*").eq("game_id", id).order("release_date"),
        supabase.from("game_wiki").select("*").eq("game_id", id).maybeSingle(),
        supabase.from("articles").select("*").eq("category", "video").eq("status", "published").order("created_at", { ascending: false }).limit(6),
        supabase.from("game_votes").select("vote_type").eq("game_id", id),
      ]);

      const { data: { user } } = await supabase.auth.getUser();
      let userVote: string | null = null;
      let userReview: GameReviewRow | null = null;

      if (user) {
        const [{ data: uv }, { data: ur }] = await Promise.all([
          supabase.from("game_votes").select("vote_type").eq("game_id", id).eq("user_id", user.id).maybeSingle(),
          supabase.from("game_reviews").select("*").eq("game_id", id).eq("user_id", user.id).maybeSingle(),
        ]);
        userVote = uv?.vote_type ?? null;
        userReview = ur ?? null;
      }

      // 过滤关联爆料（匹配 game_name 或 game_id）
      const filteredLeaks = (leaks ?? []).filter((l) =>
        (game?.title && l.game_name === game.title) || (game?.id && l.game_id === game.id)
      );

      setDetail({
        game: game!,
        requirements: requirements ?? null,
        wiki: wiki ?? null,
        reviews: reviews ?? [],
        comments: comments ?? [],
        dlcs: dlcs ?? [],
        prices: prices ?? [],
        preorders: preorders ?? [],
        relatedLeaks: filteredLeaks,
        relatedVideos: videos ?? [],
        relatedGames: relatedGames ?? [],
        userVote,
        userReview,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { detail, loading, error, refresh };
}
