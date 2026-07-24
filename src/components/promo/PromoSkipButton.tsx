"use client";

import { motion } from "framer-motion";

interface PromoSkipButtonProps {
  onSkip: () => void;
  label?: string;
}

/** 跳过按钮 — 固定右下角，半透明背景 + 青色边框 */
export default function PromoSkipButton({ onSkip, label = "跳过" }: PromoSkipButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onSkip}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border border-cyan-400/60 bg-black/40 px-5 py-2.5 text-sm font-medium text-cyan-300 backdrop-blur-md transition-colors hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100"
      aria-label={label}
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </motion.button>
  );
}
