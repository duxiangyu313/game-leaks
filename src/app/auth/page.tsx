"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="pt-20 pb-20">
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold text-[#F1F5F9] text-center mb-2">
            {mode === "login" ? "欢迎回来" : "创建账号"}
          </h2>
          <p className="text-sm text-[#94A3B8] text-center mb-8">
            {mode === "login" ? "登录你的国游爆料账号" : "加入国产3A游戏爱好者社区"}
          </p>

          {/* Social login buttons */}
          <div className="flex gap-3 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#07C160]/10 border border-[#07C160]/20 text-[#07C160] text-sm font-medium hover:bg-[#07C160]/20 transition-all">
              <MessageCircle className="w-4 h-4" /> 微信登录
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1E293B]/60 border border-[rgba(30,41,59,0.6)] text-[#94A3B8] text-sm font-medium hover:text-[#F1F5F9] hover:border-[#06B6D4]/20 transition-all">
              <Mail className="w-4 h-4" /> 邮箱登录
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[rgba(30,41,59,0.6)]" /></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-[#64748B] bg-[#0F172A]">或使用邮箱</span>
            </div>
          </div>

          {/* Email form */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">邮箱</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40 focus:shadow-[0_0_16px_rgba(6,182,212,0.1)] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40 focus:shadow-[0_0_16px_rgba(6,182,212,0.1)] transition-all pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div>
                <label className="block text-sm text-[#94A3B8] mb-1.5">用户名</label>
                <input
                  type="text"
                  placeholder="你的昵称"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40 focus:shadow-[0_0_16px_rgba(6,182,212,0.1)] transition-all"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all"
            >
              {mode === "login" ? "登录" : "注册"}
            </button>
          </form>

          <p className="text-sm text-[#64748B] text-center mt-6">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="ml-1 text-[#06B6D4] hover:text-[#22D3EE] font-medium"
            >
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
