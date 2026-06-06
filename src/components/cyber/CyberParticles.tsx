"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function CyberParticles({ count = 50 }: { count?: number }) {
  // lazy init: SSR 默认 true，客户端判断实际宽度
  const [isDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  // 粒子数据一次性生成，useEffect 是故意的（仅在 count 变化时重新生成）
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 10,
        drift: -30 + Math.random() * 60,
      });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 一次性初始化，不产生级联渲染
    setParticles(arr);
  }, [count]);

  if (!isDesktop || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: "rgba(6, 182, 212, 0.5)",
            boxShadow: `0 0 ${p.size * 2}px rgba(6,182,212,0.6)`,
          }}
          animate={{
            y: [0, p.drift, 0],
            x: [0, p.drift * 0.3, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
