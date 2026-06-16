"use client";

import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { Calendar, Users, Star, Clock } from "lucide-react";
import type { GameProgress } from "@/types";

interface DevProgressCardProps {
  game: GameProgress;
  compact?: boolean;
}

/** 开发阶段 → 颜色映射 */
const STAGE_COLORS: Record<string, string> = {
  "概念阶段": "bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20",
  "原型开发": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  "Alpha测试": "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20",
  "Beta测试": "bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/20",
  "压盘阶段": "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  "已发售": "bg-[#10B981]/80 text-white border-[#10B981]",
};

/** 可信度评分 → 星级渲染 */
function CredibilityStars({ score }: { score: number }) {
  const stars = [];
  const fullStars = Math.floor(score / 2);
  const halfStar = score % 2 >= 1;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
    );
  }
  if (halfStar) {
    stars.push(
      <div key="half" className="relative w-3.5 h-3.5">
        <Star className="absolute w-3.5 h-3.5 text-[#334155]" />
        <div className="absolute w-3.5 h-3.5 overflow-hidden" style={{ width: "50%" }}>
          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
        </div>
      </div>
    );
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-[#334155]" />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/** 用固定参考日期判断是否7天内更新（避免 render 中 Date.now() 导致 SSR hydration mismatch） */
function isUpdatedThisWeek(dateStr: string, referenceDate?: Date): boolean {
  const updated = new Date(dateStr);
  if (isNaN(updated.getTime())) return false;
  // 使用构建时的固定日期作为参考，而非实时 Date.now()
  const ref = referenceDate || new Date("2026-06-16T00:00:00Z");
  const diff = ref.getTime() - updated.getTime();
  return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
}

/** 格式化日期 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return "待定";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
  } catch {
    return dateStr;
  }
}

export default function DevProgressCard({ game, compact }: DevProgressCardProps) {
  const stageColor = STAGE_COLORS[game.development_stage] || STAGE_COLORS["概念阶段"];
  const isNew = isUpdatedThisWeek(game.last_updated);

  return (
    <LinkNoPrefetch
      href={`/games/progress/detail?id=${game.id}`}
      className="glass-card block group h-full hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* 封面区 */}
      <div className="relative aspect-video overflow-hidden bg-[#1E293B]">
        {game.cover_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img
              src={game.cover_url}
              alt={game.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* 底部渐变叠加 */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent pointer-events-none" />
          </>
        ) : (
          /* 无封面占位 */
          <div className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center">
            <span className="text-5xl font-black text-[#334155] select-none">
              {game.name.charAt(0)}
            </span>
          </div>
        )}

        {/* 本周更新角标 */}
        {isNew && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-semibold text-[#10B981]">本周更新</span>
          </div>
        )}

        {/* 阶段标签（封面左下角） */}
        <div className={`absolute bottom-3 left-3 text-[10px] px-2 py-0.5 rounded-full border ${stageColor}`}>
          {game.development_stage}
        </div>
      </div>

      {/* 信息区 */}
      <div className={`${compact ? "p-3" : "p-4"}`}>
        {/* 游戏名 */}
        <h3 className="font-semibold text-[#F1F5F9] group-hover:text-[#06B6D4] transition-colors truncate text-sm">
          {game.name}
        </h3>

        {/* 开发商 */}
        {game.developer && (
          <p className="text-xs text-[#64748B] mt-0.5 truncate">{game.developer}</p>
        )}

        {/* Meta 行 */}
        <div className="flex items-center gap-3 mt-3 text-xs text-[#64748B]">
          {game.estimated_release_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(game.estimated_release_date)}
            </span>
          )}
          {!compact && game.team_size && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.team_size}人
            </span>
          )}
        </div>

        {/* 可信度评分 */}
        <div className="flex items-center gap-2 mt-2">
          <CredibilityStars score={game.credibility_score} />
          <span className="text-[10px] text-[#64748B] tabular-nums">{game.credibility_score}/10</span>
        </div>

        {/* 更新时间（紧凑模式不显示） */}
        {!compact && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-[#475569]">
            <Clock className="w-3 h-3" />
            {formatDate(game.last_updated)} 更新
          </div>
        )}
      </div>
    </LinkNoPrefetch>
  );
}
