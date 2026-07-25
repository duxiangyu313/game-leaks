"use client";

/**
 * CJ2026 每日速递页 — /cj2026/day/?d=1
 * Static Export 不支持动态路由，使用 query param 切换 Day 1-4
 */
import { useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import Cj2026Paywall from "@/components/Cj2026Paywall";
import { RECOMMENDATION_MAP } from "@/lib/cj2026-utils";
import type { Cj2026DailyBriefing, Cj2026Highlight } from "@/types";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

export default function Cj2026DayPage() {
  const [day, setDay] = useState(1);
  const [briefing, setBriefing] = useState<Cj2026DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  // 从 query param 读取 day 参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = parseInt(params.get("d") || "1", 10);
    setDay(Math.max(1, Math.min(4, d || 1)));
  }, []);

  // 拉取当日速递
  useEffect(() => {
    if (!day) return;
    setLoading(true);
    db
      .from("cj2026_daily_briefing")
      .select("*")
      .eq("day", day)
      .eq("is_published", true)
      .limit(1)
      .then(({ data }: { data: Cj2026DailyBriefing[] | null }) => {
        setBriefing(data?.[0] || null);
        setLoading(false);
      });
  }, [day]);

  const dayLabels: Record<number, { date: string; label: string }> = {
    1: { date: "7/31", label: "开幕日" },
    2: { date: "8/1", label: "公众日 Day1" },
    3: { date: "8/2", label: "高峰日" },
    4: { date: "8/3", label: "闭幕日" },
  };

  return (
    <Cj2026Paywall onUnlock={() => {}}>
      <div className="pt-20 pb-20">
        <div className="max-w-[960px] mx-auto px-4 md:px-6">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between mb-8">
            <LinkNoPrefetch
              href="/cj2026/"
              className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> CJ2026 首页
            </LinkNoPrefetch>
            {/* Day 切换 */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    day === d
                      ? "bg-[#F5A623] text-[#0F172A]"
                      : "bg-[#1E293B]/40 text-[#64748B] hover:text-[#94A3B8]"
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-[#1E293B]/30 rounded" />
              <div className="h-4 w-96 bg-[#1E293B]/30 rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-[#1E293B]/20 rounded-2xl" />
              ))}
            </div>
          ) : briefing ? (
            <>
              {/* 日期标题 */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E94560]/15 border border-[#E94560]/20 text-[#E94560] text-sm font-semibold mb-3">
                  <Calendar className="w-4 h-4" />
                  Day {day} · {dayLabels[day]?.date}
                </div>
                <h1 className="text-3xl font-black text-[#F1F5F9] mb-2">{briefing.title}</h1>
                <p className="text-[#94A3B8]">{dayLabels[day]?.label}</p>
              </div>

              {/* 重点内容 */}
              <div className="space-y-4 mb-8">
                {Array.isArray(briefing.highlights)
                  ? (briefing.highlights as unknown as Cj2026Highlight[]).map((h, i) => (
                      <div
                        key={i}
                        className="glass-card p-5 hover:border-[rgba(245,166,35,0.15)] transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-[#F5A623]/15 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-[#F5A623]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {h.importance === "high" && (
                                <span className="px-1.5 py-0.5 bg-[#E94560]/15 text-[#E94560] text-[10px] rounded font-semibold">
                                  重磅
                                </span>
                              )}
                              <h3 className="text-lg font-bold text-[#F1F5F9]">{h.title}</h3>
                            </div>
                            <p className="text-sm text-[#94A3B8] mb-3">{h.description}</p>
                            {h.image_url && (
                              <img
                                src={h.image_url}
                                alt={h.title}
                                className="w-full max-h-64 object-cover rounded-lg"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  : null}
              </div>

              {/* 总结 */}
              {briefing.summary && (
                <div className="glass-card p-6 bg-[#F5A623]/5 border-[#F5A623]/10">
                  <h3 className="text-sm font-bold text-[#F5A623] mb-2">📝 当日总结</h3>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">{briefing.summary}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-[#475569] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#94A3B8] mb-2">内容尚未发布</h2>
              <p className="text-sm text-[#64748B]">
                Day {day} 的速递内容将在 {dayLabels[day]?.date} 当天开放
              </p>
              <p className="text-xs text-[#475569] mt-2">
                现场记者正在整理今日重点，稍后更新
              </p>
            </div>
          )}
        </div>
      </div>
    </Cj2026Paywall>
  );
}
