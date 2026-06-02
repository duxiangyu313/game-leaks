"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * 内容保护组件 — 包裹付费内容
 * 功能: 动态水印 + 禁止右键 + 设备检测
 *
 * 用法: <ContentProtection><div>付费内容</div></ContentProtection>
 */
export default function ContentProtection({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    // 获取用户ID
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.email || data.user?.id?.slice(0, 8) || "unknown");
    });

    // 禁止右键菜单
    const blockContext = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", blockContext);

    // 禁止快捷键
    const blockKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  // 渲染动态水印 Canvas
  useEffect(() => {
    if (!canvasRef.current || !userId) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.font = "14px sans-serif";

      const text = `${userId} | ${new Date().toLocaleString("zh-CN")}`;
      const w = ctx.measureText(text).width + 80;

      for (let y = 40; y < canvas.height; y += 60) {
        for (let x = -w; x < canvas.width + w; x += w) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.3);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
      requestAnimationFrame(render);
    };
    render();
  }, [userId]);

  if (!userId) return <>{children}</>;

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      <div className="relative z-0">{children}</div>
    </div>
  );
}

/**
 * 设备限制 Hook — 检查并限制同时登录设备数
 */
export function useDeviceLimit() {
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fp = navigator.userAgent + "|" + navigator.language;
      await supabase.from("device_sessions").upsert({
        user_id: user.id,
        device_fingerprint: fp.slice(0, 200),
        last_seen: new Date().toISOString(),
      }, { onConflict: "user_id,device_fingerprint" });

      // 检查设备数量
      const { count } = await supabase
        .from("device_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count && count > 2) {
        alert("你的账号已在超过2台设备上登录，请退出其他设备。");
      }
    }
    check();
  }, []);
}
