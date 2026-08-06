"use client";

import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";
import { Flame } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_TOPICS: any[] = [
  { type: "leak", title: "归唐SGF 2026实机首曝", heat: 98, game_name: "归唐", id: "h1" },
  { type: "article", title: "影之刃零全BOSS战分析", heat: 85, game_name: "影之刃零", id: "h2" },
  { type: "leak", title: "黑神话钟馗新实机流出", heat: 82, game_name: "钟馗", id: "h3" },
  { type: "event", title: "夏日游戏节国产3A专场", heat: 75, game_name: "多游戏", id: "h4" },
  { type: "article", title: "湮灭之潮战斗系统深度解析", heat: 70, id: "h5" },
  { type: "leak", title: "望月新玩法曝光", heat: 65, game_name: "望月", id: "h6" },
];

// 编辑精选：8-6 高热度爆料/文章置顶（按热度排序，优先占据「今日热点」前排）
// 突破原逻辑中文章 heat 写死 80 的限制，让新文章也能进前排
const EDITOR_PICKS: { id: string; type: "leak" | "article" }[] = [
  { id: "4d79b868-4c95-4530-b430-74812c01423a", type: "leak" },     // 影之刃零·开发完成+预售
  { id: "70a0e44c-1970-4602-bb75-6e68f5916dff", type: "article" }, // 影之刃零·268元定价拆解
  { id: "d911c992-a68e-4120-8ace-7bec59fbac04", type: "leak" },     // 黑神话：钟馗·8月窗口
  { id: "922b88b0-34ab-4e56-a941-882fa963f3e9", type: "article" }, // 搜打撤·三条路线
  { id: "74674e5a-a432-41ce-ba30-bc9065b1ad02", type: "leak" },     // 抵抗者·CJ炸场
  { id: "5a63e2fe-ca8e-46dc-b90a-dab109d13169", type: "article" }, // 网易的两副面孔
  { id: "15186f18-f2a0-4349-9bbb-bf8b93d200fa", type: "leak" },     // 绝区零·3.1收入新高（替补位）
];

export default function HotTopics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: topics, loading } = useCachedQuery<any[]>(
    "topics",
    async () => {
      const pickLeakIds = EDITOR_PICKS.filter((p) => p.type === "leak").map((p) => p.id);
      const pickArticleIds = EDITOR_PICKS.filter((p) => p.type === "article").map((p) => p.id);
      const rank = new Map(EDITOR_PICKS.map((p, i) => [p.id, 1_000_000 - i]));
      const [{ data: pLeaks }, { data: pArticles }, { data: leaks }, { data: articles }, { data: events }] =
        await Promise.all([
          supabase.from("leaks").select("*").in("id", pickLeakIds).eq("status", "published"),
          supabase.from("articles").select("*").in("id", pickArticleIds).eq("status", "published"),
          supabase.from("leaks").select("*").eq("status", "published").order("view_count", { ascending: false }).limit(3),
          supabase.from("articles").select("*").eq("status", "published").order("created_at", { ascending: false }).limit(3),
          supabase.from("game_events").select("*, games(title)").gte("event_date", new Date().toISOString().split("T")[0]).order("event_date").limit(3),
        ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = [
        ...(pLeaks || []).map((l: any) => ({ type: "leak", ...l, heat: rank.get(l.id) ?? 50 })),
        ...(pArticles || []).map((a: any) => ({ type: "article", ...a, heat: rank.get(a.id) ?? 80 })),
        ...(leaks || []).filter((l: any) => !rank.has(l.id)).map((l: any) => ({ type: "leak", ...l, heat: (l.view_count || 0) * 0.7 + 50 })),
        ...(articles || []).filter((a: any) => !rank.has(a.id)).map((a: any) => ({ type: "article", ...a, heat: 80 })),
        ...(events || []).map((e: any) => ({ type: "event", ...e, heat: 60, title: e.title, game_name: e.games?.title })),
      ].sort((a: any, b: any) => b.heat - a.heat).slice(0, 6); // eslint-disable-line @typescript-eslint/no-explicit-any
      return items.length > 0 ? items : MOCK_TOPICS;
    },
    MOCK_TOPICS,
    "topics"
  );

  if (loading) return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-6 h-6 text-[#F59E0B] opacity-30" />
        <div className="w-24 h-6 rounded bg-[#1E293B]/40 animate-pulse" />
      </div>
      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-[#1E293B]/20 animate-pulse" />)}</div>
    </section>
  );
  if (topics.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-6 h-6 text-[#F59E0B]" />
        <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">今日热点</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topics.map((t, i) => (
          <LinkNoPrefetch key={`${t.type}-${t.id}`} href={t.type === "article" ? `/articles/detail?id=${t.id}` : t.type === "leak" ? `/leaks/detail?id=${t.id}` : `/games/detail?id=${t.game_id}`}
            className="glass-card p-4 flex items-center gap-4 group hover:border-[#06B6D4]/20 transition-all">
            <span className={`text-2xl font-black shrink-0 w-10 text-center ${i === 0 ? "text-[#F59E0B]" : i === 1 ? "text-[#F59E0B]/70" : i === 2 ? "text-[#D97706]" : "text-[#64748B]"}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.type === "leak" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : t.type === "article" ? "bg-[#06B6D4]/10 text-[#06B6D4]" : "bg-[#10B981]/10 text-[#10B981]"}`}>
                  {t.type === "leak" ? "爆料" : t.type === "article" ? "文章" : "事件"}
                </span>
                {t.game_name && <span className="text-[10px] text-[#64748B]">{t.game_name}</span>}
              </div>
              <p className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors truncate">{t.title}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] shrink-0">
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#F59E0B]" />{Math.round(t.heat)}°</span>
            </div>
          </LinkNoPrefetch>
        ))}
      </div>
    </section>
  );
}
