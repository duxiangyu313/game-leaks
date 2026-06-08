"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function SuccessPage() {
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("session_id") || "";
    }
    return "";
  });

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-[#10B981]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-3xl font-black text-[#F1F5F9] mb-3">支付成功！</h1>
          <p className="text-[#94A3B8] mb-2">恭喜成为国游爆料会员</p>
          <p className="text-sm text-[#64748B] mb-8">你的会员权益已立即生效。订单号：{sessionId?.slice(-12) || "..."}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <LinkNoPrefetch
            href="/leaks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
          >
            查看独家爆料 <ArrowRight className="w-4 h-4" />
          </LinkNoPrefetch>
          <LinkNoPrefetch
            href="/account"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[rgba(30,41,59,0.6)] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl font-semibold transition-all"
          >
            管理会员
          </LinkNoPrefetch>
        </motion.div>
      </div>
    </div>
  );
}
