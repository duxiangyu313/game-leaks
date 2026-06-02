"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CarouselSlide } from "@/types";

const SLIDES: CarouselSlide[] = [
  {
    id: "1",
    title: "归唐 · 六月六日全球首秀",
    subtitle: "网易首款自研买断制3A，安史之乱后的敦煌悲歌，SGF 2026实机首曝",
    image: "",
    link: "/leaks/1",
    tag: "🔥 重磅",
  },
  {
    id: "2",
    title: "湮灭之潮 · 成都线下试玩",
    subtitle: "腾讯蛇夫座100人团队，亚瑟王题材高速ACT，30+Boss战今夏来袭",
    image: "",
    link: "/leaks/2",
    tag: "⚔️ 新游",
  },
  {
    id: "3",
    title: "影之刃零 · 9月9日发售",
    subtitle: "灵游坊暗黑武侠巨制，全人类手工制作拒绝AI，主线20-30小时",
    image: "",
    link: "/games/3",
    tag: "📅 定档",
  },
  {
    id: "4",
    title: "黑神话 · 钟馗首曝实机",
    subtitle: "游戏科学第二款3A，团队扩军至165人，UE5打造全新捉鬼宇宙",
    image: "",
    link: "/leaks/4",
    tag: "🔴 独家",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isHovered]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full h-[420px] md:h-[500px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient per slide */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1A2332] to-[#0F172A]">
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#06B6D4]/5 blur-[80px]" />
        <div className="absolute -bottom-20 left-20 w-60 h-60 rounded-full bg-[#22D3EE]/3 blur-[60px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center px-8 md:px-20"
        >
          <div className="max-w-2xl z-10">
            {slide.tag && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/20 rounded-full mb-5">
                <Zap className="w-3 h-3" />
                {slide.tag}
              </span>
            )}
            <motion.h2
              className="text-3xl md:text-5xl font-bold text-[#F1F5F9] mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {slide.title}
            </motion.h2>
            <motion.p
              className="text-base md:text-lg text-[#94A3B8] mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href={slide.link}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-medium rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all"
              >
                查看详情
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-[#1E293B]/60 backdrop-blur text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/80 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-[#1E293B]/60 backdrop-blur text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/80 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current
                ? "w-8 bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                : "w-1.5 bg-[#64748B]/40 hover:bg-[#64748B]/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
