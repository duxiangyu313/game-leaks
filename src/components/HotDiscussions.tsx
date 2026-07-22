"use client";

import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { MessageSquare, Flame, Clock } from "lucide-react";

export default function HotDiscussions() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: topics, loading } = useCachedQuery<any[]>(
    "hotDiscussions",
    () => supabase
      .from("forum_posts")
      .select("*")
      .order("reply_count", { ascending: false })
      .limit(5)
      .then(({ data }) => data || []),
    [
      { id: "h1", title: "2026年国产3A你最期待哪一款？", reply_count: 456, view_count: 15600, author_name: "管理员", created_at: "2026-06-15T12:00:00Z" },
      { id: "h2", title: "升级显卡备战国产3A", reply_count: 234, view_count: 8900, author_name: "硬件发烧友", created_at: "2026-06-15T12:00:00Z" },
      { id: "h3", title: "《归唐》SGF实机讨论集中帖", reply_count: 128, view_count: 3200, author_name: "游戏猎人", created_at: "2026-06-15T12:00:00Z" },
      { id: "h4", title: "蛇夫座第二项目曝光", reply_count: 134, view_count: 4500, author_name: "军事游戏迷", created_at: "2026-06-15T12:00:00Z" },
      { id: "h5", title: "晒一晒你的游戏设备和桌面", reply_count: 567, view_count: 18900, author_name: "桌面控", created_at: "2026-06-15T12:00:00Z" },
    ],
    "hotDiscussions"
  );

  if (loading || topics.length === 0) return null;

  return (
    <section className="py-16 bg-[#0B1120]/50 border-t border-b border-[rgba(30,41,59,0.3)]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-[#E94560]" />
            <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">玩家热议</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-[#E94560]/15 text-[#E94560] rounded-full animate-pulse">HOT</span>
          </div>
          <LinkNoPrefetch href="/forum" className="text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors">进入论坛 →</LinkNoPrefetch>
        </div>

        <div className="space-y-2">
          {topics.map((t: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <LinkNoPrefetch
              key={t.id}
              href={`/forum/post?id=${t.id}`}
              className="glass-card p-4 flex items-center gap-4 group hover:border-[#E94560]/15 transition-all"
            >
              <span className={`text-xl font-black w-8 text-center shrink-0 ${
                i === 0 ? "text-[#E94560]" : i === 1 ? "text-[#F59E0B]" : i === 2 ? "text-[#F59E0B]/70" : "text-[#64748B]"
              }`}>{i + 1}</span>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#E94560] transition-colors truncate">
                  {t.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                  <span>{t.author_name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(t.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="flex items-center gap-1 text-[#E94560]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.reply_count}
                </span>
                <span className="text-[#64748B] hidden sm:inline">
                  {t.view_count?.toLocaleString()} 浏览
                </span>
              </div>
            </LinkNoPrefetch>
          ))}
        </div>
      </div>
    </section>
  );
}
