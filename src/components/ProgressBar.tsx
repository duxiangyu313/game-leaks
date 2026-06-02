"use client";

import { useEffect, useState } from "react";

/** 阅读进度条 — 页面顶部细线 */
export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px]">
      <div
        className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
