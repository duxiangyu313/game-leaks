"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("两次输入的密码不一致");
          setLoading(false);
          return;
        }
        // 使用自定义注册（绕过 GoTrue 兼容问题）
        const res = await fetch(
          "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/auth-custom",
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "signup", email, password }) }
        );
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "注册失败");
        // 注册成功，尝试 GoTrue 登录（老用户兼容路径）
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) {
          // GoTrue 登录不兼容新用户 → 提示用户重新从登录页登录
          setMode("login");
          throw new Error("注册成功！GoTrue 兼容问题，请点击登录按钮重新登录。");
        }
      } else {
        // 登录：先尝试 GoTrue（预迁移老用户可行）
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) {
          // GoTrue 登录失败 → 用自定义 Edge Function 验证密码
          const res = await fetch(
            "https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/auth-custom",
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", email, password }) }
          );
          const data = await res.json();
          if (data.success && data.verified) {
            // 密码正确但 GoTrue 无法创建 session → 重试一次（可能已更新 last_sign_in_at）
            const { error: retryErr } = await supabase.auth.signInWithPassword({ email, password });
            if (retryErr) throw new Error("登录失败：认证服务兼容问题，请联系管理员或稍后重试");
          } else {
            throw new Error(data.error || "邮箱或密码错误");
          }
        }
      }
      window.location.href = "/";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 120, paddingBottom: 80 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(30,41,59,0.8)", borderRadius: 12, padding: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9", textAlign: "center", marginBottom: 8 }}>
            {mode === "login" ? "欢迎回来" : "创建账号"}
          </h2>
          <p style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 32 }}>
            {mode === "login" ? "登录国游爆料" : "加入国产3A社区"}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", borderRadius: 12, background: "rgba(30,41,59,0.4)", border: "1px solid rgba(30,41,59,0.6)", color: "#F1F5F9", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="your@email.com" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", borderRadius: 12, background: "rgba(30,41,59,0.4)", border: "1px solid rgba(30,41,59,0.6)", color: "#F1F5F9", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••" />
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>确认密码</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 16px", borderRadius: 12, background: "rgba(30,41,59,0.4)", border: "1px solid rgba(30,41,59,0.6)", color: "#F1F5F9", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                placeholder="••••••••" />
            </div>
          )}

          {error && <div style={{ padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 14, marginBottom: 16 }}>{error}</div>}

          <button onClick={handleAuth} disabled={loading}
            style={{ width: "100%", padding: "12px 0", borderRadius: 12, background: loading ? "#0891B2" : "#06B6D4", color: "white", fontWeight: 600, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>

          {mode === "login" && (
            <p style={{ textAlign: "center", marginTop: 16, marginBottom: 0 }}>
              <a href="/auth/forgot-password"
                style={{ color: "#06B6D4", fontSize: 14, textDecoration: "underline", cursor: "pointer", transition: "color 0.2s" }}>
                忘记密码？
              </a>
            </p>
          )}

          <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginTop: mode === "login" ? 8 : 24 }}>
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: "#06B6D4", cursor: "pointer", fontWeight: 500, marginLeft: 4, background: "none", border: "none", fontSize: 14, padding: 0, textDecoration: "underline" }}>
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
