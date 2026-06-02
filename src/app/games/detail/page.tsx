"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  TrendingUp, ThumbsDown, Minus, Clock, Calendar, Monitor, Smartphone,
  ExternalLink, Star, MessageSquare, Image, ChevronLeft, ChevronRight,
  Loader2, Send, Cpu, HardDrive, Bell, BellRing, Plus, ShoppingCart,
  Award, DollarSign, Download, Play, FileText, BookOpen, Edit3,
  Check, X, Zap, Sparkles, User
} from "lucide-react";

type Tab = "intro" | "requirements" | "reviews" | "preorders" | "scores" | "prices" | "dlc" | "videos" | "wiki" | "leaks" | "gallery" | "comments";

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

  // New data states
  const [requirements, setRequirements] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [preorders, setPreorders] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [dlc, setDlc] = useState<any[]>([]);
  const [wiki, setWiki] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);

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
      { data: dls }, { data: wk }, { data: vds }, { data: votes }
    ]) => {
      setGame(g); setLeaks(lks || []); setRelated(rel || []); setComments(cmts || []);
      setRequirements(reqs); setReviews(rvs || []); setPreorders(pos || []);
      setPrices(prs || []); setDlc(dls || []); setWiki(wk); setVideos(vds || []);

      if (votes) {
        setHypeVotes(votes.filter((v: any) => v.vote_type === "hype").length);
        setMidVotes(votes.filter((v: any) => v.vote_type === "neutral").length);
        setDisappointVotes(votes.filter((v: any) => v.vote_type === "disappoint").length);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: uv } = await supabase.from("game_votes").select("vote_type").eq("game_id", id).eq("user_id", user.id).single();
        setUserVote(uv?.vote_type || null);
        // Check if user wrote a review
        const { data: ur } = await supabase.from("game_reviews").select("*").eq("game_id", id).eq("user_id", user.id).single();
        setUserReview(ur);
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

  // Price chart bar width
  const maxPrice = prices.length > 0 ? Math.max(...prices.map((p: any) => p.original_price || p.current_price || 0)) : 1;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* ── Header ── */}
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

        {/* ── Progress + Vote Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          <div className="glass-card p-6 text-center">
            <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">你的态度</h3>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => handleVote("hype")} disabled={!!userVote} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${userVote === "hype" ? "bg-[#10B981]/20 border-2 border-[#10B981]" : userVote ? "opacity-40 bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#10B981]/10 border-2 border-transparent hover:border-[#10B981]/30"}`}>
                <TrendingUp className={`w-6 h-6 ${userVote === "hype" ? "text-[#10B981]" : "text-[#64748B]"}`} />
                <span className="text-xl font-black text-[#F1F5F9]">{hypeVotes}</span><span className="text-[10px] text-[#64748B]">期待</span>
              </button>
              <button onClick={() => handleVote("neutral")} disabled={!!userVote} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${userVote === "neutral" ? "bg-[#F59E0B]/20 border-2 border-[#F59E0B]" : userVote ? "opacity-40 bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#F59E0B]/10 border-2 border-transparent hover:border-[#F59E0B]/30"}`}>
                <Minus className={`w-6 h-6 ${userVote === "neutral" ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
                <span className="text-xl font-black text-[#F1F5F9]">{midVotes}</span><span className="text-[10px] text-[#64748B]">一般</span>
              </button>
              <button onClick={() => handleVote("disappoint")} disabled={!!userVote} className={`flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all ${userVote === "disappoint" ? "bg-[#EF4444]/20 border-2 border-[#EF4444]" : userVote ? "opacity-40 bg-[#1E293B]/40" : "bg-[#1E293B]/40 hover:bg-[#EF4444]/10 border-2 border-transparent hover:border-[#EF4444]/30"}`}>
                <ThumbsDown className={`w-6 h-6 ${userVote === "disappoint" ? "text-[#EF4444]" : "text-[#64748B]"}`} />
                <span className="text-xl font-black text-[#F1F5F9]">{disappointVotes}</span><span className="text-[10px] text-[#64748B]">不期待</span>
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

        {/* ── Tabs ── */}
        <div className="glass-card mb-6 overflow-x-auto">
          <div className="flex border-b border-[rgba(30,41,59,0.4)] min-w-max">
            {[
              { key: "intro" as Tab, icon: BookOpen, label: "游戏介绍" },
              { key: "reviews" as Tab, icon: Award, label: `玩家评测 (${reviews.length})` },
              { key: "wiki" as Tab, icon: FileText, label: "游戏百科" },
              { key: "requirements" as Tab, icon: Cpu, label: "配置要求" },
              { key: "preorders" as Tab, icon: ShoppingCart, label: "预购信息" },
              { key: "scores" as Tab, icon: Star, label: "评分专区" },
              { key: "prices" as Tab, icon: DollarSign, label: "价格走势" },
              { key: "dlc" as Tab, icon: Download, label: "DLC/更新" },
              { key: "videos" as Tab, icon: Play, label: "相关视频" },
              { key: "leaks" as Tab, icon: Zap, label: `爆料 (${leaks.length})` },
              { key: "gallery" as Tab, icon: Image, label: "截图" },
              { key: "comments" as Tab, icon: MessageSquare, label: `评论 (${comments.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${tab === t.key ? "border-[#06B6D4] text-[#06B6D4]" : "border-transparent text-[#64748B] hover:text-[#F1F5F9]"}`}>
                <t.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {/* === INTRO TAB === */}
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

            {/* === REVIEWS TAB === */}
            {tab === "reviews" && (
              <div>
                {!userReview && game.status === "released" && (
                  <div className="glass-card p-5 mb-6">
                    <h4 className="text-sm font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4 text-[#06B6D4]" />撰写评测</h4>
                    <ReviewForm gameId={id!} onSuccess={(r: any) => { setReviews(prev => [r, ...prev]); setUserReview(r); }} />
                  </div>
                )}
                {reviews.length === 0 ? <p className="text-[#64748B] text-center py-12">暂无玩家评测</p> : (
                  <div className="space-y-4">
                    {reviews.map((r: any) => (
                      <div key={r.id} className={`glass-card p-5 ${r.is_featured ? "border-l-2 border-l-[#F5A623]" : ""}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#F1F5F9]">{r.user_id?.slice(0, 8)}</span>
                            {r.is_featured && <span className="text-[10px] bg-[#F5A623]/15 text-[#F5A623] px-2 py-0.5 rounded-full flex items-center gap-1"><Award className="w-3 h-3" />编辑推荐</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-black text-[#F5A623]">{r.rating}</span>
                            <span className="text-xs text-[#64748B]">/10</span>
                          </div>
                        </div>
                        {r.title && <h5 className="font-semibold text-[#F1F5F9] mb-2">{r.title}</h5>}
                        <p className="text-sm text-[#94A3B8] whitespace-pre-line">{r.content}</p>
                        {r.pros && (
                          <div className="mt-3 flex gap-3 text-xs">
                            <span className="text-[#10B981]">👍 {(r.pros || "").split(",").slice(0, 3).join(" · ")}</span>
                            {r.cons && <span className="text-[#EF4444]">👎 {(r.cons || "").split(",").slice(0, 3).join(" · ")}</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-[#64748B]">
                          {r.playtime_hours && <span>🕐 {r.playtime_hours}h</span>}
                          <span>{new Date(r.created_at).toLocaleDateString("zh-CN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === WIKI TAB === */}
            {tab === "wiki" && (
              <div>
                {wiki ? (
                  <div className="space-y-8">
                    {/* Background */}
                    {wiki.background && (
                      <div>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#06B6D4]" />游戏背景</h3>
                        <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{wiki.background}</p>
                      </div>
                    )}
                    {/* Worldview */}
                    {wiki.worldview && (
                      <div>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#F5A623]" />世界观</h3>
                        <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{wiki.worldview}</p>
                      </div>
                    )}
                    {/* Characters */}
                    {wiki.characters && (() => { try { const chars = typeof wiki.characters === 'string' ? JSON.parse(wiki.characters) : wiki.characters; if (chars.length === 0) return null; return (
                      <div>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#10B981]" />角色介绍</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {chars.map((c: any, i: number) => (
                            <div key={i} className="glass-card p-4">
                              <h4 className="font-semibold text-[#F1F5F9] mb-1">{c.name}</h4>
                              <p className="text-sm text-[#94A3B8]">{c.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ); } catch { return null; } })()}
                    {/* Weapons */}
                    {wiki.weapons && (() => { try { const weps = typeof wiki.weapons === 'string' ? JSON.parse(wiki.weapons) : wiki.weapons; if (weps.length === 0) return null; return (
                      <div>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2"><CrosshairIcon className="w-5 h-5 text-[#E94560]" />武器装备</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {weps.map((w: any, i: number) => (
                            <div key={i} className="glass-card p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-[#F1F5F9]">{w.name}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] text-[#64748B]">{w.type}</span>
                              </div>
                              <p className="text-sm text-[#94A3B8]">{w.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ); } catch { return null; } })()}
                    {/* Maps */}
                    {wiki.maps && (() => { try { const mps = typeof wiki.maps === 'string' ? JSON.parse(wiki.maps) : wiki.maps; if (mps.length === 0) return null; return (
                      <div>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2"><Image className="w-5 h-5 text-[#8B5CF6]" />地图区域</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {mps.map((m: any, i: number) => (
                            <div key={i} className="glass-card p-4">
                              <h4 className="font-semibold text-[#F1F5F9] mb-1">{m.name}</h4>
                              <p className="text-sm text-[#94A3B8]">{m.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ); } catch { return null; } })()}
                    {/* Developer Notes */}
                    {wiki.developer_notes && (
                      <div>
                        <h3 className="text-lg font-bold text-[#F1F5F9] mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-[#F59E0B]" />开发秘闻</h3>
                        <p className="text-[#94A3B8] leading-relaxed whitespace-pre-line">{wiki.developer_notes}</p>
                      </div>
                    )}
                    {/* Edit link */}
                    <div className="text-center pt-4 border-t border-[rgba(30,41,59,0.3)]">
                      <Link href={`/games/wiki/edit?id=${id}`} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-[#06B6D4]/10 text-[#06B6D4] rounded-xl hover:bg-[#06B6D4]/20 transition-all">
                        <Edit3 className="w-4 h-4" />编辑百科（管理员审核后发布）
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                    <p className="text-[#64748B] mb-4">暂无百科信息</p>
                    <Link href={`/games/wiki/edit?id=${id}`} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-[#06B6D4] text-white rounded-xl hover:bg-[#0891B2] transition-all">
                      <Plus className="w-4 h-4" />创建百科
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* === REQUIREMENTS TAB === */}
            {tab === "requirements" && (
              <div>
                {requirements ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-5">
                      <h4 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-[#F59E0B]" />最低配置</h4>
                      <div className="space-y-2 text-sm">{([
                        ["OS", requirements.os_min], ["CPU", requirements.cpu_min], ["GPU", requirements.gpu_min],
                        ["内存", requirements.ram_min], ["存储", requirements.storage_min],
                        requirements.directx ? ["DirectX", requirements.directx] : null
                      ] as ([string, string] | null)[]).filter((x): x is [string, string] => x !== null).map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-[#64748B]">{k}</span><span className="text-[#F1F5F9]">{v}</span></div>)}</div>
                    </div>
                    <div className="glass-card p-5">
                      <h4 className="font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#06B6D4]" />推荐配置</h4>
                      <div className="space-y-2 text-sm">{[
                        ["OS", requirements.os_rec], ["CPU", requirements.cpu_rec], ["GPU", requirements.gpu_rec],
                        ["内存", requirements.ram_rec], ["存储", requirements.storage_rec],
                      ].filter(Boolean).map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-[#64748B]">{k}</span><span className="text-[#F1F5F9]">{v}</span></div>)}</div>
                    </div>
                  </div>
                ) : <p className="text-[#64748B] text-center py-12">暂未公布配置要求</p>}
              </div>
            )}

            {/* === PREORDERS TAB === */}
            {tab === "preorders" && (
              <div>
                {preorders.length === 0 ? <p className="text-[#64748B] text-center py-12">暂无预购信息</p> : (
                  <div className="space-y-3">
                    {preorders.map((po: any) => (
                      <div key={po.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 rounded bg-[#1E293B] text-[#64748B]">{po.platform}</span>
                          <div>
                            <h4 className="font-semibold text-[#F1F5F9] text-sm">{po.edition === "standard" ? "标准版" : po.edition === "deluxe" ? "豪华版" : po.edition === "collectors" ? "收藏版" : po.edition}</h4>
                            <p className="text-xs text-[#94A3B8]">{po.bonus}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-[#F5A623]">¥{po.price}</span>
                          {po.purchase_link && <a href={po.purchase_link} target="_blank" rel="noopener" className="px-3 py-1.5 text-xs bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891B2]">购买</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === SCORES TAB === */}
            {tab === "scores" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="glass-card p-6 text-center">
                    <h4 className="text-xs text-[#64748B] mb-3">🎮 媒体评分</h4>
                    <div className="text-4xl font-black text-[#F1F5F9]">{game.rating || "-"}</div>
                    <div className="text-xs text-[#64748B] mt-1">/ 10</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <h4 className="text-xs text-[#64748B] mb-3">👥 玩家评分</h4>
                    <div className="text-4xl font-black text-[#F5A623]">
                      {reviews.length > 0 ? (reviews.reduce((a: number, b: any) => a + (b.rating || 0), 0) / reviews.length).toFixed(1) : "-"}
                    </div>
                    <div className="text-xs text-[#64748B] mt-1">{reviews.length} 条评测</div>
                  </div>
                  <div className="glass-card p-6 text-center">
                    <h4 className="text-xs text-[#64748B] mb-3">✍️ 编辑评分</h4>
                    <div className="text-4xl font-black text-[#06B6D4]">{game.rating || "-"}</div>
                    <div className="text-xs text-[#64748B] mt-1">国游爆料编辑部</div>
                  </div>
                </div>
                {/* Distribution */}
                {reviews.length > 0 && (
                  <div className="glass-card p-5">
                    <h4 className="text-sm font-semibold text-[#F1F5F9] mb-4">评分分布</h4>
                    <div className="space-y-2">
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(score => {
                        const count = reviews.filter((r: any) => r.rating === score).length;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={score} className="flex items-center gap-3 text-xs">
                            <span className="w-8 text-right text-[#64748B]">{score}分</span>
                            <div className="flex-1 h-3 bg-[#1E293B] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${score >= 8 ? "bg-[#10B981]" : score >= 5 ? "bg-[#F59E0B]" : "bg-[#EF4444]"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-[#64748B]">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === PRICES TAB === */}
            {tab === "prices" && (
              <div>
                {prices.length === 0 ? <p className="text-[#64748B] text-center py-12">暂无价格数据</p> : (
                  <div>
                    {/* Price chart */}
                    <div className="glass-card p-5 mb-6">
                      <h4 className="text-sm font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#10B981]" />历史价格趋势</h4>
                      <div className="space-y-3">
                        {(() => {
                          // Group by platform+store
                          const groups: Record<string, any[]> = {};
                          prices.forEach((p: any) => {
                            const key = `${p.platform} ${p.store}`;
                            if (!groups[key]) groups[key] = [];
                            groups[key].push(p);
                          });
                          return Object.entries(groups).map(([key, items]: [string, any[]]) => {
                            const latest = items[0];
                            const lowest = items.reduce((min, p) => (p.current_price < min.current_price ? p : min), items[0]);
                            return (
                              <div key={key} className="glass-card p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-[#F1F5F9]">{key}</span>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-[#64748B]">当前 <strong className="text-[#F1F5F9] text-lg">¥{latest.current_price}</strong></span>
                                    {latest.discount_percent > 0 && <span className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">-{latest.discount_percent}%</span>}
                                  </div>
                                </div>
                                <div className="flex items-end gap-1 h-16">
                                  {items.reverse().map((p: any, i: number) => {
                                    const barH = maxPrice > 0 ? ((p.current_price || p.original_price) / maxPrice * 100) : 0;
                                    return (
                                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div className="w-full bg-[#06B6D4]/40 hover:bg-[#06B6D4]/70 rounded-t transition-all" style={{ height: `${Math.max(barH, 5)}%` }} />
                                        <span className="text-[9px] text-[#64748B]">{p.recorded_at?.slice(5)}</span>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1E293B] text-[#F1F5F9] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">¥{p.current_price || p.original_price}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] text-[#64748B]">
                                  <span>最低 ¥{lowest.current_price || lowest.original_price}</span>
                                  <span>原价 ¥{items[items.length - 1]?.original_price || items[items.length - 1]?.current_price}</span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    {/* Price table */}
                    <div className="glass-card overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-[rgba(30,41,59,0.4)] text-[#64748B] text-xs">
                          <th className="text-left p-3">平台</th><th className="text-left p-3">商店</th><th className="text-right p-3">原价</th><th className="text-right p-3">现价</th><th className="text-right p-3">折扣</th><th className="text-right p-3">日期</th>
                        </tr></thead>
                        <tbody>
                          {prices.slice(0, 20).map((p: any) => (
                            <tr key={p.id} className="border-b border-[rgba(30,41,59,0.15)]">
                              <td className="p-3 text-[#F1F5F9]">{p.platform}</td>
                              <td className="p-3 text-[#94A3B8]">{p.store}</td>
                              <td className="p-3 text-right text-[#64748B]">¥{p.original_price}</td>
                              <td className="p-3 text-right text-[#F1F5F9] font-semibold">¥{p.current_price}</td>
                              <td className="p-3 text-right">{p.discount_percent > 0 ? <span className="text-[#10B981]">-{p.discount_percent}%</span> : <span className="text-[#64748B]">-</span>}</td>
                              <td className="p-3 text-right text-[#64748B]">{p.recorded_at}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === DLC TAB === */}
            {tab === "dlc" && (
              <div>
                {dlc.length === 0 ? <p className="text-[#64748B] text-center py-12">暂无DLC或更新内容</p> : (
                  <div className="space-y-3">
                    {dlc.map((d: any) => (
                      <div key={d.id} className="glass-card p-4 flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          d.status === "released" ? "bg-[#10B981]/10" : d.status === "upcoming" ? "bg-[#06B6D4]/10" : "bg-[#1E293B]"
                        }`}>
                          {d.dlc_type === "dlc" ? <Download className="w-5 h-5 text-[#06B6D4]" /> :
                           d.dlc_type === "expansion" ? <Plus className="w-5 h-5 text-[#F5A623]" /> :
                           d.dlc_type === "season_pass" ? <Star className="w-5 h-5 text-[#F59E0B]" /> :
                           <Zap className="w-5 h-5 text-[#10B981]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[#F1F5F9]">{d.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              d.status === "released" ? "bg-[#10B981]/10 text-[#10B981]" :
                              d.status === "upcoming" ? "bg-[#06B6D4]/10 text-[#06B6D4]" :
                              d.status === "in-dev" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                              "bg-[#1E293B] text-[#64748B]"
                            }`}>{d.status === "released" ? "已发布" : d.status === "upcoming" ? "即将发布" : d.status === "in-dev" ? "开发中" : "传闻"}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] text-[#64748B]">{
                              d.dlc_type === "dlc" ? "DLC" : d.dlc_type === "expansion" ? "资料片" : d.dlc_type === "season_pass" ? "季票" : "更新"
                            }</span>
                          </div>
                          <p className="text-sm text-[#94A3B8]">{d.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                            {d.release_date && <span>📅 {d.release_date}</span>}
                            {d.price && <span>💰 {d.price}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === VIDEOS TAB === */}
            {tab === "videos" && (
              <div>
                {videos.length === 0 ? <p className="text-[#64748B] text-center py-12">暂无相关视频</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((v: any) => {
                      const bvMatch = v.content?.match(/bvid=(BV[a-zA-Z0-9]+)/);
                      const bvid = bvMatch ? bvMatch[1] : null;
                      return (
                        <Link key={v.id} href={`/articles/detail?id=${v.id}`} className="glass-card block p-4 group hover:border-[#E94560]/20 transition-all">
                          <div className="w-full aspect-video rounded-lg bg-[#1E293B] mb-3 flex items-center justify-center border border-[rgba(30,41,59,0.4)] group-hover:border-[#E94560]/20">
                            <Play className="w-8 h-8 text-[#E94560] group-hover:scale-110 transition-transform" />
                          </div>
                          <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#E94560] transition-colors line-clamp-2">{v.title}</h4>
                          <p className="text-xs text-[#64748B] mt-2">{new Date(v.created_at).toLocaleDateString("zh-CN")}</p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* === LEAKS TAB === */}
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

            {/* === GALLERY TAB === */}
            {tab === "gallery" && (
              <div className="grid grid-cols-2 gap-4">
                {screenshots.map((img, i) => (
                  <div key={i} className="glass-card overflow-hidden cursor-pointer hover:border-[#06B6D4]/30 transition-all" onClick={() => setLightbox(img.src)}>
                    <div className="aspect-video bg-[#1E293B] flex items-center justify-center text-[#64748B] text-sm">{img.alt}</div>
                  </div>
                ))}
              </div>
            )}

            {/* === COMMENTS TAB === */}
            {tab === "comments" && (
              <div>
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

        {/* ── Related Games ── */}
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

// ── Review Form Component ──
function ReviewForm({ gameId, onSuccess }: { gameId: string; onSuccess: (review: any) => void }) {
  const [rating, setRating] = useState(8);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [playtime, setPlaytime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) { setError("请输入评测内容"); return; }
    setSubmitting(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("请先登录"); setSubmitting(false); return; }
    const { data, error: insertError } = await supabase.from("game_reviews").insert({
      game_id: gameId, user_id: user.id, rating, title, content, pros, cons,
      playtime_hours: playtime ? parseInt(playtime) : null,
    }).select().single();
    if (insertError) {
      if (insertError.message.includes("duplicate")) setError("你已经为这款游戏写过评测了");
      else setError("发布失败: " + insertError.message);
    } else if (data) {
      onSuccess(data);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#64748B]">评分:</span>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map(s => (
            <button key={s} onClick={() => setRating(s)}>
              <Star className={`w-5 h-5 ${s <= rating ? "fill-[#F5A623] text-[#F5A623]" : "text-[#64748B]"}`} />
            </button>
          ))}
        </div>
        <span className="text-lg font-black text-[#F5A623]">{rating}/10</span>
      </div>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="评测标题（可选）" className="w-full px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="详细评测内容..." className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none resize-y" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input type="text" value={pros} onChange={e => setPros(e.target.value)} placeholder="优点（逗号分隔）" className="px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
        <input type="text" value={cons} onChange={e => setCons(e.target.value)} placeholder="缺点（逗号分隔）" className="px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
        <input type="number" value={playtime} onChange={e => setPlaytime(e.target.value)} placeholder="游戏时长（小时）" className="px-4 py-2 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] text-sm outline-none" />
      </div>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50">
        {submitting ? "发布中..." : "发布评测"}
      </button>
    </div>
  );
}

// Missing icon component
function CrosshairIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

export default function GameDetailPage() {
  return <Suspense fallback={<div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>}><DetailContent /></Suspense>;
}
