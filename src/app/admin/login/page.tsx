"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("登录失败，请检查邮箱和密码");
      setLoading(false);
      return;
    }

    // 检查是否是管理员
    const { data: { session } } = await supabase.auth.getSession();
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(e => e.trim());
    if (!adminEmails.includes(session?.user?.email || "")) {
      await supabase.auth.signOut();
      setError("你没有管理员权限");
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#0891B2] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">后台管理登录</h1>
          <p className="text-sm text-[#64748B] mt-1">仅限管理员访问</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-[#94A3B8] mb-1.5">
              <Mail className="w-3.5 h-3.5" /> 邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-[#94A3B8] mb-1.5">
              <Lock className="w-3.5 h-3.5" /> 密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#1E293B]/40 border border-[rgba(30,41,59,0.6)] text-[#F1F5F9] placeholder-[#64748B] outline-none focus:border-[#06B6D4]/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[#EF4444] bg-[#EF4444]/5 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#06B6D4] to-[#0891B2] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "验证中..." : "登录后台"}
          </button>
        </form>
      </div>
    </div>
  );
}
