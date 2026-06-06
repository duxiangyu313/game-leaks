"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  glow?: boolean;       // hover 发光增强
  premium?: boolean;    // 金色边框
}

export default function CyberBorder({ children, className = "", glow = false, premium = false }: Props) {
  const borderColor = premium ? "rgba(245,158,11,0.6)" : "rgba(6,182,212,0.6)";
  const glowColor = premium ? "rgba(245,158,11,0.3)" : "rgba(6,182,212,0.2)";

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={glow ? { boxShadow: `0 0 24px ${glowColor}, inset 0 0 8px ${glowColor}` } : undefined}
      transition={{ duration: 0.3 }}
      style={{
        border: `1px solid ${borderColor}`,
        clipPath: `polygon(
          12px 0%, calc(100% - 12px) 0%,
          100% 12px, 100% calc(100% - 12px),
          calc(100% - 12px) 100%, 12px 100%,
          0% calc(100% - 12px), 0% 12px
        )`,
      }}
    >
      {/* 四角斜切装饰 */}
      <span className="absolute top-0 left-0 w-6 h-[1px] bg-[#06B6D4]/60" />
      <span className="absolute top-0 left-0 w-[1px] h-6 bg-[#06B6D4]/60" />
      <span className="absolute top-0 right-0 w-6 h-[1px] bg-[#06B6D4]/60" />
      <span className="absolute top-0 right-0 w-[1px] h-6 bg-[#06B6D4]/60" />
      <span className="absolute bottom-0 left-0 w-6 h-[1px] bg-[#06B6D4]/60" />
      <span className="absolute bottom-0 left-0 w-[1px] h-6 bg-[#06B6D4]/60" />
      <span className="absolute bottom-0 right-0 w-6 h-[1px] bg-[#06B6D4]/60" />
      <span className="absolute bottom-0 right-0 w-[1px] h-6 bg-[#06B6D4]/60" />
      {children}
    </motion.div>
  );
}
