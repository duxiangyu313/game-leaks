"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Props {
  articleId: string;
  initialBelieve?: number;
  initialSkeptical?: number;
  userVote?: "believe" | "skeptical" | null;
}

/** 可信度投票 — 仅用于爆料(leak)类文章 */
export default function CredibilityVote({
  articleId,
  initialBelieve = 0,
  initialSkeptical = 0,
  userVote: initialVote = null,
}: Props) {
  const [believe, setBelieve] = useState(initialBelieve);
  const [skeptical, setSkeptical] = useState(initialSkeptical);
  const [userVote, setUserVote] = useState<"believe" | "skeptical" | null>(initialVote);
  const [userId, setUserId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // 加载计数和用户投票状态
  useEffect(() => {
    if (!articleId || !userId) return;
    Promise.all([
      supabase.from("article_interactions").select("id", { count: "exact", head: true }).eq("article_id", articleId).eq("interaction_type", "credibility_believe"),
      supabase.from("article_interactions").select("id", { count: "exact", head: true }).eq("article_id", articleId).eq("interaction_type", "credibility_skeptical"),
      supabase.from("article_interactions").select("interaction_type").eq("article_id", articleId).eq("user_id", userId).in("interaction_type", ["credibility_believe", "credibility_skeptical"]).single(),
    ]).then(([{ count: b }, { count: s }, { data: uv }]) => {
      if (b != null) setBelieve(b);
      if (s != null) setSkeptical(s);
      if (uv) setUserVote(uv.interaction_type === "credibility_believe" ? "believe" : "skeptical");
    });
  }, [articleId, userId]);

  const handleVote = useCallback(async (type: "believe" | "skeptical") => {
    if (!userId || voting) return;
    setVoting(true);

    const interactionType = type === "believe" ? "credibility_believe" : "credibility_skeptical";

    // 如果已投同类型，取消投票
    if (userVote === type) {
      setUserVote(null);
      if (type === "believe") setBelieve((c) => Math.max(0, c - 1));
      else setSkeptical((c) => Math.max(0, c - 1));
      await supabase.from("article_interactions").delete().eq("article_id", articleId).eq("user_id", userId).eq("interaction_type", interactionType);
      setVoting(false);
      return;
    }

    // 先删除旧投票（切换投票）
    if (userVote) {
      const oldType = userVote === "believe" ? "credibility_believe" : "credibility_skeptical";
      await supabase.from("article_interactions").delete().eq("article_id", articleId).eq("user_id", userId).eq("interaction_type", oldType);
      if (userVote === "believe") setBelieve((c) => Math.max(0, c - 1));
      else setSkeptical((c) => Math.max(0, c - 1));
    }

    // 新投票
    setUserVote(type);
    if (type === "believe") setBelieve((c) => c + 1);
    else setSkeptical((c) => c + 1);

    await supabase.from("article_interactions").insert({ article_id: articleId, user_id: userId, interaction_type: interactionType });
    setVoting(false);
  }, [articleId, userId, userVote, voting]);

  const total = believe + skeptical;
  const believePct = total > 0 ? Math.round((believe / total) * 100) : 0;

  return (
    <div className="glass-card p-5 my-8">
      <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">可信度投票</h4>
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={() => handleVote("believe")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            userVote === "believe"
              ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
              : "bg-[#1E293B]/40 text-[#94A3B8] border border-transparent hover:border-[#10B981]/20"
          }`}
        >
          <CheckCircle className="w-4 h-4" /> 相信 ({believe})
        </button>
        <button
          onClick={() => handleVote("skeptical")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            userVote === "skeptical"
              ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
              : "bg-[#1E293B]/40 text-[#94A3B8] border border-transparent hover:border-[#EF4444]/20"
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> 存疑 ({skeptical})
        </button>
      </div>
      {total > 0 && (
        <div>
          <div className="credibility-bar">
            <div className="credibility-bar__believe" style={{ width: `${believePct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[#64748B]">
            <span>{believePct}% 相信</span>
            <span>{100 - believePct}% 存疑</span>
          </div>
        </div>
      )}
    </div>
  );
}
