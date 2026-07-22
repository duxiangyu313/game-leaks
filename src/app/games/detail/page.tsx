"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useGameDetail } from "@/data/hooks";
import { Loader2 } from "lucide-react";
import { addHistory } from "@/components/account/BrowsingHistory";
import GameHeader from "@/components/game/GameHeader";
import GameProgressCard from "@/components/game/GameProgressCard";
import GameTabs from "@/components/game/GameTabs";
import RelatedGames from "@/components/game/RelatedGames";
import Lightbox from "@/components/game/Lightbox";
import { BreadcrumbListSchema } from "@/components/StructuredData";

type Tab = "intro" | "requirements" | "reviews" | "preorders" | "scores" | "prices" | "dlc" | "videos" | "wiki" | "leaks" | "gallery" | "comments";

function DetailContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const { detail, loading, error, refresh } = useGameDetail(id);

  const [tab, setTab] = useState<Tab>("intro");
  const [lightbox, setLightbox] = useState<string | null>(null);

  // 投票计数
  const [localVotes, setLocalVotes] = useState({ hype: 0, neutral: 0, disappoint: 0 });
  const [localUserVote, setLocalUserVote] = useState<string | null>(null);

  // 同步 hook 的投票数据到本地
  useEffect(() => {
    if (detail) {
      setLocalUserVote(detail.userVote);
    }
  }, [detail]);

  // ── SEO ──
  useEffect(() => {
    if (detail?.game) {
      document.title = `${detail.game.title} · 国游爆料`;
      const desc = detail.game.description || `${detail.game.title} — ${detail.game.developer || "国产游戏"}，最新动态、评测、攻略`;
      let meta = document.querySelector("meta[name='description']");
      if (meta) { meta.setAttribute("content", desc); }
      else { meta = document.createElement("meta"); meta.setAttribute("name", "description"); meta.setAttribute("content", desc); document.head.appendChild(meta); }
      // OG tags
      let ogTitle = document.querySelector("meta[property='og:title']");
      if (ogTitle) { ogTitle.setAttribute("content", `${detail.game.title} · 国游爆料`); }
      let ogDesc = document.querySelector("meta[property='og:description']");
      if (ogDesc) { ogDesc.setAttribute("content", desc); }

      addHistory({ id: detail.game.id, title: detail.game.title, link: `/games/detail?id=${detail.game.id}`, type: "game" });
    }
  }, [detail]);

  // ── Handlers ──
  const handleVote = async (type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("请先登录"); return; }
    if (localUserVote) return;
    await supabase.from("game_votes").insert({ game_id: id!, user_id: user.id, vote_type: type });
    setLocalUserVote(type);
    setLocalVotes(prev => ({
      ...prev,
      hype: prev.hype + (type === "hype" ? 1 : 0),
      neutral: prev.neutral + (type === "neutral" ? 1 : 0),
      disappoint: prev.disappoint + (type === "disappoint" ? 1 : 0),
    }));
  };

  const handleComment = async (text: string, rating: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("请先登录"); return; }
    const { data } = await supabase.from("game_comments").insert({ game_id: id!, user_id: user.id, content: text, rating }).select().single();
    if (data) refresh(); // 刷新全部评论
  };

  const handleReviewSuccess = () => {
    refresh(); // 刷新全部评测
  };

  // ── Computed ──
  const screenshots = detail?.game
    ? Array.from({ length: 4 }, (_, i) => ({
        src: `https://placehold.co/800x450/1E293B/06B6D4?text=${encodeURIComponent(detail.game.title + ' 截图 ' + (i + 1))}`,
        alt: `${detail.game.title} 截图 ${i + 1}`,
      }))
    : [];

  // ── Loading / Error / Not Found ──
  if (loading) return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 animate-pulse">
        <div className="h-64 bg-[#1E293B]/30 rounded-2xl mb-6" />
        <div className="h-8 w-64 bg-[#1E293B]/30 rounded mb-4" />
        <div className="h-96 bg-[#1E293B]/20 rounded-xl" />
      </div>
    </div>
  );

  if (error) return (
    <div className="pt-20 pb-20 text-center">
      <p className="text-[#EF4444] text-sm mb-2">加载失败</p>
      <p className="text-[#64748B] text-xs">{error}</p>
    </div>
  );

  if (!detail?.game) return (
    <div className="pt-20 pb-20 text-center text-[#64748B]">游戏未找到</div>
  );

  // ── Render ──
  return (
    <div className="pt-20 pb-20">
      {detail?.game && (
        <BreadcrumbListSchema items={[
          { name: "首页", url: "https://news.guoyouwenduji.cc/" },
          { name: "游戏库", url: "https://news.guoyouwenduji.cc/games/" },
          { name: detail.game.title, url: `https://news.guoyouwenduji.cc/games/detail/?id=${detail.game.id}` },
        ]} />
      )}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <GameHeader game={detail.game} />
        <GameProgressCard
          status={detail.game.status || ""}
          hypeVotes={localVotes.hype}
          midVotes={localVotes.neutral}
          disappointVotes={localVotes.disappoint}
          userVote={localUserVote}
          onVote={handleVote}
        />
        <GameTabs
          tab={tab} onTabChange={setTab}
          game={detail.game} gameId={id!}
          leaks={detail.relatedLeaks}
          comments={detail.comments}
          reviews={detail.reviews}
          userReview={detail.userReview}
          requirements={detail.requirements}
          preorders={detail.preorders}
          prices={detail.prices}
          dlc={detail.dlcs}
          wiki={detail.wiki}
          videos={detail.relatedVideos}
          screenshots={screenshots}
          onImageClick={setLightbox}
          onReviewSuccess={handleReviewSuccess}
          onComment={handleComment}
        />
        <RelatedGames games={detail.relatedGames} />
      </div>
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

export default function GameDetailPage() {
  return (
    <Suspense fallback={<div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>}>
      <DetailContent />
    </Suspense>
  );
}
