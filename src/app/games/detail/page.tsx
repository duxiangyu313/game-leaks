"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { TrendingUp, ThumbsDown, Clock, Calendar, Monitor, Smartphone, Percent } from "lucide-react";

interface GameDetail {
  id: string; title: string; english_title?: string; cover?: string;
  developer: string; publisher: string; genre: string[]; platforms: string[];
  release_date?: string; status: string; description: string; hype_score: number;
}

function GameDetailContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hypeVotes, setHypeVotes] = useState(0);
  const [disappointVotes, setDisappointVotes] = useState(0);
  const [userVote, setUserVote] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("games").select("*").eq("id", id).single(),
      supabase.from("game_votes").select("vote_type", { count: "exact" }).eq("game_id", id).eq("vote_type", "hype"),
      supabase.from("game_votes").select("vote_type", { count: "exact" }).eq("game_id", id).eq("vote_type", "disappoint"),
    ]).then(async ([{ data: g }, { count: hc }, { count: dc }]) => {
      setGame(g); setHypeVotes(hc || 0); setDisappointVotes(dc || 0); setLoading(false);
      // Check user vote
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: v } = await supabase.from("game_votes").select("vote_type").eq("game_id", id).eq("user_id", user.id).single();
        setUserVote(v?.vote_type || null);
      }
    });
  }, [id]);

  const handleVote = async (type: "hype" | "disappoint") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("请先登录");
    if (userVote) return alert("你已经投过票了");
    await supabase.from("game_votes").insert({ game_id: id, user_id: user.id, vote_type: type });
    setUserVote(type);
    if (type === "hype") setHypeVotes(c => c + 1);
    else setDisappointVotes(c => c + 1);
  };

  const getDaysLeft = (date?: string) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const statusLabel: Record<string, string> = {
    announced: "已公布", "in-dev": "开发中", beta: "测试中", released: "已发售", delayed: "延期",
  };

  if (loading) return <div className="pt-20 pb-20"><div className="max-w-4xl mx-auto px-4 animate-pulse"><div className="h-64 bg-[#1E293B]/30 rounded-2xl mb-6" /><div className="h-8 w-64 bg-[#1E293B]/30 rounded mb-4" /></div></div>;
  if (!game) return <div className="pt-20 pb-20 text-center text-[#64748B]">游戏未找到</div>;

  const daysLeft = getDaysLeft(game.release_date);
  const totalVotes = hypeVotes + disappointVotes;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="glass-card p-6 md:p-10 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-5xl border border-[rgba(30,41,59,0.5)] shrink-0">
              {game.title.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-[#F1F5F9] mb-1">{game.title}</h1>
              {game.english_title && <p className="text-[#64748B] text-sm mb-3">{game.english_title}</p>}
              <p className="text-[#94A3B8] mb-4">{game.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-xs rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">{statusLabel[game.status] || game.status}</span>
                {game.genre.map(g => <span key={g} className="px-3 py-1 text-xs rounded-full bg-[#1E293B] text-[#94A3B8]">{g}</span>)}
                {game.platforms.map(p => <span key={p} className="px-3 py-1 text-xs rounded-full bg-[#10B981]/10 text-[#10B981]">{p}</span>)}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[#64748B]">
                <span>开发商: <span className="text-[#F1F5F9]">{game.developer}</span></span>
                <span>发行商: <span className="text-[#F1F5F9]">{game.publisher}</span></span>
                {game.release_date && <span>发售日: <span className="text-[#F59E0B] font-semibold">{game.release_date}</span></span>}
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><Percent className="w-4 h-4 text-[#06B6D4]" /> 开发进度</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] rounded-full transition-all" style={{ width: `${game.hype_score}%` }} />
              </div>
              <span className="text-lg font-bold text-[#F1F5F9]">{game.hype_score}%</span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#F59E0B]" /> 发售倒计时</h3>
            {daysLeft !== null ? (
              <div className="text-3xl font-black text-[#F59E0B]">
                {daysLeft > 0 ? `${daysLeft} 天` : game.status === "released" ? "已发售 🎉" : "即将发售"}
              </div>
            ) : <span className="text-[#64748B]">待定</span>}
          </div>
        </div>

        {/* Voting */}
        <div className="glass-card p-6 mb-6 text-center">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">你的态度</h3>
          <div className="flex items-center justify-center gap-6 mt-4">
            <button onClick={() => handleVote("hype")} disabled={!!userVote}
              className={`flex flex-col items-center gap-2 px-8 py-4 rounded-2xl transition-all ${userVote === "hype" ? "bg-[#10B981]/20 border-2 border-[#10B981]" : userVote ? "opacity-50 cursor-not-allowed bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#10B981]/10 border-2 border-transparent hover:border-[#10B981]/30"}`}>
              <TrendingUp className={`w-8 h-8 ${userVote === "hype" ? "text-[#10B981]" : "text-[#64748B]"}`} />
              <span className="text-2xl font-black text-[#F1F5F9]">{hypeVotes}</span>
              <span className="text-xs text-[#64748B]">期待</span>
            </button>
            <button onClick={() => handleVote("disappoint")} disabled={!!userVote}
              className={`flex flex-col items-center gap-2 px-8 py-4 rounded-2xl transition-all ${userVote === "disappoint" ? "bg-[#EF4444]/20 border-2 border-[#EF4444]" : userVote ? "opacity-50 cursor-not-allowed bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#EF4444]/10 border-2 border-transparent hover:border-[#EF4444]/30"}`}>
              <ThumbsDown className={`w-8 h-8 ${userVote === "disappoint" ? "text-[#EF4444]" : "text-[#64748B]"}`} />
              <span className="text-2xl font-black text-[#F1F5F9]">{disappointVotes}</span>
              <span className="text-xs text-[#64748B]">失望</span>
            </button>
          </div>
          {totalVotes > 0 && (
            <p className="text-xs text-[#64748B] mt-3">共 {totalVotes} 人投票 · {Math.round(hypeVotes / Math.max(totalVotes, 1) * 100)}% 期待</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GameDetailPage() {
  return <Suspense fallback={<div className="pt-20 pb-20 text-center text-[#64748B]">加载中...</div>}><GameDetailContent /></Suspense>;
}
