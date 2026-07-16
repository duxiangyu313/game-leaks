"use client";

import { useState, useEffect, useCallback } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";
import { useCachedQuery } from "@/lib/data-cache";

interface Slide { id: string; title: string; subtitle: string; link: string; tag: string; }

const MOCK_SLIDES: Slide[] = [
  { id: "1", title: "归唐 · 六月六日全球首秀", subtitle: "网易首款自研买断制3A，安史之乱后的敦煌悲歌，SGF 2026实机首曝", link: "/leaks/", tag: "🔥 重磅" },
  { id: "2", title: "湮灭之潮 · 成都线下试玩", subtitle: "腾讯蛇夫座100人团队，亚瑟王题材高速ACT，30+Boss战今夏来袭", link: "/leaks/", tag: "⚔️ 新游" },
  { id: "3", title: "影之刃零 · 9月9日发售", subtitle: "灵游坊暗黑武侠巨制，全人类手工制作拒绝AI，主线20-30小时", link: "/games/", tag: "📅 定档" },
  { id: "4", title: "黑神话 · 钟馗首曝实机", subtitle: "游戏科学第二款3A，团队扩军至165人，UE5打造全新捉鬼宇宙", link: "/leaks/", tag: "🔴 独家" },
];

// 内联 SVG 图标，避免 lucide-react 体积
const LeftArrow = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const RightArrow = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const ZapIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const { data: slides, loading } = useCachedQuery<Slide[]>(
    "hero",
    () => supabase
      .from("leaks")
      .select("id, title, summary, game_name, credibility, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((l: any) => ({
            id: l.id,
            title: l.title,
            subtitle: l.summary?.slice(0, 80) + (l.summary?.length > 80 ? "..." : ""),
            link: "/leaks/",
            tag: l.credibility === "confirmed" ? "✅ 已确认" : l.credibility === "likely" ? "🔍 高可信" : "📢 传闻",
          }));
        }
        return MOCK_SLIDES;
      }),
    MOCK_SLIDES,
    "hero"
  );

  const next = useCallback(() => setCurrent(prev => (prev + 1) % Math.max(slides.length, 1)), [slides]);
  const prev = useCallback(() => setCurrent(prev => (prev - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1)), [slides]);

  useEffect(() => {
    if (isHovered || slides.length === 0 || isMobile) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isHovered, slides, isMobile]);

  // 加载态 — 轻量 skeleton
  if (loading) return (
    <div className="w-full h-[280px] md:h-[540px] rounded-2xl bg-[#14171D]/30 animate-pulse" />
  );

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <div
      className="relative w-full h-[280px] md:h-[540px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cinematic Dark 氛围背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080A0D] via-[#0F1117] to-[#080A0D]">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#F5A623]/5 blur-[80px]" />
        <div className="absolute -bottom-20 left-20 w-60 h-60 rounded-full bg-[#E94560]/3 blur-[60px]" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 rounded-full bg-[#3880FF]/2 blur-[70px]" />
      </div>

      {/* 幻灯片 — CSS transition 替代 framer-motion AnimatePresence */}
      <div className="absolute inset-0 flex items-center px-6 md:px-20">
        <div
          key={slide.id}
          className="max-w-2xl z-10 animate-slide-in"
        >
          {slide.tag && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/20 rounded-full mb-4">
              <ZapIcon />{slide.tag}
            </span>
          )}
          <h2 className="text-xl md:text-6xl font-black tracking-tighter text-[#F1F5F9] mb-3 md:mb-4 leading-[1.05]">{slide.title}</h2>
          <p className="text-sm md:text-lg text-[#94A3B8] mb-6 md:mb-8 max-w-lg leading-relaxed">{slide.subtitle}</p>
          <LinkNoPrefetch
            href={slide.link || "/leaks/"}
            className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-[#F5A623] to-[#D4891A] text-white text-sm md:text-base font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(245,166,35,0.35)] transition-all"
          >
            查看详情 <RightArrow />
          </LinkNoPrefetch>
        </div>
      </div>

      {/* 左右箭头 — 移动端隐藏以节省渲染 */}
      {!isMobile && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-[#1E293B]/60 backdrop-blur text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/80 transition-all" aria-label="上一张">
            <LeftArrow />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-[#1E293B]/60 backdrop-blur text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/80 transition-all" aria-label="下一张">
            <RightArrow />
          </button>
        </>
      )}

      {/* 指示器 */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-[#F5A623] shadow-[0_0_8px_rgba(245,166,35,0.4)]" : "w-1.5 bg-[#64748B]/40 hover:bg-[#64748B]/60"}`}
            aria-label={`切换到第${i + 1}张`}
          />
        ))}
      </div>
    </div>
  );
}
