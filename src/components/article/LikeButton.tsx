"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Props {
  articleId: string;
  initialCount?: number;
  initialLiked?: boolean;
  isGold?: boolean;
}

/** 点赞按钮 — 乐观更新，写 article_interactions 表 */
export default function LikeButton({ articleId, initialCount = 0, initialLiked = false, isGold }: Props) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [animating, setAnimating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // 加载初始状态和计数
  useEffect(() => {
    if (!articleId || !userId) return;
    // 获取总点赞数
    supabase
      .from("article_interactions")
      .select("id", { count: "exact", head: true })
      .eq("article_id", articleId)
      .eq("interaction_type", "like")
      .then(({ count: c }) => {
        if (c != null) setCount(c);
      });
    // 检查用户是否已点赞
    supabase
      .from("article_interactions")
      .select("id")
      .eq("article_id", articleId)
      .eq("user_id", userId)
      .eq("interaction_type", "like")
      .single()
      .then(({ data }) => setLiked(!!data));
  }, [articleId, userId]);

  const handleClick = useCallback(async () => {
    if (!userId) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // 乐观更新
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      await supabase
        .from("article_interactions")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", userId)
        .eq("interaction_type", "like");
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      await supabase.from("article_interactions").insert({
        article_id: articleId,
        user_id: userId,
        interaction_type: "like",
      });
    }
  }, [articleId, userId, liked]);

  return (
    <button
      onClick={handleClick}
      className={`interaction-btn ${liked ? (isGold ? "active gold" : "active") : ""}`}
      title={liked ? "取消点赞" : "点赞"}
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-200 ${animating ? "scale-125" : ""} ${liked ? "fill-current" : ""}`}
      />
      <span className="text-xs">{count > 0 ? count : "点赞"}</span>
    </button>
  );
}
