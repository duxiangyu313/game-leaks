"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  animDuration: number;
  animDelay: number;
  driftY: number;
}

export default function CyberParticles({ count = 15 }: { count?: number }) {
  // 统一初始 null → 避免 SSR/客户端 HTML 不一致（React #418）
  const [ready, setReady] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 移动端不渲染粒子
    if (window.innerWidth < 768) return;

    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 3,
        animDuration: 8 + Math.random() * 12,
        animDelay: Math.random() * 10,
        driftY: -30 + Math.random() * 60,
      });
    }
    setParticles(arr);
    setReady(true);
  }, [count]);

  if (!ready || particles.length === 0) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ contain: "strict" }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-drift"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: "rgba(6, 182, 212, 0.5)",
            boxShadow: `0 0 ${p.size * 2}px rgba(6,182,212,0.6)`,
            animationDuration: `${p.animDuration}s`,
            animationDelay: `${p.animDelay}s`,
            ["--drift-y" as string]: `${p.driftY}px`,
          }}
        />
      ))}
    </div>
  );
}
