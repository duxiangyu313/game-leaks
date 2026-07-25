"use client";

/**
 * CJ2026 支付成功页 — Stripe Payment Link 回调
 * 用户支付后跳转至此，输入邮箱保存购买记录+解锁内容
 */
import { useState } from "react";
import { db } from "@/lib/supabase/client";
import { setLocalAccess, getPrice } from "@/lib/cj2026-utils";
import { CheckCircle, ArrowRight, Mail, Sparkles } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

export default function Cj2026SuccessPage() {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const price = getPrice();

  async function handleSave() {
    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setSaving(true);
    setError("");

    // 写入数据库
    await db.from("cj2026_purchases").insert({
      email: email.trim().toLowerCase(),
      amount: price.amount,
      payment_method: "stripe",
      status: "confirmed",
    });

    // 本地解锁
    setLocalAccess({
      email: email.trim().toLowerCase(),
      unlockedAt: new Date().toISOString(),
      paymentMethod: "stripe",
    });

    setSaved(true);
    setSaving(false);
  }

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        {!saved ? (
          <>
            <div className="w-20 h-20 rounded-full bg-[#10B981]/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#10B981]" />
            </div>
            <h1 className="text-3xl font-black text-[#F1F5F9] mb-3">支付成功！</h1>
            <p className="text-[#94A3B8] mb-6">
              欢迎加入云逛展陪伴团 <Sparkles className="w-4 h-4 inline text-[#F5A623]" />
            </p>

            {/* 邮箱录入 */}
            <div className="glass-card p-6 mb-6 text-left">
              <label className="block text-sm font-bold text-[#F1F5F9] mb-2">
                请输入你支付时使用的邮箱
              </label>
              <p className="text-xs text-[#64748B] mb-4">
                用于保存购买记录，下次访问时自动识别
              </p>
              <div className="relative mb-3">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@email.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm rounded-lg focus:outline-none focus:border-[#F5A623]/30 placeholder:text-[#475569]"
                />
              </div>
              {error && <p className="text-xs text-[#E94560] mb-3">{error}</p>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all disabled:opacity-50"
              >
                {saving ? "保存中..." : "确认并解锁内容"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-[#F5A623]/15 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#F5A623]" />
            </div>
            <h1 className="text-3xl font-black text-[#F1F5F9] mb-3">解锁成功！</h1>
            <p className="text-[#94A3B8] mb-8">
              16款游戏深度评分 · 4天每日速递 · 读者群 已全部解锁
            </p>
            <LinkNoPrefetch
              href="/cj2026/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(245,166,35,0.3)] transition-all"
            >
              进入 CJ2026 专属内容 <ArrowRight className="w-4 h-4" />
            </LinkNoPrefetch>
          </>
        )}
      </div>
    </div>
  );
}
