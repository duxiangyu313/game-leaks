"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Props {
  articleId: string;
  initialBookmarked?: boolean;
}

/** 收藏按钮 — 写 article_interactions 表 */
export default function BookmarkButton({ articleId, initialBookmarked = false }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [animating, setAnimating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!articleId || !userId) return;
    supabase
      .from("article_interactions")
      .select("id")
      .eq("article_id", articleId)
      .eq("user_id", userId)
      .eq("interaction_type", "bookmark")
      .maybeSingle()
      .then(({ data }) => setBookmarked(!!data));
  }, [articleId, userId]);

  const handleClick = useCallback(async () => {
    if (!userId) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    if (bookmarked) {
      setBookmarked(false);
      await supabase
        .from("article_interactions")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", userId)
        .eq("interaction_type", "bookmark");
    } else {
      setBookmarked(true);
      await supabase.from("article_interactions").insert({
        article_id: articleId,
        user_id: userId,
        interaction_type: "bookmark",
      });
    }
  }, [articleId, userId, bookmarked]);

  return (
    <button
      onClick={handleClick}
      className={`interaction-btn ${bookmarked ? "active" : ""}`}
      title={bookmarked ? "取消收藏" : "收藏"}
    >
      <Bookmark
        className={`w-5 h-5 transition-transform duration-200 ${animating ? "scale-125" : ""} ${bookmarked ? "fill-current" : ""}`}
      />
      <span className="text-xs">{bookmarked ? "已收藏" : "收藏"}</span>
    </button>
  );
}
