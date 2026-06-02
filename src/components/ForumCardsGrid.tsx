"use client";

import { useEffect, useRef } from "react";

/**
 * 论坛板块卡片网格 — 处理滚动渐进提亮
 * 卡片滚入视口时缓慢提亮背景，滚出时缓慢复原
 */
export default function ForumCardsGrid({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>(".forum-card-scroll-glow");
    if (cards.length === 0) return;

    // 为每张卡片创建 IntersectionObserver，根据可见比例调整亮度
    const observers: IntersectionObserver[] = [];

    cards.forEach((card) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // ratio: 0(完全不可见) ~ 1(完全可见)
            const ratio = entry.intersectionRatio;
            // 亮度提升范围: 0 ~ 0.08（微妙提亮，不刺眼）
            const brightnessBoost = ratio * 0.08;
            card.style.backgroundColor = `rgba(30, 41, 59, ${0.5 + brightnessBoost})`;
            // 阴影也跟随微调
            if (ratio > 0.1) {
              card.style.boxShadow = `0 0 ${30 * ratio}px rgba(6,182,212,${0.08 * ratio}), 0 8px 32px rgba(0,0,0,${0.3 * ratio})`;
            }
          });
        },
        {
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: "-20px 0px -20px 0px",
        }
      );
      observer.observe(card);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return <div ref={gridRef}>{children}</div>;
}
