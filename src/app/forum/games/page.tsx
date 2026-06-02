"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Clock, Eye, Plus, Gamepad2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ForumGamesPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("forum_posts").select("*").eq("category", "games").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).then(({ data }) => {
      setPosts(data || []); setLoading(false);
    });
  }, []);

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#F1F5F9] mb-6"><ArrowLeft className="w-4 h-4" />返回论坛</Link>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-[#1E293B]/60 flex items-center justify-center"><Gamepad2 className="w-7 h-7 text-[#06B6D4]" /></div><div><h1 className="text-2xl font-black text-[#F1F5F9]">游戏专区</h1><p className="text-sm text-[#94A3B8]">黑神话、影之刃零、归唐等国产3A游戏讨论</p></div></div>
          <Link href="/forum/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white text-sm font-medium rounded-xl hover:bg-[#0891B2]"><Plus className="w-4 h-4" />发帖</Link>
        </div>

        {loading ? <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div> : (
          <div className="glass-card overflow-hidden">
            {posts.map((post, i) => (
              <Link href={"/forum/post/?id=" + post.id} key={post.id} className={"p-4 flex items-center gap-4 border-b border-[rgba(30,41,59,0.3)] last:border-0 hover:bg-[#1E293B]/20 transition-colors cursor-pointer" + (post.is_pinned ? " bg-[#F59E0B]/3" : "")}>
                <span className="text-xs font-mono text-[#64748B] w-8 shrink-0">{post.is_pinned ? "📌" : "#" + (i + 1)}</span>
                <div className="flex-1 min-w-0"><h3 className="text-sm font-semibold text-[#F1F5F9] truncate">{post.title}</h3><div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]"><span>{post.author_name}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(post.created_at).toLocaleDateString("zh-CN")}</span></div></div>
                <div className="flex items-center gap-4 text-xs text-[#64748B] shrink-0"><span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{post.reply_count}</span><span className="flex items-center gap-1 hidden sm:flex"><Eye className="w-3.5 h-3.5" />{post.view_count}</span></div>
              </Link>
            ))}
            {posts.length === 0 && <div className="p-8 text-center text-[#64748B]">暂无帖子，来发第一个吧！</div>}
          </div>
        )}
      </div>
    </div>
  );
}
