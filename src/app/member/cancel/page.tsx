"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="pt-20 pb-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-[#F59E0B]/15 flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-[#F59E0B]" />
        </motion.div>
        <h1 className="text-3xl font-black text-[#F1F5F9] mb-3">支付已取消</h1>
        <p className="text-[#94A3B8] mb-8">没有产生任何扣费。如有问题请随时联系客服。</p>
        <Link
          href="/member"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
        >
          返回会员页 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
