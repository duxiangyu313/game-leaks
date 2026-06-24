"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { ArrowLeft, Clock, Eye, MessageSquare, User, ThumbsUp, Share2, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function PostContent() {
  const params = useSearchParams();
  const id = params.get("id");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("forum_posts").select("*").eq("id", id).single(),
      supabase.from("forum_replies").select("*").eq("post_id", id).order("created_at", { ascending: true }),
    ]).then(([{ data: p }, { data: r }]) => {
      setPost(p); setReplies(r || []); setLikes(Math.floor(20 + Math.random() * 80));
      // 增加浏览量
      if (p) supabase.from("forum_posts").update({ view_count: (p.view_count || 0) + 1 }).eq("id", id).then();
      setLoading(false);
    });
  }, [id]);

  const handleLike = () => { if (!liked) { setLiked(true); setLikes(l => l + 1); } };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href).then(() => alert("链接已复制")).catch(() => {}); };
  const handleReply = async () => {
    if (!replyText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    setReplying(true);
    const { data } = await supabase.from("forum_replies").insert({
      post_id: id!, user_id: user?.id || null,
      author_name: user?.email?.split("@")[0] || "匿名用户", content: replyText,
    }).select().single();
    if (data) { setReplies(prev => [...prev, data]); setReplyText(""); }
    // 更新回复计数
    supabase.from("forum_posts").update({ reply_count: (replies.length + 1) as number }).eq("id", id!).then(() => {});
    setReplying(false);
  };

  if (loading) return <div className="pt-20 pb-20 flex justify-center"><Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" /></div>;
  if (!post) return <div className="pt-20 pb-20 text-center text-[#64748B]">帖子未找到</div>;

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <LinkNoPrefetch href="/forum" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] mb-6"><ArrowLeft className="w-4 h-4" />返回论坛</LinkNoPrefetch>
        <div className="flex items-center gap-2 mb-4 text-xs text-[#64748B]">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author_name}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.created_at).toLocaleString("zh-CN")}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.view_count}</span>
        </div>
        <h1 className="text-2xl font-black text-[#F1F5F9] mb-8">{post.title}</h1>
        <div className="glass-card p-6 mb-4">
          <div className="text-[#c4bfb6] leading-relaxed whitespace-pre-line">{post.content}</div>
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[rgba(30,41,59,0.3)]">
            <button onClick={handleLike} className={"flex items-center gap-1.5 text-sm transition-colors " + (liked ? "text-[#10B981]" : "text-[#64748B] hover:text-[#10B981]")}>
              <ThumbsUp className={"w-4 h-4 " + (liked ? "fill-[#10B981]" : "")} /> {likes}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#06B6D4]"><Share2 className="w-4 h-4" />分享</button>
          </div>
        </div>
        <div className="glass-card p-4 mb-6">
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="写下你的回复..." rows={3} className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] text-sm outline-none resize-y mb-3" />
          <button onClick={handleReply} disabled={replying || !replyText.trim()} className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2] disabled:opacity-50">
            {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}回复
          </button>
        </div>
        <h3 className="text-lg font-bold text-[#F1F5F9] mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#06B6D4]" />回复 ({replies.length})</h3>
        <div className="space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-[#F1F5F9]">{r.author_name}</span><span className="text-xs text-[#64748B]">{new Date(r.created_at).toLocaleString("zh-CN")}</span></div>
              <p className="text-sm text-[#94A3B8]">{r.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PostPage() { return <Suspense><PostContent /></Suspense>; }
