"use client";

/**
 * CJ2026 云逛展陪伴团 — 支付页面
 * 展示微信/支付宝收款码，用户扫码付款后填邮箱提交，管理员后台确认开通
 */
import { useState } from "react";
import { db } from "@/lib/supabase/client";
import { getPrice, setLocalAccess } from "@/lib/cj2026-utils";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function Cj2026PayPage() {
  const price = getPrice();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址，用于接收开通通知");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await db.from("cj2026_purchases").insert({
      email: email.trim().toLowerCase(),
      amount: price.amount,
      payment_method: "wechat",
      status: "pending",
      notes: `用户自主提交 · ${price.label}`,
    });

    if (insertError) {
      setError("提交失败，请稍后重试");
      setSubmitting(false);
      return;
    }

    setLocalAccess({
      email: email.trim().toLowerCase(),
      unlockedAt: new Date().toISOString(),
      paymentMethod: "wechat",
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="pt-20 pb-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#10B981]" />
          </div>
          <h1 className="text-3xl font-black text-[#F1F5F9] mb-3">提交成功！</h1>
          <p className="text-[#94A3B8] mb-2">我们会在 <span className="text-[#F5A623] font-semibold">24小时内</span> 核对并开通</p>
          <p className="text-sm text-[#64748B] mb-8">开通后会发送通知到你的邮箱：<span className="text-[#F1F5F9]">{email}</span></p>
          <LinkNoPrefetch
            href="/cj2026/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> 返回 CJ2026
          </LinkNoPrefetch>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <LinkNoPrefetch
          href="/cj2026/"
          className="inline-flex items-center gap-1 text-sm text-[#94A3B8] hover:text-[#F1F5F9] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回 CJ2026
        </LinkNoPrefetch>

        <h1 className="text-2xl font-black text-[#F1F5F9] mb-2">
          云逛展陪伴团 · {price.label}
        </h1>
        <p className="text-sm text-[#94A3B8] mb-8">
          扫码付款后填写邮箱，24小时内开通
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 微信 */}
          <div className="glass-card p-6 text-center">
            <div className="text-sm font-bold text-[#10B981] mb-3">微信支付</div>
            <div className="w-48 h-48 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-[#10B981]/30">
              <div className="w-full h-full bg-[#1E293B]/40 flex items-center justify-center text-xs text-[#64748B]">
                请上传微信收款码到<br/>public/cj2026/wechat-pay-qrcode.jpg
              </div>
            </div>
            <div className="text-2xl font-black text-[#F1F5F9]">¥{price.amount}</div>
            <div className="text-xs text-[#64748B] mt-1">{price.label}</div>
          </div>

          {/* 支付宝 */}
          <div className="glass-card p-6 text-center">
            <div className="text-sm font-bold text-[#06B6D4] mb-3">支付宝</div>
            <div className="w-48 h-48 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-[#06B6D4]/30">
              <img
                src="/cj2026/alipay-qrcode.jpg"
                alt="支付宝收款码"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-2xl font-black text-[#F1F5F9]">¥{price.amount}</div>
            <div className="text-xs text-[#64748B] mt-1">{price.label}</div>
          </div>
        </div>

        {/* 提交表单 */}
        <form onSubmit={handleSubmit} className="glass-card p-6 max-w-md mx-auto space-y-4">
          <h3 className="text-lg font-bold text-[#F1F5F9]">付款后请填写邮箱</h3>
          <p className="text-xs text-[#64748B]">用于接收开通通知和找回购买记录</p>

          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">邮箱地址 *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="your@email.com"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm rounded-lg focus:outline-none focus:border-[#F5A623]/30 placeholder:text-[#475569]"
              />
            </div>
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
            className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] text-sm font-bold rounded-xl hover:shadow-[0_0_25px_rgba(245,166,35,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? "提交中..." : (
              <>
                <Send className="w-4 h-4" /> 已完成付款，提交开通
              </>
            )}
          </button>

          <p className="text-[10px] text-[#475569] text-center">
            提交后我们会在 24 小时内核对并开通，请留意邮箱通知
          </p>
        </form>
      </div>
    </div>
  );
}
