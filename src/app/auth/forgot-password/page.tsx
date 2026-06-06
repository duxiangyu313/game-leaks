"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

/**
 * 忘记密码页面
 *
 * 用户输入注册邮箱，系统发送密码重置链接。
 * 需要在 Supabase 控制台配置 Email Template（见文件末尾注释）。
 *
 * @see https://news.guoyouwenduji.cc/auth/forgot-password
 */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  /** 校验邮箱格式 */
  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  /** 发送密码重置邮件 */
  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 客户端表单验证
    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }
    if (!validateEmail(email.trim())) {
      setError("邮箱格式不正确，请检查后重试");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (resetError) {
        // 映射常见错误到中文提示
        if (resetError.message?.includes("rate limit") || resetError.message?.includes("too many")) {
          setError("发送过于频繁，请稍后再试");
        } else if (resetError.message?.includes("not found") || resetError.message?.includes("user not found")) {
          // Supabase 默认不暴露用户是否存在，但以防万一
          setError("该邮箱未注册，请检查后重试");
        } else {
          setError(resetError.message || "发送失败，请稍后重试");
        }
        setLoading(false);
        return;
      }

      // 发送成功
      setSent(true);
      setLoading(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "网络错误，请检查网络连接后重试";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "#0F172A",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* 卡片 */}
        <div
          style={{
            background: "rgba(30,41,59,0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(30,41,59,0.8)",
            borderRadius: 12,
            padding: 32,
          }}
        >
          {/* 图标 */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #06B6D4, #0891B2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Mail style={{ width: 24, height: 24, color: "white" }} />
          </div>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#F1F5F9",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            忘记密码
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94A3B8",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            {sent
              ? "重置链接已发送，请查收邮件"
              : "输入注册邮箱，我们将发送重置链接"}
          </p>

          {sent ? (
            /* ====== 发送成功状态 ====== */
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  marginBottom: 24,
                }}
              >
                <CheckCircle2
                  style={{
                    width: 40,
                    height: 40,
                    color: "#22C55E",
                    margin: "0 auto 12px",
                  }}
                />
                <p style={{ color: "#22C55E", fontSize: 14, margin: 0 }}>
                  重置链接已发送到您的邮箱，请查收
                </p>
                <p
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  如果未收到邮件，请检查垃圾邮件文件夹
                </p>
              </div>

              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  background: "transparent",
                  color: "#06B6D4",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "1px solid rgba(6,182,212,0.3)",
                  cursor: "pointer",
                  marginBottom: 16,
                  transition: "all 0.2s",
                }}
              >
                重新发送
              </button>

              <Link
                href="/auth"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#64748B",
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
                返回登录
              </Link>
            </div>
          ) : (
            /* ====== 邮箱输入表单 ====== */
            <form onSubmit={handleSendReset}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#94A3B8",
                    marginBottom: 6,
                  }}
                >
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "rgba(30,41,59,0.4)",
                    border: "1px solid rgba(30,41,59,0.6)",
                    color: "#F1F5F9",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(30,41,59,0.6)";
                  }}
                />
              </div>

              {/* 错误提示 */}
              {error && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#EF4444",
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  background: loading ? "#0891B2" : "#06B6D4",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                {loading && (
                  <Loader2
                    style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }}
                  />
                )}
                {loading ? "发送中..." : "发送重置链接"}
              </button>

              {/* 返回登录 */}
              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Link
                  href="/auth"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#64748B",
                    fontSize: 14,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  <ArrowLeft style={{ width: 16, height: 16 }} />
                  返回登录
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* 底部说明 */}
        <p
          style={{
            color: "#475569",
            fontSize: 12,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          国游温度计 · 国游爆料
        </p>
      </div>

      {/* 全局注入旋转动画（inline styles 无法定义 keyframes） */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />
    </div>
  );
}

/*
 * ============================================================
 * Supabase 控制台配置说明
 * ============================================================
 *
 * 1. 进入 Supabase 项目控制台 → Authentication → Email Templates
 * 2. 找到 "Reset Password" 模板
 * 3. 确认模板中的重定向链接格式为：
 *    {{ .SiteURL }}/auth/reset-password
 *    （不要手动拼接 ?token= 参数，Supabase 会自动处理 PKCE 流程）
 * 4. 保存模板
 *
 * ============================================================
 */
