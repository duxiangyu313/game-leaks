"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

/**
 * 重置密码页面
 *
 * 用户从邮件中的重置链接跳转到此页面。
 * Supabase 自动从 URL hash 中提取 token 并建立会话，
 * 用户只需输入新密码即可完成重置。
 *
 * @see https://news.guoyouwenduji.cc/auth/reset-password
 */

/** 密码强度等级 */
type PasswordStrength = "weak" | "medium" | "strong";

/** 密码强度校验规则 */
interface PasswordValidation {
  minLength: boolean;    // ≥ 8 位
  hasUpper: boolean;     // 包含大写字母
  hasLower: boolean;     // 包含小写字母
  hasNumber: boolean;    // 包含数字
}

export default function ResetPasswordPage() {
  const router = useRouter();

  // 会话状态
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  // 密码表单
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * 密码强度校验
   *
   * 规则：
   * - 至少 8 位字符
   * - 至少包含一个大写字母
   * - 至少包含一个小写字母
   * - 至少包含一个数字
   */
  const validatePassword = useCallback((pwd: string): PasswordValidation => {
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    };
  }, []);

  /** 计算密码强度等级 */
  const getPasswordStrength = useCallback((validation: PasswordValidation): PasswordStrength => {
    const score = [validation.minLength, validation.hasUpper, validation.hasLower, validation.hasNumber].filter(Boolean).length;
    if (score <= 2) return "weak";
    if (score === 3) return "medium";
    return "strong";
  }, []);

  const passwordValidation = validatePassword(password);
  const passwordStrength = getPasswordStrength(passwordValidation);

  /** 密码强度对应的颜色和文字 */
  const strengthConfig: Record<PasswordStrength, { color: string; label: string; width: string }> = {
    weak: { color: "#EF4444", label: "弱", width: "33%" },
    medium: { color: "#F59E0B", label: "中等", width: "66%" },
    strong: { color: "#22C55E", label: "强", width: "100%" },
  };

  /**
   * 页面加载时检查会话
   *
   * Supabase 会自动从 URL hash 中提取 access_token 并建立会话。
   * 如果 hash 中有 type=recovery，说明来自重置密码邮件。
   * 我们需要等待 Supabase 处理完 hash 后再检查。
   */
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        // 先等待 Supabase 处理 URL hash（PKCE 流程）
        // getSession 会触发 Supabase 解析 hash 中的 token
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (cancelled) return;

        if (sessionError) {
          if (process.env.NODE_ENV === "development") console.error("Session check error:", sessionError);
          setSessionError("重置链接无效或已过期，请重新申请重置密码");
          setCheckingSession(false);
          return;
        }

        if (!sessionData.session) {
          // 没有 session — 可能是直接访问页面，或 token 已过期
          // 检查 URL hash 是否还有未处理的 token
          const hash = window.location.hash;
          if (hash && hash.includes("type=recovery")) {
            // hash 还在，可能是 Supabase 还没处理完
            // 等待 auth state change
            const { data: authListener } = supabase.auth.onAuthStateChange(
              (event, session) => {
                if (cancelled) return;
                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                  if (session) {
                    setCheckingSession(false);
                    authListener.subscription.unsubscribe();
                  }
                }
                if (event === "INITIAL_SESSION" && !session) {
                  setSessionError("重置链接无效或已过期，请重新申请重置密码");
                  setCheckingSession(false);
                  authListener.subscription.unsubscribe();
                }
              }
            );

            // 设置超时，防止永久等待
            const timeout = setTimeout(() => {
              if (cancelled) return;
              authListener.subscription.unsubscribe();
              setSessionError("验证超时，请重新申请重置密码");
              setCheckingSession(false);
            }, 10000);

            return () => {
              cancelled = true;
              clearTimeout(timeout);
              authListener.subscription.unsubscribe();
            };
          } else {
            setSessionError("无效的访问，请通过邮件中的重置链接访问此页面");
            setCheckingSession(false);
            return;
          }
        }

        // 有 session，说明 token 验证成功
        setCheckingSession(false);
      } catch {
        if (!cancelled) {
          setSessionError("网络错误，请检查网络连接后重试");
          setCheckingSession(false);
        }
      }
    };

    checkSession();
    return () => { cancelled = true; };
  }, []);

  /** 提交重置密码 */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 客户端表单验证
    if (!password) {
      setError("请输入新密码");
      return;
    }

    // 密码强度检查
    const validation = validatePassword(password);
    const failedRules: string[] = [];
    if (!validation.minLength) failedRules.push("至少 8 位字符");
    if (!validation.hasUpper) failedRules.push("至少包含一个大写字母");
    if (!validation.hasLower) failedRules.push("至少包含一个小写字母");
    if (!validation.hasNumber) failedRules.push("至少包含一个数字");

    if (failedRules.length > 0) {
      setError(`密码强度不足：${failedRules.join("、")}`);
      return;
    }

    // 确认密码一致性
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        if (updateError.message?.includes("weak") || updateError.message?.includes("strength")) {
          setError("密码强度不足，请使用更强的密码（至少8位，包含大小写字母和数字）");
        } else if (updateError.message?.includes("same")) {
          setError("新密码不能与旧密码相同");
        } else if (updateError.message?.includes("expired") || updateError.message?.includes("token")) {
          setError("重置链接已过期，请重新申请重置密码");
        } else {
          setError(updateError.message || "重置失败，请稍后重试");
        }
        setLoading(false);
        return;
      }

      // 重置成功
      setSuccess(true);
      setLoading(false);

      // 3 秒后跳转到登录页
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "网络错误，请检查网络连接后重试";
      setError(message);
      setLoading(false);
    }
  };

  // ========== 加载中状态：检查会话 ==========
  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Loader2
            style={{
              width: 32,
              height: 32,
              color: "#06B6D4",
              animation: "spin 1s linear infinite",
              marginBottom: 16,
            }}
          />
          <p style={{ color: "#94A3B8", fontSize: 14 }}>正在验证重置链接...</p>
        </div>
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

  // ========== 会话无效 ==========
  if (sessionError) {
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
          <div
            style={{
              background: "rgba(30,41,59,0.5)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(30,41,59,0.8)",
              borderRadius: 12,
              padding: 32,
              textAlign: "center",
            }}
          >
            <AlertTriangle
              style={{ width: 48, height: 48, color: "#F59E0B", margin: "0 auto 16px" }}
            />
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#F1F5F9",
                marginBottom: 12,
              }}
            >
              链接无效
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 24 }}>
              {sessionError}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => router.push("/auth")}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  background: "#06B6D4",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                返回登录
              </button>
              <button
                onClick={() => router.push("/auth/forgot-password")}
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
                }}
              >
                重新申请重置密码
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== 重置表单 ==========
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
            <Lock style={{ width: 24, height: 24, color: "white" }} />
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
            重置密码
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#94A3B8",
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            {success ? "密码重置成功" : "请输入您的新密码"}
          </p>

          {success ? (
            /* ====== 重置成功 ====== */
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
                  密码重置成功，正在跳转到登录页面...
                </p>
              </div>
            </div>
          ) : (
            /* ====== 密码输入表单 ====== */
            <form onSubmit={handleResetPassword}>
              {/* 新密码 */}
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#94A3B8",
                    marginBottom: 6,
                  }}
                >
                  新密码
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="至少 8 位，含大小写字母和数字"
                    style={{
                      width: "100%",
                      padding: "10px 44px 10px 16px",
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748B",
                      padding: 4,
                      display: "flex",
                    }}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: 18, height: 18 }} />
                    ) : (
                      <Eye style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              {/* 密码强度指示器 */}
              {password.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {/* 强度条 */}
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      background: "rgba(30,41,59,0.6)",
                      marginBottom: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: strengthConfig[passwordStrength].width,
                        background: strengthConfig[passwordStrength].color,
                        borderRadius: 2,
                        transition: "width 0.3s, background 0.3s",
                      }}
                    />
                  </div>
                  {/* 强度文字 + 规则明细 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: strengthConfig[passwordStrength].color,
                        fontWeight: 600,
                      }}
                    >
                      密码强度：{strengthConfig[passwordStrength].label}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    <RuleCheck passed={passwordValidation.minLength} label="至少 8 位字符" />
                    <RuleCheck passed={passwordValidation.hasUpper} label="包含大写字母 (A-Z)" />
                    <RuleCheck passed={passwordValidation.hasLower} label="包含小写字母 (a-z)" />
                    <RuleCheck passed={passwordValidation.hasNumber} label="包含数字 (0-9)" />
                  </div>
                </div>
              )}

              {/* 确认密码 */}
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#94A3B8",
                    marginBottom: 6,
                  }}
                >
                  确认新密码
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="再次输入新密码"
                    style={{
                      width: "100%",
                      padding: "10px 44px 10px 16px",
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
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748B",
                      padding: 4,
                      display: "flex",
                    }}
                    aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff style={{ width: 18, height: 18 }} />
                    ) : (
                      <Eye style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                </div>
                {/* 密码不一致提示 */}
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ color: "#EF4444", fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                    两次输入的密码不一致
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p style={{ color: "#22C55E", fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                    密码一致 ✓
                  </p>
                )}
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
                {loading ? "重置中..." : "重置密码"}
              </button>
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

      {/* 全局注入旋转动画 */}
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

/** 密码规则逐条校验组件 */
function RuleCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          background: passed ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
          color: passed ? "#22C55E" : "#EF4444",
          transition: "all 0.2s",
          flexShrink: 0,
        }}
      >
        {passed ? "✓" : "✗"}
      </span>
      <span
        style={{
          fontSize: 12,
          color: passed ? "#22C55E" : "#64748B",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
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
 * 同时确保 Authentication → URL Configuration 中：
 * - Site URL 设置为你的域名（如 https://news.guoyouwenduji.cc）
 * - Redirect URLs 中已添加 "**" 通配符匹配 /auth/reset-password
 *
 * ============================================================
 */
