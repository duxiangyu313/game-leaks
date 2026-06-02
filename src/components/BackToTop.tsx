"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

/** 回到顶部按钮 — 滚动超过300px时出现在右下角 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-[150] w-11 h-11 rounded-xl bg-[#06B6D4]/90 hover:bg-[#06B6D4] text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center"
      aria-label="回到顶部"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
