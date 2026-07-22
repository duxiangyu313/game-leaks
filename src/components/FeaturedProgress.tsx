"use client";

import { motion } from "framer-motion";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";
import DevProgressCard from "@/components/DevProgressCard";
import type { GameProgress } from "@/types";

const MOCK: GameProgress[] = [
  {
    id: "mock-1",
    name: "归唐",
    developer: "网易雷火·临安24",
    development_stage: "概念阶段",
    credibility_score: 8,
    estimated_release_date: "2027",
    last_updated: "2026-06-12T00:00:00Z",
    genre: "动作冒险",
    public_info: "",
    diamond_info: "",
    gold_info: "",
    risk_assessment: "",
    tags: [],
    is_featured: true,
  },
  {
    id: "mock-2",
    name: "失落之魂",
    developer: "Ultizero Games",
    development_stage: "压盘阶段",
    credibility_score: 10,
    estimated_release_date: "2026 Q3",
    last_updated: "2026-06-15T00:00:00Z",
    genre: "动作RPG",
    public_info: "",
    diamond_info: "",
    gold_info: "",
    risk_assessment: "",
    tags: [],
    is_featured: true,
  },
  {
    id: "mock-3",
    name: "黑神话：悟空",
    developer: "游戏科学",
    development_stage: "已发售",
    credibility_score: 10,
    estimated_release_date: "2024-08-20",
    last_updated: "2026-06-15T00:00:00Z",
    genre: "动作RPG",
    public_info: "",
    diamond_info: "",
    gold_info: "",
    risk_assessment: "",
    tags: [],
    is_featured: true,
  },
];

export default function FeaturedProgress() {
  const { data: games, loading } = useCachedQuery<GameProgress[]>(
    "featuredProgress",
    () =>
      supabase
        .from("game_progress")
        .select("*")
        .eq("is_featured", true)
        .order("last_updated", { ascending: false })
        .limit(3)
        .then(({ data }) => (data && data.length > 0 ? (data as GameProgress[]) : MOCK)),
    MOCK,
    "featuredProgress"
  );

  return (
    <section>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F1F5F9] heading-glow">
              开发进度追踪
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              独家追踪国产3A游戏最新开发动态
            </p>
          </div>
        </div>
        <LinkNoPrefetch
          href="/games/progress"
          className="flex items-center gap-1 text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors duration-200 group"
        >
          查看全部
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </LinkNoPrefetch>
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="aspect-video bg-[#1E293B]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#1E293B] rounded w-2/3" />
                <div className="h-3 bg-[#1E293B] rounded w-1/3" />
                <div className="flex gap-2">
                  <div className="h-3 bg-[#1E293B] rounded w-16" />
                  <div className="h-3 bg-[#1E293B] rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 卡片网格 */}
      {!loading && games && games.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <DevProgressCard game={game} compact />
            </motion.div>
          ))}
        </div>
      )}

      {/* 空态 */}
      {!loading && (!games || games.length === 0) && (
        <div className="glass-card p-8 text-center">
          <TrendingUp className="w-10 h-10 text-[#334155] mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">暂无精选开发进度</p>
        </div>
      )}
    </section>
  );
}
