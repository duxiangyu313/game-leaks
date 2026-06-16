"use client";

import { useState, useEffect } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { Gamepad2, Flame, MessageSquare, Coffee } from "lucide-react";

interface CatStat {
  slug: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  threads: number;
  posts: number;
}

const MOCK_CATS: CatStat[] = [
  { slug: "games", name: "游戏专区", desc: "黑神话、影之刃零、归唐等国产3A游戏讨论", icon: Gamepad2, color: "text-[#06B6D4]", bg: "from-[#06B6D4]/10 to-[#0891B2]/5", threads: 156, posts: 2340 },
  { slug: "leaks", name: "爆料交流", desc: "最新游戏爆料讨论与信息交叉验证", icon: Flame, color: "text-[#F59E0B]", bg: "from-[#F59E0B]/10 to-[#D97706]/5", threads: 89, posts: 1200 },
  { slug: "general", name: "综合讨论", desc: "游戏行业动态、硬件配置、买买买心得", icon: MessageSquare, color: "text-[#10B981]", bg: "from-[#10B981]/10 to-[#059669]/5", threads: 234, posts: 3800 },
  { slug: "off-topic", name: "灌水区", desc: "游戏之外的轻松话题，聊天交友", icon: Coffee, color: "text-[#8B5CF6]", bg: "from-[#8B5CF6]/10 to-[#7C3AED]/5", threads: 456, posts: 8900 },
];

const CAT_BASE = [
  { slug: "games", name: "游戏专区", desc: "黑神话、影之刃零、归唐等国产3A游戏讨论", icon: Gamepad2, color: "text-[#06B6D4]", bg: "from-[#06B6D4]/10 to-[#0891B2]/5" },
  { slug: "leaks", name: "爆料交流", desc: "最新游戏爆料讨论与信息交叉验证", icon: Flame, color: "text-[#F59E0B]", bg: "from-[#F59E0B]/10 to-[#D97706]/5" },
  { slug: "general", name: "综合讨论", desc: "游戏行业动态、硬件配置、买买买心得", icon: MessageSquare, color: "text-[#10B981]", bg: "from-[#10B981]/10 to-[#059669]/5" },
  { slug: "off-topic", name: "灌水区", desc: "游戏之外的轻松话题，聊天交友", icon: Coffee, color: "text-[#8B5CF6]", bg: "from-[#8B5CF6]/10 to-[#7C3AED]/5" },
];

export default function ForumCategoryCards() {
  const [cats, setCats] = useState<CatStat[]>(MOCK_CATS);

  useEffect(() => {
    Promise.all(
      CAT_BASE.map(async (c) => {
        const { count: threads } = await supabase.from("forum_posts").select("id", { count: "exact", head: true }).eq("category", c.slug);
        const { count: replies } = await supabase.from("forum_replies").select("id", { count: "exact", head: true }).eq("category", c.slug).maybeSingle();
        return { ...c, threads: threads || 0, posts: (threads || 0) + (typeof replies === 'number' ? replies : 0) };
      })
    ).then(setCats)
    .catch(() => setCats(MOCK_CATS));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cats.map((cat) => (
        <LinkNoPrefetch key={cat.slug} href={`/forum/${cat.slug}`}
          className="glass-card forum-card forum-card-enter forum-card-scroll-glow p-6 bg-gradient-to-br hover:bg-[#1E293B]/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[#06B6D4]/20"
          style={{ backgroundImage: `linear-gradient(to bottom right, ${cat.bg.split(' ')[1]}, ${cat.bg.split(' ')[3]})` }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E293B]/60 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
              <cat.icon className={`w-6 h-6 ${cat.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors">{cat.name}</h3>
              <p className="text-sm text-[#94A3B8] mt-1">{cat.desc}</p>
              <div className="forum-stats flex items-center gap-4 mt-3 text-xs text-[#64748B]">
                <span>{cat.threads} 主题</span>
                <span>{cat.posts} 帖子</span>
              </div>
            </div>
          </div>
        </LinkNoPrefetch>
      ))}
    </div>
  );
}
