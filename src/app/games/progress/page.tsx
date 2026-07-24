"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { Gamepad2, Search, SlidersHorizontal, X, LayoutGrid, List, Zap, TrendingUp } from "lucide-react";
import DevProgressCard from "@/components/DevProgressCard";
import type { GameProgress } from "@/types";

const STAGES = ["全部", "概念阶段", "原型开发", "Alpha测试", "Beta测试", "压盘阶段", "已发售"] as const;

// 阶段对应的视觉颜色（用于统计条）
const STAGE_BAR_COLORS: Record<string, string> = {
  "概念阶段": "bg-[#64748B]",
  "原型开发": "bg-[#F59E0B]",
  "Alpha测试": "bg-[#06B6D4]",
  "Beta测试": "bg-[#22D3EE]",
  "压盘阶段": "bg-[#10B981]",
  "已发售": "bg-[#10B981]/60",
};

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

// 判断是否本周更新（使用固定参考日期避免 hydration mismatch）
const REF_DATE = new Date("2026-07-24T00:00:00Z");
function isRecent(dateStr: string): boolean {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const diff = REF_DATE.getTime() - d.getTime();
  return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

export default function GameProgressListPage() {
  const [games, setGames] = useState<GameProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("全部");
  const [devFilter, setDevFilter] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [onlyRecent, setOnlyRecent] = useState(false);

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

  // ═══ 统计数据 ═══
  const stats = useMemo(() => {
    const byStage: Record<string, number> = {};
    let recentCount = 0;
    for (const g of games) {
      byStage[g.development_stage] = (byStage[g.development_stage] || 0) + 1;
      if (isRecent(g.last_updated)) recentCount++;
    }
    return { byStage, recentCount, total: games.length };
  }, [games]);

  // ═══ 开发商列表（只显示有 2+ 款游戏的开发商） ═══
  const developers = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of games) {
      if (g.developer) {
        counts[g.developer] = (counts[g.developer] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [games]);

  // ═══ 客户端筛选 + 排序 ═══
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

    // 开发商筛选
    if (devFilter !== "全部") {
      result = result.filter((g) => g.developer === devFilter);
    }

    // 本周更新筛选
    if (onlyRecent) {
      result = result.filter((g) => isRecent(g.last_updated));
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
  }, [games, search, stageFilter, devFilter, onlyRecent, sortBy]);

  const hasActiveFilters = search || stageFilter !== "全部" || devFilter !== "全部" || onlyRecent;

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* ═══ 页面标题 ═══ */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="w-7 h-7 text-[#06B6D4]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#F1F5F9]">
              游戏开发进度数据库
            </h1>
          </div>
          <p className="text-[#94A3B8] text-sm md:text-base ml-10">
            实时追踪 {games.length} 款国产 3A 游戏的最新开发状态
          </p>
        </div>

        {/* ═══ 统计概览栏 ═══ */}
        {!loading && games.length > 0 && (
          <div className="glass-card p-4 mb-6">
            {/* 数字统计 */}
            <div className="flex items-center gap-6 mb-3 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#F1F5F9] tabular-nums">{stats.total}</span>
                <span className="text-xs text-[#64748B]">总追踪</span>
              </div>
              <div className="w-px h-6 bg-[#1E293B]" />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#10B981] tabular-nums">{stats.recentCount}</span>
                <span className="text-xs text-[#64748B]">本周更新</span>
              </div>
              <div className="w-px h-6 bg-[#1E293B]" />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#06B6D4] tabular-nums">{stats.byStage["已发售"] || 0}</span>
                <span className="text-xs text-[#64748B]">已发售</span>
              </div>
              <div className="w-px h-6 bg-[#1E293B]" />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#F59E0B] tabular-nums">
                  {(stats.byStage["压盘阶段"] || 0) + (stats.byStage["Beta测试"] || 0)}
                </span>
                <span className="text-xs text-[#64748B]">临近发售</span>
              </div>
            </div>

            {/* 阶段分布进度条 */}
            <div className="flex h-2 rounded-full overflow-hidden bg-[#1E293B]">
              {STAGES.slice(1).map((stage) => {
                const count = stats.byStage[stage] || 0;
                if (count === 0) return null;
                const pct = (count / stats.total) * 100;
                return (
                  <div
                    key={stage}
                    className={`${STAGE_BAR_COLORS[stage]} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${stage}: ${count} 款`}
                  />
                );
              })}
            </div>

            {/* 阶段图例 */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {STAGES.slice(1).map((stage) => {
                const count = stats.byStage[stage] || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stageFilter === stage ? "全部" : stage)}
                    className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full ${STAGE_BAR_COLORS[stage]}`} />
                    {stage}
                    <span className="text-[#475569] tabular-nums">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 筛选栏 ═══ */}
        <div className="glass-card p-4 mb-6 space-y-3">
          {/* 搜索 + 排序 + 视图切换 */}
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

            {/* 本周更新快捷按钮 */}
            <button
              onClick={() => setOnlyRecent(!onlyRecent)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors duration-200 ${
                onlyRecent
                  ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                  : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              本周更新
              {onlyRecent && <span className="tabular-nums">({stats.recentCount})</span>}
            </button>

            {/* 排序 */}
            <div className="flex items-center gap-1.5">
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

            {/* 视图切换 */}
            <div className="flex items-center gap-1 ml-auto bg-[#0F172A]/60 border border-[#1E293B] rounded-lg p-0.5">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  view === "grid" ? "bg-[#1E293B] text-[#06B6D4]" : "text-[#64748B] hover:text-[#94A3B8]"
                }`}
                title="网格视图"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded-md transition-colors duration-200 ${
                  view === "list" ? "bg-[#1E293B] text-[#06B6D4]" : "text-[#64748B] hover:text-[#94A3B8]"
                }`}
                title="列表视图"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors duration-200 ${
                showFilters || devFilter !== "全部"
                  ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
                  : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              高级筛选
              {(stageFilter !== "全部" || devFilter !== "全部") && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              )}
            </button>
          </div>

          {/* 展开的高级筛选 */}
          {(showFilters || devFilter !== "全部") && (
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              {/* 开发阶段筛选 */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-[#64748B] uppercase tracking-wider mr-1 w-16">
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
                    {stage !== "全部" && stats.byStage[stage] ? (
                      <span className="ml-1 text-[9px] text-[#475569] tabular-nums">
                        {stats.byStage[stage]}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              {/* 开发商筛选 */}
              {developers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider mr-1 w-16">
                    开发商
                  </span>
                  <button
                    onClick={() => setDevFilter("全部")}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors duration-200 ${
                      devFilter === "全部"
                        ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
                        : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
                    }`}
                  >
                    全部
                  </button>
                  {developers.map((dev) => (
                    <button
                      key={dev}
                      onClick={() => setDevFilter(devFilter === dev ? "全部" : dev)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors duration-200 max-w-[180px] truncate ${
                        devFilter === dev
                          ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30"
                          : "bg-[#1E293B]/40 text-[#94A3B8] border border-[#1E293B] hover:border-[#334155]"
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ 加载态 ═══ */}
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

        {/* ═══ 空态 ═══ */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Gamepad2 className="w-12 h-12 text-[#334155] mx-auto mb-4" />
            <p className="text-[#64748B]">没有找到匹配的开发进度记录</p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch("");
                  setStageFilter("全部");
                  setDevFilter("全部");
                  setOnlyRecent(false);
                }}
                className="mt-3 text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
              >
                清除所有筛选条件
              </button>
            )}
          </div>
        )}

        {/* ═══ 结果列表 ═══ */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-[#475569]">
                共 <span className="text-[#94A3B8] tabular-nums">{filtered.length}</span> 个游戏
                {stageFilter !== "全部" && ` · 阶段: ${stageFilter}`}
                {devFilter !== "全部" && ` · 开发商: ${devFilter}`}
                {onlyRecent && ` · 本周更新`}
                {search && ` · 搜索: "${search}"`}
              </div>
              {onlyRecent && (
                <div className="flex items-center gap-1 text-[10px] text-[#10B981]">
                  <TrendingUp className="w-3 h-3" />
                  实时追踪中
                </div>
              )}
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((game) => (
                  <DevProgressCard key={game.id} game={game} view="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((game) => (
                  <DevProgressCard key={game.id} game={game} view="list" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
