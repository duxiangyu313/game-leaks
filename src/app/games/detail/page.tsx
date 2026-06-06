"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import GameHeader from "@/components/game/GameHeader";
import GameProgressCard from "@/components/game/GameProgressCard";
import GameTabs from "@/components/game/GameTabs";
import RelatedGames from "@/components/game/RelatedGames";
import Lightbox from "@/components/game/Lightbox";

type Tab = "intro" | "requirements" | "reviews" | "preorders" | "scores" | "prices" | "dlc" | "videos" | "wiki" | "leaks" | "gallery" | "comments";

function DetailContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [game, setGame] = useState<any>(null);
  const [leaks, setLeaks] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("intro");

  // Vote state
  const [hypeVotes, setHypeVotes] = useState(0);
  const [midVotes, setMidVotes] = useState(0);
  const [disappointVotes, setDisappointVotes] = useState(0);
  const [userVote, setUserVote] = useState<string | null>(null);

  // Data states
  const [requirements, setRequirements] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [preorders, setPreorders] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [dlc, setDlc] = useState<any[]>([]);
  const [wiki, setWiki] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // ── SEO: 客户端更新 document.title ──
  useEffect(() => {
    if (!game) return;
    document.title = `${game.title} · 国游爆料`;
  }, [game]);

  // ── Data fetching ──
  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("games").select("*").eq("id", id).single(),
      supabase.from("leaks").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(5),
      supabase.from("games").select("*").neq("id", id).order("hype_score", { ascending: false }).limit(4),
      supabase.from("game_comments").select("*").eq("game_id", id).order("created_at", { ascending: false }),
      supabase.from("game_requirements").select("*").eq("game_id", id).single(),
      supabase.from("game_reviews").select("*").eq("game_id", id).order("created_at", { ascending: false }),
      supabase.from("game_preorders").select("*").eq("game_id", id).order("price"),
      supabase.from("game_prices").select("*").eq("game_id", id).order("recorded_at", { ascending: false }),
      supabase.from("game_dlc").select("*").eq("game_id", id).order("release_date"),
      supabase.from("game_wiki").select("*").eq("game_id", id).single(),
      supabase.from("articles").select("*").eq("category", "video").eq("status", "published").order("created_at", { ascending: false }).limit(6),
      supabase.from("game_votes").select("vote_type").eq("game_id", id),
    ]).then(async ([
      { data: g }, { data: lks }, { data: rel }, { data: cmts },
      { data: reqs }, { data: rvs }, { data: pos }, { data: prs },
      { data: dls }, { data: wk }, { data: vds }, { data: votes },
    ]) => {
      setGame(g);
      setLeaks(lks || []);
      setRelated(rel || []);
      setComments(cmts || []);
      setRequirements(reqs);
      setReviews(rvs || []);
      setPreorders(pos || []);
      setPrices(prs || []);
      setDlc(dls || []);
      setWiki(wk);
      setVideos(vds || []);

      if (votes) {
        setHypeVotes(votes.filter((v: any) => v.vote_type === "hype").length);
        setMidVotes(votes.filter((v: any) => v.vote_type === "neutral").length);
        setDisappointVotes(votes.filter((v: any) => v.vote_type === "disappoint").length);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: uv } = await supabase.from("game_votes").select("vote_type").eq("game_id", id).eq("user_id", user.id).single();
        setUserVote(uv?.vote_type || null);
        const { data: ur } = await supabase.from("game_reviews").select("*").eq("game_id", id).eq("user_id", user.id).single();
        setUserReview(ur);
      }

      setLoading(false);
    });
  }, [id]);

  // ── Handlers ──
  const handleVote = async (type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("请先登录");
    if (userVote) return;
    await supabase.from("game_votes").insert({ game_id: id, user_id: user.id, vote_type: type });
    setUserVote(type);
    if (type === "hype") setHypeVotes(c => c + 1);
    else if (type === "neutral") setMidVotes(c => c + 1);
    else setDisappointVotes(c => c + 1);
  };

  const handleComment = async (text: string, rating: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("请先登录"); return; }
    const { data } = await supabase.from("game_comments").insert({ game_id: id, user_id: user.id, content: text, rating }).select().single();
    if (data) setComments(prev => [data, ...prev]);
  };

  const handleReviewSuccess = (review: any) => {
    setReviews(prev => [review, ...prev]);
    setUserReview(review);
  };

  // ── Computed values ──
  const screenshots = game ? Array.from({ length: 4 }, (_, i) => ({
    src: `https://placehold.co/800x450/1E293B/06B6D4?text=${encodeURIComponent(game.title + ' 截图 ' + (i + 1))}`,
    alt: `${game.title} 截图 ${i + 1}`,
  })) : [];

  // ── Loading / Not Found ──
  if (loading) return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 animate-pulse">
        <div className="h-64 bg-[#1E293B]/30 rounded-2xl mb-6" />
        <div className="h-8 w-64 bg-[#1E293B]/30 rounded mb-4" />
        <div className="h-96 bg-[#1E293B]/20 rounded-xl" />
      </div>
    </div>
  );
  if (!game) return <div className="pt-20 pb-20 text-center text-[#64748B]">游戏未找到</div>;

  // ── Render ──
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <GameHeader game={game} />
        <GameProgressCard
          status={game.status}
          hypeVotes={hypeVotes} midVotes={midVotes} disappointVotes={disappointVotes}
          userVote={userVote} onVote={handleVote}
        />
        <GameTabs
          tab={tab} onTabChange={setTab}
          game={game} gameId={id!}
          leaks={leaks} comments={comments} reviews={reviews}
          userReview={userReview} requirements={requirements}
          preorders={preorders} prices={prices} dlc={dlc}
          wiki={wiki} videos={videos}
          screenshots={screenshots} onImageClick={setLightbox}
          onReviewSuccess={handleReviewSuccess} onComment={handleComment}
        />
        <RelatedGames games={related} />
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
