"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PromoScene0 from "./PromoScene0";
import PromoScene1 from "./PromoScene1";
import PromoScene2 from "./PromoScene2";
import PromoScene3 from "./PromoScene3";
import PromoScene4 from "./PromoScene4";
import PromoScene5 from "./PromoScene5";
import PromoScene6 from "./PromoScene6";
import PromoScene7 from "./PromoScene7";
import PromoScene8 from "./PromoScene8";
import PromoSkipButton from "./PromoSkipButton";

interface PromoHeroProps {
  onComplete?: () => void;
}

/**
 * 宣传片触发条件：
 *  - 未登录 → 每次进入首页都播
 *  - 管理员 → 每次进入都播
 *  - 已登录非管理员 → 跳过
 *
 * 交互：用户自由翻页，到最后一页才能跳过
 */
export default function PromoHero({ onComplete }: PromoHeroProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const SCENES = [PromoScene0, PromoScene1, PromoScene2, PromoScene3, PromoScene4, PromoScene8, PromoScene5, PromoScene7, PromoScene6];
  const totalScenes = SCENES.length;
  const isLastScene = currentScene === totalScenes - 1;

  const finish = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => onComplete?.(), 600);
  }, [onComplete]);

  const goNext = useCallback(() => {
    setCurrentScene((s) => Math.min(s + 1, totalScenes - 1));
  }, [totalScenes]);

  const goPrev = useCallback(() => {
    setCurrentScene((s) => Math.max(s - 1, 0));
  }, []);

  // —— 初始化：auth 检查 + reduced-motion ——
  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handleMq = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handleMq);

    let cancelled = false;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase/client");
        if (cancelled) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;

        if (!user) {
          // 未登录 → 播放
        } else {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
            .split(",").map((e) => e.trim().toLowerCase());
          if (!(user.email && adminEmails.includes(user.email.toLowerCase()))) {
            // 已登录非管理员 → 跳过
            setVisible(false);
            onComplete?.();
            return;
          }
        }
      } catch {
        // 异常降级为播放
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();

    return () => {
      cancelled = true;
      mq.removeEventListener?.("change", handleMq);
    };
  }, [onComplete]);

  // —— 键盘导航 ——
  useEffect(() => {
    if (!mounted || authChecking || !visible || reducedMotion) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape" && isLastScene) {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mounted, authChecking, visible, reducedMotion, goNext, goPrev, finish, isLastScene]);

  // —— 触摸滑动 ——
  useEffect(() => {
    if (!mounted || authChecking || !visible || reducedMotion) return;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mounted, authChecking, visible, reducedMotion, goNext, goPrev]);

  if (!mounted) return null;
  if (authChecking) return null;
  if (!visible) return null;

  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080A]">
        <PromoScene6 active />
        <PromoSkipButton onSkip={finish} />
      </div>
    );
  }

  const CurrentSceneComponent = SCENES[currentScene];

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* ====== 黑神话悟空背景 ====== */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/promo/wukong-bg.jpg')",
        }}
      />
      {/* 暗色叠加层 — 保证文字可读 */}
      <div className="absolute inset-0 bg-[#06080A]/85 backdrop-blur-[2px]" />
      {/* 渐变暗角 — 四边压暗 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(6,8,10,0.7) 100%),
            linear-gradient(to bottom, rgba(6,8,10,0.4) 0%, transparent 30%, transparent 70%, rgba(6,8,10,0.6) 100%)
          `,
        }}
      />

      {/* ====== 场景内容 ====== */}
      <div className="relative z-10 h-full w-full">
        {/* 顶部进度条 */}
        <div className="absolute left-0 right-0 top-0 z-[55] h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentScene + 1) / totalScenes) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* 左箭头 */}
        {currentScene > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-[55] -translate-y-1/2 rounded-full bg-white/5 p-2.5 text-white/60 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
            aria-label="上一页"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* 右箭头 */}
        {!isLastScene && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-[55] -translate-y-1/2 rounded-full bg-white/5 p-2.5 text-white/60 backdrop-blur-sm transition-all hover:bg-white/15 hover:text-white"
            aria-label="下一页"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* 场景切换 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <CurrentSceneComponent active />
          </motion.div>
        </AnimatePresence>

        {/* 底部指示器 */}
        <div className="absolute bottom-8 left-1/2 z-[55] flex -translate-x-1/2 gap-2">
          {SCENES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentScene(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentScene ? 24 : 8,
                height: 6,
                backgroundColor: i === currentScene ? "#22d3ee" : "rgba(255,255,255,0.25)",
              }}
              aria-label={`切换到场景 ${i + 1}`}
            />
          ))}
        </div>

        {/* 跳过 — 仅最后一页显示 */}
        {isLastScene && <PromoSkipButton onSkip={finish} label="进入网站" />}

        {/* 页数提示 */}
        <div className="absolute bottom-8 right-6 z-[55] text-xs text-white/30 tabular-nums">
          {currentScene + 1} / {totalScenes}
        </div>
      </div>
    </motion.div>
  );
}
