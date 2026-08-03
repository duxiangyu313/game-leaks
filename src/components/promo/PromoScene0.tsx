"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PromoScene0Props {
  active: boolean;
}

/** 场景零：震撼开场 — 粒子汇聚 + 大标题脉冲 + 三连击 */
export default function PromoScene0({ active }: PromoScene0Props) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#06080A]"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 背景脉冲光环 */}
      <PulseRing active={active} />

      {/* 中心流星光点 */}
      <MeteorParticles active={active} />

      {/* 三行大字 */}
      <div className="relative z-10 text-center">
        {/* 第一行：细字铺垫 */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mb-3 text-sm font-medium tracking-[0.5em] text-cyan-300/80 sm:text-base"
        >
          你已抵达
        </motion.p>

        {/* 第二行：大字震撼 */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.7, filter: "blur(16px)" }}
          animate={
            active
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : { opacity: 0, scale: 0.7, filter: "blur(16px)" }
          }
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="mb-4 text-5xl font-black tracking-[0.15em] text-white sm:text-7xl md:text-8xl"
          style={{ textShadow: "0 0 60px rgba(34, 211, 238, 0.5), 0 0 120px rgba(34, 211, 238, 0.2)" }}
        >
          情报中枢
        </motion.h2>

        {/* 第三行：副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="text-base font-medium tracking-[0.3em] text-amber-300/80 sm:text-lg"
        >
          国产 3A · 一站掌握
        </motion.p>
      </div>

      {/* 底部闪烁提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
        transition={{ duration: 2, delay: 2, repeat: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] text-white/30">滚动探索</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="block h-4 w-px bg-gradient-to-b from-cyan-400 to-transparent"
        />
      </motion.div>
    </motion.div>
  );
}

/** 脉冲光环 — 从中心向外扩散 */
function PulseRing({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[300, 200, 120].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/30"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={
            active
              ? {
                  width: [0, size],
                  height: [0, size],
                  opacity: [0, 0.3, 0],
                }
              : { width: 0, height: 0, opacity: 0 }
          }
          transition={{
            duration: 3,
            delay: 0.3 + i * 0.6,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "easeOut",
          }}
        />
      ))}
      {/* 固定中心光晕 */}
      <motion.div
        className="absolute h-2 w-2 rounded-full bg-cyan-400"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: [0, 1, 0.3] } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        style={{ boxShadow: "0 0 40px 8px rgba(34, 211, 238, 0.6)" }}
      />
    </div>
  );
}

/** 流星粒子 — 从四周向中心飞 */
function MeteorParticles({ active }: { active: boolean }) {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      return {
        id: i,
        fromX: Math.cos(angle) * distance,
        fromY: Math.sin(angle) * distance,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
      };
    })
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.size > 2 ? "#F5A623" : "#22d3ee",
            boxShadow: `0 0 ${p.size * 4}px currentColor`,
            left: "50%",
            top: "50%",
          }}
          initial={{ x: `${p.fromX}%`, y: `${p.fromY}%`, opacity: 0 }}
          animate={
            active
              ? {
                  x: [`${p.fromX}%`, "0%"],
                  y: [`${p.fromY}%`, "0%"],
                  opacity: [0, 1, 0],
                }
              : { x: `${p.fromX}%`, y: `${p.fromY}%`, opacity: 0 }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
