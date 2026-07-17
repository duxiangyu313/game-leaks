"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

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
      setError(loginError.message || "登录失败");
      setLoading(false);
      return;
    }

    // 通过数据库 profiles.membership 判定 + 邮箱白名单兜底
    try {
      const admin = await isAdmin();
      if (!admin) {
        await supabase.auth.signOut();
        setError("该账号无管理员权限（需要 diamond 会员或管理员邮箱）");
        setLoading(false);
        return;
      }
    } catch {
      setError("权限验证失败，请重试");
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080A0D", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #F5A623, #E8960F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <Shield style={{ width: 28, height: 28, color: "white" }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", margin: 0 }}>后台管理</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 8 }}>管理员登录</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, color: "#94A3B8", marginBottom: 6 }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#F1F5F9", fontSize: 15, outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, color: "#94A3B8", marginBottom: 6 }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="········"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#F1F5F9", fontSize: 15, outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 14, color: "#EF4444", background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 10, marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 12,
              fontWeight: 600, fontSize: 15, color: "white",
              background: "linear-gradient(135deg, #F5A623, #D4891A)",
              border: "none", cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            {loading && <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />}
            {loading ? "验证中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
