"use client";

/**
 * CJ2026 云逛展陪伴团 — 支付宝手动确认页
 * 用户扫码付款后，填邮箱+支付宝交易号提交，管理员后台确认后解锁
 */
import { useState } from "react";
import { db } from "@/lib/supabase/client";
import { getPrice, setLocalAccess } from "@/lib/cj2026-utils";
import { ArrowLeft, Mail, Hash, CheckCircle, AlertCircle } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

export default function Cj2026AlipayPage() {
  const price = getPrice();
  const [email, setEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    if (!transactionId.trim()) {
      setError("请输入支付宝交易号（可在支付宝账单中查看）");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await db.from("cj2026_purchases").insert({
      email: email.trim().toLowerCase(),
      amount: price.amount,
      payment_method: "alipay",
      status: "pending",
      alipay_transaction_id: transactionId.trim(),
    });

    if (insertError) {
      setError("提交失败，请稍后重试");
      setSubmitting(false);
      return;
    }

    // 本地先写入解锁（pending 状态也先用着，后续真正确认后才持久有效）
    setLocalAccess({
      email: email.trim().toLowerCase(),
      unlockedAt: new Date().toISOString(),
      paymentMethod: "alipay",
    });
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="pt-20 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5A623]/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#F5A623]" />
          </div>
          <h1 className="text-3xl font-black text-[#F1F5F9] mb-3">提交成功！</h1>
          <p className="text-[#94A3B8] mb-2">
            订单状态：<span className="text-[#F5A623] font-semibold">待人工审核</span>
          </p>
          <p className="text-sm text-[#64748B] mb-8">
            我们将在 24 小时内核对交易号，确认后自动开通。如需加速，请联系客服。
          </p>
          <LinkNoPrefetch
            href="/cj2026/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> 返回 CJ2026 页面
          </LinkNoPrefetch>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-lg mx-auto px-4">
        {/* 返回 */}
        <LinkNoPrefetch
          href="/cj2026/"
          className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回 CJ2026
        </LinkNoPrefetch>

        <h1 className="text-2xl font-black text-[#F1F5F9] mb-3">支付宝付款</h1>
        <p className="text-sm text-[#94A3B8] mb-6">
          云逛展陪伴团 · {price.label} · ¥{price.amount}
        </p>

        {/* 收款码区 */}
        <div className="glass-card p-6 mb-6 text-center">
          <p className="text-sm text-[#94A3B8] mb-4">请使用支付宝扫描以下二维码付款</p>
          <div className="w-48 h-48 mx-auto mb-4 bg-[#1E293B]/40 rounded-xl border border-dashed border-[#F5A623]/20 flex items-center justify-center">
            <span className="text-xs text-[#64748B]">
              [支付宝收款码]
              <br />
              需手动上传到 public/cj2026/alipay-qrcode.png
            </span>
          </div>
          <div className="text-sm text-[#F1F5F9] font-mono bg-[#1E293B]/40 rounded-lg py-2 px-4 inline-block">
            账号：待配置
          </div>
          <p className="text-xs text-[#64748B] mt-2">
            付款金额：<span className="text-[#F5A623] font-bold">¥{price.amount}</span>
          </p>
        </div>

        {/* 提交表单 */}
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">确认付款信息</h3>

          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">邮箱地址 *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="用于接收解锁通知"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm rounded-lg focus:outline-none focus:border-[#F5A623]/30 placeholder:text-[#475569]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">支付宝交易号 *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="20260725XXXXXXXXXXXX"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm rounded-lg focus:outline-none focus:border-[#F5A623]/30 placeholder:text-[#475569]"
              />
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              在支付宝 App → 账单 → 点击该笔付款查看交易号
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-[#E94560]/10 border border-[#E94560]/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-[#E94560] shrink-0 mt-0.5" />
              <p className="text-sm text-[#E94560]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "提交中..." : "已完成付款，提交确认"}
          </button>
        </form>
      </div>
    </div>
  );
}
