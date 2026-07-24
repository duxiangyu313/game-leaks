"use client";

import { motion } from "framer-motion";

interface PromoScene1Props {
  active: boolean;
}

/** 场景一：品牌开场 — 居中大标题 + 副标题 + 域名 + 雷达 logo */
export default function PromoScene1({ active }: PromoScene1Props) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* 背景粒子（简化版） */}
      <BackgroundParticles />

      {/* 雷达 / Logo SVG */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={active ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="relative mb-10 h-40 w-40"
      >
        <RadarLogo />
      </motion.div>

      {/* 主标题 - 国游爆料 */}
      <motion.h1
        initial={{ filter: "blur(20px)", opacity: 0, y: -30 }}
        animate={
          active
            ? { filter: "blur(0px)", opacity: 1, y: 0 }
            : { filter: "blur(20px)", opacity: 0, y: -30 }
        }
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
        className="text-center text-5xl font-black tracking-[0.2em] text-white sm:text-6xl md:text-7xl"
        style={{ textShadow: "0 0 30px rgba(34, 211, 238, 0.6)" }}
      >
        国游爆料
      </motion.h1>

      {/* 副标题 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
        className="mt-4 text-sm font-medium tracking-[0.5em] text-cyan-300 sm:text-base"
      >
        CHINESE GAME INTELLIGENCE
      </motion.p>

      {/* 装饰分隔线 */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={active ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
        className="mt-6 h-px w-48 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      />

      {/* 域名 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
        className="mt-6 font-mono text-xs tracking-widest text-white/60 sm:text-sm"
      >
        news.guoyouwenduji.cc
      </motion.p>
    </motion.div>
  );
}

/** 雷达 / 信号 Logo — 同心圆 + 中心发光球 */
function RadarLogo() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.5))" }}
    >
      {/* 旋转扫描扇形 */}
      <motion.g
        style={{ transformOrigin: "100px 100px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.7)" />
          </linearGradient>
        </defs>
        <path
          d="M 100 100 L 100 10 A 90 90 0 0 1 190 100 Z"
          fill="url(#scanGrad)"
          opacity="0.6"
        />
      </motion.g>

      {/* 同心圆 */}
      {[90, 65, 40, 18].map((r, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="1"
        />
      ))}

      {/* 十字线 */}
      <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="0.5" />
      <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="0.5" />

      {/* 信号点 */}
      <circle cx="150" cy="60" r="2.5" fill="#22d3ee">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="140" r="2" fill="#22d3ee">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="150" r="1.8" fill="#22d3ee">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite" begin="0.3s" />
      </circle>

      {/* 中心发光球 */}
      <motion.circle
        cx="100"
        cy="100"
        r="6"
        fill="#22d3ee"
        animate={{ r: [6, 8, 6], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="100" cy="100" r="14" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/** 简化版背景粒子 */
function BackgroundParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 3}px rgba(34, 211, 238, 0.6)`,
          }}
          animate={{ y: [-10, 10, -10], opacity: [0.2, 0.7, 0.2] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
