"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, ArrowRight, Clock } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";

export default function FreeTrialBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 已登录用户不显示
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) return;
      // 检查是否在24小时内关闭过
      const ts = localStorage.getItem("trial_banner_dismissed");
      if (ts && Date.now() - parseInt(ts) < 86400000) return;
      // 延迟1秒出现
      setTimeout(() => setVisible(true), 1000);
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("trial_banner_dismissed", String(Date.now()));
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
        >
          <div className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] rounded-2xl p-4 shadow-[0_8px_32px_rgba(245,158,11,0.3)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-white" />
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
              立即体验 <ArrowRight className="w-3 h-3" />
            </LinkNoPrefetch>
            <button onClick={dismiss} className="shrink-0 p-1 text-[#0F172A]/50 hover:text-[#0F172A]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
