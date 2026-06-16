"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { Gamepad2, Search, SlidersHorizontal, X } from "lucide-react";
import DevProgressCard from "@/components/DevProgressCard";
import type { GameProgress } from "@/types";

const STAGES = ["全部", "概念阶段", "原型开发", "Alpha测试", "Beta测试", "压盘阶段", "已发售"] as const;

// 静态回退数据（Supabase 不可用时使用）
const MOCK: GameProgress[] = [
  {
    id: "mock-1", name: "归唐", developer: "网易雷火·临安24",
    development_stage: "概念阶段", credibility_score: 8,
    estimated_release_date: "2027", last_updated: "2026-06-12T00:00:00Z",
    genre: "动作冒险", public_info: "", diamond_info: "", gold_info: "",
    risk_assessment: "", tags: [], is_featured: true,
  },
  {
    id: "mock-2", name: "失落之魂", developer: "Ultizero Games",
    development_stage: "压盘阶段", credibility_score: 10,
    estimated_release_date: "2026 Q3", last_updated: "2026-06-15T00:00:00Z",
    genre: "动作RPG", public_info: "", diamond_info: "", gold_info: "",
    risk_assessment: "", tags: [], is_featured: true,
  },
  {
    id: "mock-3", name: "黑神话：悟空", developer: "游戏科学",
    development_stage: "已发售", credibility_score: 10,
    estimated_release_date: "2024-08-20", last_updated: "2026-06-15T00:00:00Z",
    genre: "动作RPG", public_info: "", diamond_info: "", gold_info: "",
    risk_assessment: "", tags: [], is_featured: true,
  },
];

const SORTS = [
  { value: "updated", label: "最近更新" },
  { value: "release", label: "预计发售" },
  { value: "credibility", label: "可信度" },
  { value: "name", label: "名称" },
] as const;

export default function GameProgressListPage() {
  const [games, setGames] = useState<GameProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.resolve(
      supabase
        .from("game_progress")
        .select("*")
        .order("last_updated", { ascending: false })
    ).then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setGames(data as GameProgress[]);
        } else {
          setGames(MOCK);
        }
        setLoading(false);
      }).catch(() => {
        setGames(MOCK);
        setLoading(false);
      });
  }, []);

  // 提取所有唯一类型
  const genres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.genre) set.add(g.genre);
    });
    return Array.from(set);
  }, [games]);

  // 客户端筛选 + 排序
  const filtered = useMemo(() => {
    let result = [...games];

    // 搜索
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(q) ||
          g.developer?.toLowerCase().includes(q)
      );
    }

    // 阶段筛选
    if (stageFilter !== "全部") {
      result = result.filter((g) => g.development_stage === stageFilter);
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        case "release":
          return (a.estimated_release_date || "9999").localeCompare(b.estimated_release_date || "9999");
        case "credibility":
          return (b.credibility_score || 0) - (a.credibility_score || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

    return result;
  }, [games, search, stageFilter, sortBy]);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="w-7 h-7 text-[#06B6D4]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9]">
              🎮 游戏开发进度数据库
            </h1>
          </div>
          <p className="text-[#94A3B8] text-sm md:text-base ml-10">
            实时追踪 {games.length} 款国产 3A 游戏的最新开发状态
          </p>
        </div>

        {/* 筛选栏 */}
        <div className="glass-card p-4 mb-6 space-y-3">
          {/* 搜索 + 排序 + 展开 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="搜索游戏名称或开发商..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0F172A]/60 border border-[#1E293B] text-sm text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#06B6D4]/50 transition-colors duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#1E293B] transition-colors duration-200"
                >
                  <X className="w-3.5 h-3.5 text-[#64748B]" />
                </button>
              )}
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSortBy(s.value)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors duration-200 ${
                    sortBy === s.value
                      ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
                      : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors duration-200 ${
                showFilters
                  ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
                  : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              阶段筛选
              {stageFilter !== "全部" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              )}
            </button>
          </div>

          {/* 展开的阶段筛选 */}
          {showFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider mr-1">
                开发阶段
              </span>
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors duration-200 ${
                    stageFilter === stage
                      ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
                      : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 加载态 */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden animate-pulse">
                <div className="aspect-video bg-[#1E293B]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#1E293B] rounded w-2/3" />
                  <div className="h-3 bg-[#1E293B] rounded w-1/3" />
                  <div className="h-3 bg-[#1E293B] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空态 */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Gamepad2 className="w-12 h-12 text-[#334155] mx-auto mb-4" />
            <p className="text-[#64748B]">没有找到匹配的开发进度记录</p>
            {(search || stageFilter !== "全部") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStageFilter("全部");
                }}
                className="mt-3 text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
              >
                清除筛选条件
              </button>
            )}
          </div>
        )}

        {/* 卡片网格 */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="text-xs text-[#475569] mb-4">
              共 {filtered.length} 个游戏
              {stageFilter !== "全部" && ` · 筛选: ${stageFilter}`}
              {search && ` · 搜索: "${search}"`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((game) => (
                <DevProgressCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
