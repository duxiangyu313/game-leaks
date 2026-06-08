import { Metadata } from "next";
import { MessageSquare, Users, TrendingUp, Plus, Gamepad2, Flame, Coffee } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import ForumCardsGrid from "@/components/ForumCardsGrid";
import ForumLiveStats from "@/components/ForumLiveStats";

export const metadata: Metadata = {
  title: "论坛 · 国游爆料",
  description: "国产3A游戏玩家社区 - 讨论游戏攻略、分享心得、交流爆料",
};

const CATEGORIES = [
  { icon: Gamepad2, name: "游戏专区", slug: "games", desc: "黑神话、影之刃零、归唐等国产3A游戏讨论", threads: 1280, posts: 15600, color: "text-[#06B6D4]", bg: "from-[#06B6D4]/10 to-[#0891B2]/5" },
  { icon: Flame, name: "爆料交流", slug: "leaks", desc: "最新游戏爆料讨论与信息交叉验证", threads: 856, posts: 12300, color: "text-[#F59E0B]", bg: "from-[#F59E0B]/10 to-[#D97706]/5" },
  { icon: MessageSquare, name: "综合讨论", slug: "general", desc: "游戏行业动态、硬件配置、买买买心得", threads: 2100, posts: 28900, color: "text-[#10B981]", bg: "from-[#10B981]/10 to-[#059669]/5" },
  { icon: Coffee, name: "灌水区", slug: "off-topic", desc: "游戏之外的轻松话题，聊天交友", threads: 3500, posts: 52000, color: "text-[#8B5CF6]", bg: "from-[#8B5CF6]/10 to-[#7C3AED]/5" },
];

export default function ForumPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-7 h-7 text-[#06B6D4]" />
              <h1 className="text-3xl font-bold text-[#F1F5F9]">论坛</h1>
            </div>
            <p className="text-[#94A3B8]">国产3A游戏玩家社区</p>
            <div className="mt-3"><ForumLiveStats /></div>
          </div>
          <LinkNoPrefetch href="/forum/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] text-white font-medium rounded-xl hover:bg-[#0891B2] transition-colors">
            <Plus className="w-4 h-4" /> 发布新帖
          </LinkNoPrefetch>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Users, label: "注册用户", count: "12,580", color: "text-[#06B6D4]" },
            { icon: MessageSquare, label: "今日帖子", count: "346", color: "text-[#10B981]" },
            { icon: TrendingUp, label: "在线用户", count: "1,248", color: "text-[#F59E0B]" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-6 flex items-center gap-4">
              <stat.icon className={`w-10 h-10 ${stat.color}`} />
              <div>
                <div className="text-2xl font-bold text-[#F1F5F9]">{stat.count}</div>
                <div className="text-sm text-[#94A3B8]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <ForumCardsGrid>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <LinkNoPrefetch key={cat.slug} href={`/forum/${cat.slug}`}
              className={`glass-card forum-card forum-card-enter forum-card-scroll-glow p-6 bg-gradient-to-br ${cat.bg} hover:bg-[#1E293B]/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[#06B6D4]/20`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1E293B]/60 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors">{cat.name}</h3>
                  <p className="text-sm text-[#94A3B8] mt-1">{cat.desc}</p>
                  <div className="forum-stats flex items-center gap-4 mt-3 text-xs text-[#64748B]">
                    <span>{cat.threads.toLocaleString()} 主题</span>
                    <span>{cat.posts.toLocaleString()} 帖子</span>
                  </div>
                </div>
              </div>
            </LinkNoPrefetch>
          ))}
        </div>
        </ForumCardsGrid>
      </div>
    </div>
  );
}
