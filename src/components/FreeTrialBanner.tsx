"use client";

import { useState, useEffect } from "react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";

// 内联 SVG，避免 lucide-react 体积
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ArrowIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const CloseIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default function FreeTrialBanner() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) return;
      const ts = localStorage.getItem("trial_banner_dismissed");
      if (ts && Date.now() - parseInt(ts) < 86400000) return;
      setTimeout(() => setVisible(true), 1000);
    });
  }, []);

  const dismiss = () => {
    setExiting(true);
    localStorage.setItem("trial_banner_dismissed", String(Date.now()));
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg transition-all duration-300 ease-out ${
        exiting ? "opacity-0 -translate-y-20" : "opacity-100 translate-y-0"
      }`}
      style={{ animation: !exiting ? "slide-in-banner 0.4s ease-out" : undefined }}
    >
      <div className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] rounded-2xl p-4 shadow-[0_8px_32px_rgba(245,158,11,0.3)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <ClockIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0F172A]">免费试用白银会员 3 天</p>
          <p className="text-xs text-[#0F172A]/70">解锁全部深度分析文章，无需付费</p>
        </div>
        <LinkNoPrefetch
          href="/trial"
          onClick={dismiss}
          className="shrink-0 px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-[#1E293B] transition-colors flex items-center gap-1"
        >
          立即体验 <ArrowIcon />
        </LinkNoPrefetch>
        <button onClick={dismiss} className="shrink-0 p-1 text-[#0F172A]/50 hover:text-[#0F172A]">
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
