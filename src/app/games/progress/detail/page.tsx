"use client";

import { useEffect, useState, Suspense, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Calendar, Users, Star, Shield, Clock, Loader2, Globe, Lock, Gamepad2 } from "lucide-react";
import { getUserLevel, type MembershipLevel } from "@/lib/auth";
import PaywallBlur from "@/components/article/PaywallBlur";
import DevProgressCard from "@/components/DevProgressCard";
import type { GameProgress } from "@/types";

/** 阶段颜色映射（与卡片一致） */
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return "待定";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

/** 相对时间 */
function relativeTime(dateStr?: string): string {
  if (!dateStr) return "未知";
  try {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days < 1) return "今天";
    if (days < 2) return "昨天";
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;
    if (days < 365) return `${Math.floor(days / 30)} 个月前`;
    return `${Math.floor(days / 365)} 年前`;
  } catch {
    return dateStr;
  }
}

/** 可信度星级 */
function StarRating({ score }: { score: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const threshold = i * 2;
    if (score >= threshold) {
      stars.push(<Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />);
    } else if (score >= threshold - 1) {
      stars.push(
        <div key={i} className="relative w-5 h-5">
          <Star className="absolute w-5 h-5 text-[#334155]" />
          <div className="absolute w-5 h-5 overflow-hidden" style={{ width: "50%" }}>
            <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="w-5 h-5 text-[#334155]" />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

/** 简单 Markdown 转 HTML（处理加粗和换行），先转义 HTML 防 XSS */
function simpleMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#F1F5F9] font-semibold'>$1</strong>")
    .replace(/\n\n/g, "</p><p class='mb-3'>")
    .replace(/\n-/g, "\n<br/>-")
    .replace(/^/, "<p class='mb-3'>")
    .replace(/$/, "</p>");
}

function DetailContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const [game, setGame] = useState<GameProgress | null>(null);
  const [related, setRelated] = useState<GameProgress[]>([]);
  const [userLevel, setUserLevel] = useState<MembershipLevel>("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      startTransition(() => {
        setLoading(false);
        setError("未提供游戏ID");
      });
      return;
    }

    const loadData = async () => {
      try {
        const level = await getUserLevel();
        setUserLevel(level);

        const { data: g, error: gErr } = await supabase
          .from("game_progress")
          .select("*")
          .eq("id", id)
          .single();

        if (gErr || !g) {
          setError("开发进度记录未找到");
          setLoading(false);
          return;
        }

        setGame(g as GameProgress);

        // 更新页面标题
        document.title = `${g.name} 开发进度 · 国游爆料`;

        // 相关游戏（同类型，排除当前，最多3个）
        if (g.genre) {
          const { data: rel } = await supabase
            .from("game_progress")
            .select("*")
            .neq("id", id)
            .eq("genre", g.genre)
            .limit(3);
          if (rel) setRelated(rel as GameProgress[]);
        }

        // 如果同类型不够3个，补充最新游戏
        if (related.length < 3) {
          const { data: fill } = await supabase
            .from("game_progress")
            .select("*")
            .neq("id", id)
            .order("last_updated", { ascending: false })
            .limit(3);
          if (fill) setRelated(fill as GameProgress[]);
        }

        setLoading(false);
      } catch {
        setError("加载失败，请稍后重试");
        setLoading(false);
      }
    };

    loadData();
  }, [id, related.length]);

  // 加载态
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-64 md:h-80 bg-[#1E293B] rounded-2xl" />
            <div className="h-24 bg-[#1E293B] rounded-xl" />
            <div className="h-48 bg-[#1E293B] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 错误态
  if (error || !game) {
    return (
      <div className="min-h-screen pt-20 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 text-center py-20">
          <Shield className="w-16 h-16 text-[#334155] mx-auto mb-4" />
          <p className="text-[#64748B] text-lg">{error || "记录未找到"}</p>
          <LinkNoPrefetch
            href="/games/progress"
            className="inline-flex items-center gap-2 mt-4 text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回开发进度列表
          </LinkNoPrefetch>
        </div>
      </div>
    );
  }

  const stageColor = STAGE_COLORS[game.development_stage] || STAGE_COLORS["概念阶段"];

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* 返回导航 */}
        <LinkNoPrefetch
          href="/games/progress"
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#06B6D4] transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回开发进度列表
        </LinkNoPrefetch>

        {/* ========== 顶部英雄区 ========== */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-[#1E293B]">
          {game.cover_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
              <img
                src={game.cover_url}
                alt={game.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center gap-3">
              <span className="text-sm text-[#475569]">游戏封面</span>
              <span className="text-lg text-[#64748B]">暂无公开信息</span>
            </div>
          )}

          {/* 标题叠加层 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                  {game.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-[#94A3B8] flex-wrap">
                  {game.developer && <span>{game.developer}</span>}
                  {game.publisher && (
                    <>
                      <span className="text-[#334155]">|</span>
                      <span>{game.publisher}</span>
                    </>
                  )}
                  {game.genre && (
                    <>
                      <span className="text-[#334155]">|</span>
                      <span>{game.genre}</span>
                    </>
                  )}
                </div>
              </div>
              <div className={`text-xs px-3 py-1 rounded-full border ${stageColor}`}>
                {game.development_stage}
              </div>
            </div>
          </div>
        </div>

        {/* ========== 核心信息卡 ========== */}
        <div className="glass-card p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">开发阶段</p>
              <p className={`text-sm font-semibold ${stageColor.split(" ")[1]}`}>
                {game.development_stage}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                预计发售
              </p>
              <p className="text-sm font-semibold text-[#F1F5F9]">
                {formatDate(game.estimated_release_date)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                <Users className="w-3 h-3 inline mr-1" />
                团队规模
              </p>
              <p className="text-sm font-semibold text-[#F1F5F9]">
                {game.team_size && game.team_size > 0 ? `${game.team_size} 人` : "未公开"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B] uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                最后更新
              </p>
              <p className="text-sm font-semibold text-[#F1F5F9]">
                {relativeTime(game.last_updated)}
              </p>
            </div>
          </div>

          {/* 可信度评分 */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1E293B]">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
              可信度评分
            </span>
            <StarRating score={game.credibility_score} />
            <span className="text-lg font-black text-[#F1F5F9] tabular-nums">
              {game.credibility_score}
            </span>
            <span className="text-xs text-[#64748B]">/10</span>
          </div>
        </div>

        {/* ========== 内容分区 ========== */}

        {/* 公开信息 */}
        {game.public_info && game.public_info.trim() && (
          <section className="glass-card p-6 mb-4">
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[#06B6D4]" />
              📋 公开信息
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#64748B]/10 text-[#64748B] border border-[#64748B]/20">
                免费可见
              </span>
            </h2>
            <div
              className="prose prose-invert prose-sm max-w-none text-[#94A3B8] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(game.public_info) }}
            />
          </section>
        )}

        {/* 黄金会员专属 */}
        {(game.gold_info || game.risk_assessment) && (
          <section className="glass-card p-6 mb-4">
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-[#F59E0B]" />
              🥇 黄金会员专属
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                深度内幕 & 风险评估
              </span>
            </h2>
            <PaywallBlur
              membershipLevel={userLevel}
              requiredTier="gold"
              articleId={game.id}
              blurStartPct={20}
            >
              {game.gold_info && (
                <div
                  className="prose prose-invert prose-sm max-w-none text-[#94A3B8] leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(game.gold_info) }}
                />
              )}
              {game.risk_assessment && (
                <>
                  <hr className="border-[#1E293B] my-4" />
                  <h3 className="text-sm font-bold text-[#F59E0B] mb-2">⚠️ 开发风险评估</h3>
                  <div
                    className="prose prose-invert prose-sm max-w-none text-[#94A3B8] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: simpleMarkdown(game.risk_assessment) }}
                  />
                </>
              )}
            </PaywallBlur>
          </section>
        )}

        {/* 钻石会员专属 */}
        {game.diamond_info && game.diamond_info.trim() && (
          <section className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-[#E94560]" />
              💎 钻石会员专属
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E94560]/10 text-[#E94560] border border-[#E94560]/20">
                顶级情报
              </span>
            </h2>
            <PaywallBlur
              membershipLevel={userLevel}
              requiredTier="diamond"
              articleId={game.id}
              blurStartPct={15}
            >
              <div
                className="prose prose-invert prose-sm max-w-none text-[#94A3B8] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: simpleMarkdown(game.diamond_info) }}
              />
            </PaywallBlur>
          </section>
        )}

        {/* 全空状态兜底 */}
        {!game.public_info && !game.gold_info && !game.diamond_info && !game.risk_assessment && (
          <div className="glass-card p-12 text-center">
            <Globe className="w-12 h-12 text-[#334155] mx-auto mb-4" />
            <p className="text-[#64748B]">该游戏暂无详细信息</p>
            <p className="text-xs text-[#475569] mt-2">我们正在持续追踪，请关注后续更新</p>
          </div>
        )}

        {/* ========== 相关游戏推荐 ========== */}
        {related.length > 0 && (
          <section className="pt-4">
            <h2 className="text-xl font-bold text-[#F1F5F9] mb-6 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#06B6D4]" />
              相关开发项目
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.slice(0, 3).map((g) => (
                <DevProgressCard key={g.id} game={g} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/** 外层 Suspense 包裹（Static Export 必需） */
export default function GameProgressDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 pb-20 flex justify-center items-center">
          <Loader2 className="w-6 h-6 text-[#06B6D4] animate-spin" />
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
