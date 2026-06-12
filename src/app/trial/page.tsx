"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Crown, Check, Loader2, ArrowRight } from "lucide-react";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";

export default function TrialPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"form" | "loading" | "done" | "error">("form");
  const [error, setError] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("请填写邮箱和密码"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    setStep("loading");

    // 注册
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr || !data.user) {
      setError(signUpErr?.message || "注册失败");
      setStep("error");
      return;
    }

    // 设为3天白银试用
    const trialEnd = new Date(Date.now() + 3 * 86400000).toISOString();
    const { error: updateErr } = await supabase.from("profiles").upsert({
      id: data.user.id,
      membership: "gold",
      subscription_status: "trialing",
      subscription_end_date: trialEnd,
    }, { onConflict: "id" });

    if (updateErr) {
      setError(updateErr.message);
      setStep("error");
      return;
    }

    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#10B981]" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">试用已开启！</h1>
          <p className="text-[#94A3B8] mb-2">你已获得 3 天白银会员权限</p>
          <p className="text-xs text-[#64748B] mb-8">可阅读所有深度分析文章，到期后自动恢复免费账户</p>
          <LinkNoPrefetch href="/analysis" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl">
            开始阅读 <ArrowRight className="w-4 h-4" />
          </LinkNoPrefetch>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center">
      <div className="max-w-md mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] mb-2">免费试用 3 天白银会员</h1>
          <p className="text-[#94A3B8] text-sm">注册即解锁全部深度分析文章，无需绑定支付方式</p>
        </motion.div>

        <div className="glass-card p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#F1F5F9] mb-3">白银会员包含：</h3>
          <ul className="space-y-2 text-sm text-[#94A3B8]">
            {["所有深度分析文章完整阅读", "高清游戏截图与概念图下载", "开发进度追踪与行业报告", "3天到期自动恢复，无需取消"].map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />{f}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleStart} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱地址" required className="w-full px-4 py-3 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#F59E0B]" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="设置密码（至少6位）" required minLength={6} className="w-full px-4 py-3 bg-[#0F172A] border border-[rgba(30,41,59,0.8)] rounded-xl text-sm text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#F59E0B]" />

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <button type="submit" disabled={step === "loading"} className="w-full py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl hover:shadow-[0_0_24px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {step === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            {step === "loading" ? "开通中…" : "免费试用 3 天"}
          </button>
        </form>

        <p className="text-center text-xs text-[#475569] mt-4">
          已有账号？<LinkNoPrefetch href="/auth" className="text-[#06B6D4] hover:underline">登录</LinkNoPrefetch>
        </p>
      </div>
    </div>
  );
}
