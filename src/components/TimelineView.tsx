"use client";

import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Calendar } from "lucide-react";
import type { GameProgress } from "@/types";

/** 阶段颜色（与 DevProgressCard 一致） */
const STAGE_COLORS: Record<string, string> = {
  "概念阶段": "bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20",
  "原型开发": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  "开发中": "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  "Alpha测试": "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
  "Beta测试": "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20",
  "已获版号": "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20",
  "压盘阶段": "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  "即将发售": "bg-[#34D399]/60 text-white border-[#34D399]",
  "已发售": "bg-[#10B981]/80 text-white border-[#10B981]",
};

/** 从 estimated_release_date 提取年份 */
function getYear(dateStr?: string): string {
  if (!dateStr) return "待定";
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : "待定";
}

interface TimelineViewProps {
  games: GameProgress[];
}

export default function TimelineView({ games }: TimelineViewProps) {
  // 按年份分组
  const grouped = games.reduce((acc, game) => {
    const year = getYear(game.estimated_release_date);
    if (!acc[year]) acc[year] = [];
    acc[year].push(game);
    return acc;
  }, {} as Record<string, GameProgress[]>);

  // 年份排序：待定放最后，其他按时间
  const years = Object.keys(grouped).sort((a, b) => {
    if (a === "待定") return 1;
    if (b === "待定") return -1;
    return parseInt(a) - parseInt(b);
  });

  return (
    <div className="space-y-8">
      {years.map((year) => {
        const yearGames = grouped[year];
        const isPast = year !== "待定" && parseInt(year) < new Date().getFullYear();
        return (
          <div key={year}>
            {/* 年份标题 */}
            <div className="flex items-center gap-3 mb-4 sticky top-16 z-10 bg-[#0F172A]/80 backdrop-blur-sm py-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                isPast ? "bg-[#1E293B] text-[#64748B]" : "bg-[#06B6D4]/10 text-[#06B6D4]"
              }`}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold tabular-nums">{year}</span>
                <span className="text-[10px] text-[#475569]">
                  {yearGames.length} 款
                </span>
              </div>
              <div className="flex-1 h-px bg-[#1E293B]" />
            </div>

            {/* 该年份的游戏列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
              {yearGames.map((game) => {
                const stageColor = STAGE_COLORS[game.development_stage] || STAGE_COLORS["概念阶段"];
                return (
                  <LinkNoPrefetch
                    key={game.id}
                    href={`/games/progress/detail?id=${game.id}`}
                    className="glass-card flex items-center gap-3 p-3 group hover:border-[#06B6D4]/30 transition-all duration-200"
                  >
                    {/* 缩略图 */}
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#1E293B]">
                      {game.cover_url ? (
                        <img
                          src={game.cover_url}
                          alt={game.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[9px] text-[#64748B]">暂无封面</span>
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors truncate">
                        {game.name}
                      </h3>
                      {game.developer && (
                        <p className="text-xs text-[#64748B] truncate mt-0.5">
                          {game.developer}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${stageColor}`}>
                          {game.development_stage}
                        </span>
                        {game.estimated_release_date && (
                          <span className="text-[10px] text-[#475569] tabular-nums">
                            {game.estimated_release_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </LinkNoPrefetch>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
