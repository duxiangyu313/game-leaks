"use client";

import { useEffect } from "react";

/**
 * 密码重置重定向
 *
 * 当用户从重置密码邮件链接进入站点时（URL 包含 type=recovery），
 * 如果当前不在重置密码页面，自动跳转到 /auth/reset-password/。
 * 这样 Supabase 的 PKCE 令牌能被 reset-password 页面正确处理。
 */
export default function RecoveryRedirect() {
  useEffect(() => {
    // 已在重置密码页面，不需要重定向
    if (window.location.pathname.includes("/auth/reset-password")) return;

    const s = window.location.search;
    const h = window.location.hash;
    if (s.includes("type=recovery") || h.includes("type=recovery")) {
      window.location.replace("/auth/reset-password/" + (s || h.replace(/^#/, "?")));
    }
  }, []);
  return null;
}
