"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 捕获邀请码 ?ref=XXX，存入 localStorage，注册页默认切到注册模式
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) { localStorage.setItem("gylb_ref", ref); setMode("register"); }
    } catch {}
  }, []);

  // 登录成功后应用邀请码（幂等，仅注册7天内新账号生效）
  const applyPendingReferral = async () => {
    try {
      const ref = localStorage.getItem("gylb_ref");
      if (!ref) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)("apply_referral", { ref_code: ref });
      localStorage.removeItem("gylb_ref");
    } catch {}
  };

  // 登录成功后直接调 Edge Function 发通知（数据库触发器的 pg_net 不可靠）
  const notifyAdmin = async (username: string) => {
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) return;
      await fetch('https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/admin-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + anonKey },
        body: JSON.stringify({
          secret: 'admin-notify-wh-20260718',
          type: mode === 'register' ? 'user_signup' : 'user_login',
          title: mode === 'register' ? '新用户注册：' + username : '用户登录：' + username,
          body: (mode === 'register' ? '注册' : '登录') + '账号：' + username + '\n时间：' + new Date().toLocaleString('zh-CN'),
          timestamp: new Date().toISOString(),
          link: 'https://news.guoyouwenduji.cc/admin/users'
        })
      });
    } catch {}
  };

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
        // 标准 Supabase 注册
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: email.split("@")[0] } },
        });
        if (signUpErr) throw new Error(signUpErr.message || "注册失败");
        // 注册后自动登录
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) {
          // 可能需要邮箱验证
          setMode("login");
          throw new Error("注册成功！请查收验证邮件后登录（如未收到可直接尝试登录）。");
        }
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw new Error(e.message === "Invalid login credentials" ? "邮箱或密码错误" : e.message);
      }
      await applyPendingReferral();
      await notifyAdmin(email.split('@')[0]);
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
