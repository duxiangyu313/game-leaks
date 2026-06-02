"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { TrendingUp, ThumbsDown, Minus, Clock, Calendar, Monitor, Smartphone, ExternalLink, Star, MessageSquare, Image, ChevronLeft, ChevronRight, Loader2, Send, Cpu, HardDrive, Bell, BellRing, Plus } from "lucide-react";

type Tab = "intro" | "requirements" | "leaks" | "gallery" | "comments";

function DetailContent() {
  const params = useSearchParams(); const id = params.get("id");
  const [game, setGame] = useState<any>(null);
  const [leaks, setLeaks] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("intro");
  const [hypeVotes, setHypeVotes] = useState(0);
  const [midVotes, setMidVotes] = useState(0);
  const [disappointVotes, setDisappointVotes] = useState(0);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("games").select("*").eq("id", id).single(),
      supabase.from("leaks").select("*").eq("game_name", null).eq("status", "published").order("published_at", { ascending: false }).limit(5),
      supabase.from("games").select("*").neq("id", id).order("hype_score", { ascending: false }).limit(4),
      supabase.from("game_comments").select("*").eq("game_id", id).order("created_at", { ascending: false }),
      supabase.from("game_requirements").select("*").eq("game_id", id).single(),
      supabase.from("game_votes").select("vote_type").eq("game_id", id),
    ]).then(async ([{ data: g }, { data: lks }, { data: rel }, { data: cmts }, { data: votes }]) => {
      setGame(g);
      setLeaks(lks || []);
      setRelated(rel || []);
      setComments(cmts || []);

      // Count votes
      if (votes) {
        setHypeVotes(votes.filter((v: any) => v.vote_type === "hype").length);
        setMidVotes(votes.filter((v: any) => v.vote_type === "neutral").length);
        setDisappointVotes(votes.filter((v: any) => v.vote_type === "disappoint").length);
      }

      // Check user vote
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: uv } = await supabase.from("game_votes").select("vote_type").eq("game_id", id).eq("user_id", user.id).single();
        setUserVote(uv?.vote_type || null);
      }

      setLoading(false);
    });
  }, [id]);

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

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("请先登录");
    setSubmittingComment(true);
    const { data } = await supabase.from("game_comments").insert({ game_id: id, user_id: user.id, content: commentText, rating: commentRating }).select().single();
    if (data) setComments(prev => [data, ...prev]);
    setCommentText(""); setSubmittingComment(false);
  };

  const statusLabel: Record<string, string> = { announced: "已公布", "in-dev": "开发中", beta: "测试中", released: "已发售", delayed: "延期" };
  const stagePercent: Record<string, number> = { announced: 25, "in-dev": 55, beta: 80, released: 100, delayed: 40 };

  // Mock screenshots
  const screenshots = game ? Array.from({ length: 4 }, (_, i) => ({
    src: `https://placehold.co/800x450/1E293B/06B6D4?text=${encodeURIComponent(game.title + ' 截图 ' + (i + 1))}`,
    alt: `${game.title} 截图 ${i + 1}`
  })) : [];

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

  const stage = stagePercent[game.status] || 30;
  const totalVotes = hypeVotes + midVotes + disappointVotes;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="glass-card p-6 md:p-10 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-6xl border border-[rgba(30,41,59,0.5)] shrink-0">{game.title?.charAt(0)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-[#F1F5F9]">{game.title}</h1>
                <span className={`px-3 py-1 text-xs rounded-full ${game.status === "released" ? "bg-[#10B981]/20 text-[#10B981]" : game.status === "announced" ? "bg-[#06B6D4]/20 text-[#06B6D4]" : "bg-[#F59E0B]/20 text-[#F59E0B]"}`}>{statusLabel[game.status] || game.status}</span>
              </div>
              {game.english_title && <p className="text-[#64748B] text-sm mb-3">{game.english_title}</p>}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#94A3B8] mb-3">
                <span>开发商: <strong className="text-[#F1F5F9]">{game.developer}</strong></span>
                <span>发行商: <strong className="text-[#F1F5F9]">{game.publisher}</strong></span>
                {game.release_date && <span>发售日: <strong className="text-[#F59E0B]">{game.release_date}</strong></span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {game.genre?.map((g: string) => <span key={g} className="px-3 py-1 text-xs rounded-full bg-[#1E293B] text-[#94A3B8]">{g}</span>)}
                {game.platforms?.map((p: string) => <span key={p} className="px-3 py-1 text-xs rounded-full bg-[#06B6D4]/10 text-[#06B6D4]">{p}</span>)}
              </div>
              {game.rating && (
                <div className="flex items-center gap-1 mt-3 text-[#F59E0B]"><Star className="w-4 h-4 fill-[#F59E0B]" /><span className="font-bold">{game.rating}</span><span className="text-xs text-[#64748B] ml-1">/ 10</span></div>
              )}
            </div>
          </div>
        </div>

        {/* Progress + Vote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Progress */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#06B6D4]" /> 开发进度</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-4 bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] rounded-full transition-all" style={{ width: `${stage}%` }} />
              </div>
              <span className="text-2xl font-black text-[#F1F5F9]">{stage}%</span>
            </div>
            <div className="flex justify-between text-xs text-[#64748B]">
              <span className={stage >= 25 ? "text-[#06B6D4]" : ""}>概念</span>
              <span className={stage >= 40 ? "text-[#06B6D4]" : ""}>原型</span>
              <span className={stage >= 55 ? "text-[#06B6D4]" : ""}>Alpha</span>
              <span className={stage >= 80 ? "text-[#06B6D4]" : ""}>Beta</span>
              <span className={stage >= 100 ? "text-[#10B981]" : ""}>发售</span>
            </div>
          </div>

          {/* Voting */}
          <div className="glass-card p-6 text-center">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">你的态度</h3>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => handleVote("hype")} disabled={!!userVote}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${userVote === "hype" ? "bg-[#10B981]/20 border-2 border-[#10B981]" : userVote ? "opacity-40 bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#10B981]/10 border-2 border-transparent hover:border-[#10B981]/30"}`}>
                <TrendingUp className={`w-6 h-6 ${userVote === "hype" ? "text-[#10B981]" : "text-[#64748B]"}`} />
                <span className="text-xl font-black text-[#F1F5F9]">{hypeVotes}</span>
                <span className="text-[10px] text-[#64748B]">期待</span>
              </button>
              <button onClick={() => handleVote("neutral")} disabled={!!userVote}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${userVote === "neutral" ? "bg-[#F59E0B]/20 border-2 border-[#F59E0B]" : userVote ? "opacity-40 bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#F59E0B]/10 border-2 border-transparent hover:border-[#F59E0B]/30"}`}>
                <Minus className={`w-6 h-6 ${userVote === "neutral" ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
                <span className="text-xl font-black text-[#F1F5F9]">{midVotes}</span>
                <span className="text-[10px] text-[#64748B]">一般</span>
              </button>
              <button onClick={() => handleVote("disappoint")} disabled={!!userVote}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${userVote === "disappoint" ? "bg-[#EF4444]/20 border-2 border-[#EF4444]" : userVote ? "opacity-40 bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#EF4444]/10 border-2 border-transparent hover:border-[#EF4444]/30"}`}>
                <ThumbsDown className={`w-6 h-6 ${userVote === "disappoint" ? "text-[#EF4444]" : "text-[#64748B]"}`} />
                <span className="text-xl font-black text-[#F1F5F9]">{disappointVotes}</span>
                <span className="text-[10px] text-[#64748B]">不期待</span>
              </button>
            </div>
            {totalVotes > 0 && (
              <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#10B981]" /><span className="text-[#64748B]">{Math.round(hypeVotes / totalVotes * 100)}%</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#F59E0B]" /><span className="text-[#64748B]">{Math.round(midVotes / totalVotes * 100)}%</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#EF4444]" /><span className="text-[#64748B]">{Math.round(disappointVotes / totalVotes * 100)}%</span></div>
                <span className="text-[#64748B] ml-2">共 {totalVotes} 票</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex border-b border-[rgba(30,41,59,0.4)]">
            {[
              { key: "intro" as Tab, icon: Star, label: "游戏介绍" },
              { key: "leaks" as Tab, icon: TrendingUp, label: `爆料历史 (${leaks.length})` },
              { key: "gallery" as Tab, icon: Image, label: "截图" },
              { key: "comments" as Tab, icon: MessageSquare, label: `评论 (${comments.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${tab === t.key ? "border-[#06B6D4] text-[#06B6D4]" : "border-transparent text-[#64748B] hover:text-[#F1F5F9]"}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Intro Tab */}
            {tab === "intro" && (
              <div className="text-[#c4bfb6] leading-relaxed text-[17px] space-y-4 max-w-none">
                {game.description?.split("\n").map((line: string, i: number) => {
                  if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-[#F1F5F9] mt-10 mb-4 pl-3 border-l-3 border-[#06B6D4]">{line.slice(3)}</h2>;
                  if (line.startsWith("### ")) return <h3 key={i} className="text-xl font-semibold text-[#F1F5F9] mt-8 mb-3">{line.slice(4)}</h3>;
                  if (line.startsWith("- **")) {
                    const [label, ...rest] = line.slice(2).split("：");
                    return <div key={i} className="flex gap-2"><span className="text-[#F1F5F9] font-semibold shrink-0">{label.replace(/\*\*/g, "")}：</span><span className="text-[#94A3B8]">{rest.join("：")}</span></div>;
                  }
                  if (line.startsWith("- ")) return <li key={i} className="ml-4 text-[#94A3B8]">{line.slice(2)}</li>;
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            )}

            {/* Leaks Tab */}
            {tab === "leaks" && (
              <div className="space-y-4">
                {leaks.length === 0 ? <p className="text-[#64748B] text-center py-8">暂无相关爆料</p> :
                  leaks.map(l => (
                    <div key={l.id} className="glass-card p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${l.credibility === "confirmed" ? "bg-[#10B981]/10 text-[#10B981]" : l.credibility === "likely" ? "bg-[#06B6D4]/10 text-[#06B6D4]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                          {l.credibility === "confirmed" ? "已确认" : l.credibility === "likely" ? "高可信" : "传闻"}
                        </span>
                        <span className="text-xs text-[#64748B]">{l.published_at}</span>
                      </div>
                      <h4 className="font-bold text-[#F1F5F9] mb-1">{l.title}</h4>
                      <p className="text-sm text-[#94A3B8]">{l.summary}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Gallery Tab */}
            {tab === "gallery" && (
              <div className="grid grid-cols-2 gap-4">
                {screenshots.map((img, i) => (
                  <div key={i} className="glass-card overflow-hidden cursor-pointer hover:border-[#06B6D4]/30 transition-all" onClick={() => setLightbox(img.src)}>
                    <div className="aspect-video bg-[#1E293B] flex items-center justify-center text-[#64748B] text-sm">{img.alt}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Comments Tab */}
            {tab === "comments" && (
              <div>
                {/* Comment form */}
                <div className="glass-card p-4 mb-6">
                  <textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写下你的评论..." rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] text-sm outline-none resize-y mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setCommentRating(s)}>
                          <Star className={`w-4 h-4 ${s <= commentRating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#64748B]"}`} />
                        </button>
                      ))}
                    </div>
                    <button onClick={handleComment} disabled={submittingComment || !commentText.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50 transition-all">
                      {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 发布
                    </button>
                  </div>
                </div>

                {/* Comments list */}
                {comments.length === 0 && <p className="text-[#64748B] text-center py-8">暂无评论，来写第一条</p>}
                {comments.length > 0 && (
                  <div className="space-y-4">
                    {comments.map(c => (
                      <div key={c.id} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#F1F5F9]">{c.user_id?.slice(0, 8)}</span>
                          <span className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= (c.rating || 5) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#64748B]"}`} />)}</span>
                        </div>
                        <p className="text-sm text-[#94A3B8]">{c.content}</p>
                        <p className="text-xs text-[#64748B] mt-2">{new Date(c.created_at).toLocaleDateString("zh-CN")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Games */}
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2"><ExternalLink className="w-5 h-5 text-[#06B6D4]" />相关游戏推荐</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/games/detail?id=${r.id}`} className="glass-card block p-4 group hover:border-[#06B6D4]/20 transition-all">
                  <div className="w-full h-24 rounded-lg bg-gradient-to-br from-[#1E293B] to-[#0F172A] mb-2 flex items-center justify-center text-3xl">{r.title?.charAt(0)}</div>
                  <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] truncate">{r.title}</h4>
                  <p className="text-xs text-[#64748B]">{r.developer}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white text-2xl">&times;</button>
          <img src={lightbox} alt="截图" className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default function GameDetailPage() {
  return <Suspense fallback={<div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>}><DetailContent /></Suspense>;
}
