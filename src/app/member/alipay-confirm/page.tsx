"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Phone } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { supabase } from "@/lib/supabase/client";

const PRICES: Record<string, Record<string, number>> = {
  gold: { monthly: 29, yearly: 299 },
  diamond: { monthly: 89, yearly: 899 },
};

export default function AlipayConfirmPage() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("gold");
  const [cycle, setCycle] = useState("yearly");
  const [txnId, setTxnId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const amount = PRICES[tier]?.[cycle] || 299;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !txnId.trim()) {
      setError("请填写邮箱和支付宝交易号");
      return;
    }
    setSubmitting(true);
    setError("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from as any)("payment_confirmations").insert({
      user_email: email.trim(),
      alipay_txn: txnId.trim(),
      tier,
      cycle,
      amount,
      notes: notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message || "提交失败，请稍后重试");
      setSubmitting(false);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="pt-20 pb-20 min-h-screen">
      <div className="max-w-lg mx-auto px-4">
        <LinkNoPrefetch href="/member" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#F1F5F9] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回会员页
        </LinkNoPrefetch>

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#10B981]" />
            </div>
            <h1 className="text-2xl font-bold text-[#F1F5F9] mb-3">提交成功！</h1>
            <p className="text-[#94A3B8] mb-6">
              我们会在 <strong className="text-[#F1F5F9]">24 小时内</strong>核实付款并开通会员。<br />
              开通后会发送邮件通知到 <strong className="text-[#06B6D4]">{email}</strong>。
            </p>
            <div className="p-4 bg-[#0F172A] rounded-xl text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#64748B]">方案</span><span className="text-[#F1F5F9]">{tier === "gold" ? "黄金会员" : "钻石会员"} · {cycle === "yearly" ? "年付" : "月付"}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">金额</span><span className="text-[#F59E0B] font-bold">¥{amount}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">交易号</span><span className="text-[#F1F5F9] font-mono text-xs">{txnId}</span></div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">确认付款信息</h1>
            <p className="text-sm text-[#64748B] mb-8">
              付款完成后填写以下信息，我们核实后立即开通会员
            </p>

            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
              {/* 邮箱 */}
              <div>
                <label className="block text-sm text-[#94A3B8] mb-1.5">注册邮箱 <span className="text-[#EF4444]">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] placeholder-[#475569] outline-none focus:border-[#06B6D4] transition-all"
                  required
                />
                <p className="text-xs text-[#475569] mt-1">请使用你在国游爆料注册的邮箱</p>
              </div>

              {/* 方案选择 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1.5">会员等级</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] outline-none focus:border-[#06B6D4] transition-all">
                    <option value="gold">黄金会员</option>
                    <option value="diamond">钻石会员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-1.5">付费周期</label>
                  <select value={cycle} onChange={(e) => setCycle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] outline-none focus:border-[#06B6D4] transition-all">
                    <option value="yearly">年付 (¥{PRICES[tier].yearly})</option>
                    <option value="monthly">月付 (¥{PRICES[tier].monthly})</option>
                  </select>
                </div>
              </div>

              {/* 金额显示 */}
              <div className="bg-[#0F172A] rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-[#94A3B8]">应付金额</span>
                <span className="text-xl font-bold text-[#F59E0B]">¥{amount}</span>
              </div>

              {/* 支付宝交易号 */}
              <div>
                <label className="block text-sm text-[#94A3B8] mb-1.5">支付宝交易号 <span className="text-[#EF4444]">*</span></label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="支付宝账单中的 28 位交易号"
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] placeholder-[#475569] outline-none focus:border-[#06B6D4] transition-all font-mono"
                  required
                />
                <p className="text-xs text-[#475569] mt-1">打开支付宝 → 账单 → 找到这笔付款 → 复制交易号</p>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm text-[#94A3B8] mb-1.5">备注（选填）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="如有额外说明可填在这里"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] placeholder-[#475569] outline-none focus:border-[#06B6D4] transition-all resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl text-sm text-[#EF4444]">{error}</div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-[#1677FF] to-[#0958D9] text-white font-semibold rounded-xl hover:shadow-[0_0_28px_rgba(22,119,255,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {submitting ? "提交中..." : "提交付款确认"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
