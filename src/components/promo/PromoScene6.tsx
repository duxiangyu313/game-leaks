"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

interface PromoScene6Props {
  active: boolean;
}

const STATS = [
  { value: 41, label: "GAMES", color: "#22d3ee" },
  { value: 97, label: "LEAKS", color: "#F5A623" },
  { value: 9, label: "MEMBERS", color: "#E94560" },
];

/** 场景六：CTA 收尾 — 3个大数字统计 + 立即探索 + 域名 */
export default function PromoScene6({ active }: PromoScene6Props) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* 3个大数字统计 */}
      <div className="flex flex-wrap items-end justify-center gap-8 sm:gap-16">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.6, y: 30 }}
            animate={
              active
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.6, y: 30 }
            }
            transition={{
              duration: 0.7,
              delay: 0.2 + i * 0.25,
              ease: "easeOut",
            }}
            className="text-center"
          >
            <div
              className="text-5xl font-black sm:text-7xl"
              style={{
                color: stat.color,
                textShadow: `0 0 30px ${stat.color}80`,
              }}
            >
              <AnimatedNumber value={stat.value} active={active} />
            </div>
            <div className="mt-2 text-[10px] font-bold tracking-[0.3em] text-white/50 sm:text-xs">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 分隔线 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
        className="my-12 h-px w-64 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      {/* 立即探索 大标题 */}
      <motion.h2
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={
          active
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 30, filter: "blur(10px)" }
        }
        transition={{ duration: 0.9, delay: 1.5, ease: "easeOut" }}
        className="text-center text-4xl font-black tracking-wider text-white sm:text-6xl"
        style={{ textShadow: "0 0 40px rgba(34, 211, 238, 0.4)" }}
      >
        立即探索
      </motion.h2>

      {/* 域名 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 2, ease: "easeOut" }}
        className="mt-6 font-mono text-sm tracking-widest text-cyan-300 sm:text-base"
      >
        news.guoyouwenduji.cc
      </motion.p>

      {/* 装饰光点 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 2.3 }}
        className="mt-8 flex items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-1 w-1 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/** 数字递增动画 — 自实现 CountUp 等效效果 */
function AnimatedNumber({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 80,
  });
  const displayValue = useTransform(springValue, (latest) =>
    Math.floor(latest).toLocaleString("en-US")
  );

  useEffect(() => {
    if (active) {
      motionValue.set(value);
    } else {
      motionValue.set(0);
    }
  }, [active, value, motionValue]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest);
      }
    });
    return () => unsubscribe();
  }, [displayValue]);

  return <span ref={ref}>0</span>;
}
