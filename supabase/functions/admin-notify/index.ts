/**
 * 管理员实时通知 — 新注册/登录/帖子/投稿时向管理员邮箱发送通知
 *
 * 触发方式：数据库触发器 (pg_net.http_post)
 * 管理员邮箱：1852779947@qq.com → QQ邮箱→微信推送
 *
 * 环境变量（在 Supabase Dashboard 设置）：
 *   RESEND_API_KEY — Resend API key
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API = "https://api.resend.com/emails";
const ADMIN_EMAIL = "1852779947@qq.com";
// 优先用环境变量，否则用 Resend 测试发件人（无需域名验证，不会被静默丢弃）
const FROM = Deno.env.get("NOTIFY_FROM") || "国游温度计 <onboarding@resend.dev>";
const WEBHOOK_SECRET = "admin-notify-wh-20260718";

interface NotifyPayload {
  type: "user_signup" | "user_login" | "forum_post" | "ugc_submission" | "custom";
  title: string;
  body: string;
  timestamp?: string;
  link?: string;
  secret?: string;
  custom_html?: string;  // 如果提供，直接作为邮件 HTML 正文，忽略模板
}

const EMOJI: Record<string, string> = {
  user_signup: "🆕",
  user_login: "👤",
  forum_post: "💬",
  ugc_submission: "✍️",
};

const SITE = "https://news.guoyouwenduji.cc";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const payload: NotifyPayload = await req.json();
    if (payload.secret !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Invalid webhook secret" }), {
        status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    if (!payload.type || !payload.title) {
      return new Response(JSON.stringify({ error: "type and title required" }), {
        status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const emoji = EMOJI[payload.type] || "📢";
    const subject = `${emoji} ${payload.title}`;
    const time = payload.timestamp ? new Date(payload.timestamp).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "";
    const link = payload.link || SITE;

    // 如果提供了 custom_html，直接使用；否则使用默认通知模板
    const html = payload.custom_html || `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#080A0D;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:24px 16px">
    <div style="text-align:center;margin-bottom:20px">
      <span style="font-size:24px">🌡️</span>
      <h2 style="font-size:16px;margin:6px 0 0;color:#F5A623">国游温度计 · 实时监控</h2>
    </div>
    <div style="background:#111318;border-radius:10px;padding:20px;border:1px solid rgba(245,166,35,0.15)">
      <p style="font-size:14px;color:#94A3B8;margin:0 0 6px">${payload.body}</p>
      ${time ? `<p style="font-size:12px;color:#475569;margin:0 0 12px">${time}</p>` : ""}
      <a href="${link}" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#F5A623,#D4891A);color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">
        打开管理后台 →
      </a>
    </div>
    <div style="text-align:center;margin-top:16px">
      <p style="font-size:10px;color:#334155;margin:0">国游温度计 · 管理员通知系统</p>
      <p style="font-size:10px;color:#334155;margin:2px 0 0">此邮件由数据库触发器自动发送，无需回复</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ from: FROM, to: [ADMIN_EMAIL], subject, html }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[admin-notify] Resend error:", errText);
      return new Response(JSON.stringify({ sent: false, error: errText.slice(0, 200) }), {
        status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const result = await res.json();
    console.log(`[admin-notify] ${payload.type}: ${payload.title} → sent to ${ADMIN_EMAIL}`);

    return new Response(JSON.stringify({ sent: true, id: (result as any)?.id }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err: any) {
    console.error("[admin-notify]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
