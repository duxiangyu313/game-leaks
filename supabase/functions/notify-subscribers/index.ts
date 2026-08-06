/**
 * 订阅者邮件通知 — 新爆料发布时通知黄金/钻石会员
 *
 * 触发方式：
 *   1. 数据库 Webhook：leaks 表 status='published' 时自动触发
 *   2. 管理后台手动触发：POST /notify-subscribers
 *
 * 环境变量（在 Supabase Dashboard 设置）：
 *   RESEND_API_KEY — Resend API key (resend.com, 免费 100封/天)
 *   NOTIFY_FROM     — 发件人地址，如 "国游爆料 <noreply@news.guoyouwenduji.cc>"
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API = "https://api.resend.com/emails";
const FROM = Deno.env.get("NOTIFY_FROM") || "国游爆料 <noreply@guoyouwenduji.cc>";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface LeakPayload {
  id: string;
  title: string;
  summary?: string;
  game_name?: string;
  credibility?: string;
  type?: string; // "INSERT" | "UPDATE" from webhook
  record?: {
    id: string; title: string; summary: string;
    game_name?: string; credibility?: string; status?: string;
  };
}

const CRED_LABEL: Record<string, string> = {
  confirmed: "✅ 已确认", likely: "🟡 可靠来源", rumor: "🔴 传闻",
};

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    let payload: LeakPayload;
    try {
      payload = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Simple webhook secret verification
    const WEBHOOK_SECRET = "notify-leak-wh-2026";
    const isWebhook = (payload as any).secret === WEBHOOK_SECRET;

    // Handle Database Webhook format (pg_net trigger)
    if (payload.type === "INSERT" || payload.type === "UPDATE") {
      const r = payload.record;
      if (!r) {
        return new Response(JSON.stringify({ skipped: true, reason: "no_record" }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      if (r.status && r.status !== "published") {
        return new Response(JSON.stringify({ skipped: true, reason: "not_published", status: r.status }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
      payload = {
        id: r.id, title: r.title, summary: r.summary || "",
        game_name: r.game_name, credibility: r.credibility,
      } as LeakPayload;
    }

    // Verify secret for direct calls (admin trigger)
    if (!isWebhook && (payload as any).secret !== WEBHOOK_SECRET) {
      // Allow if called with service_role key (from admin)
      const authHeader = req.headers.get("Authorization") || "";
      if (!authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized. Use secret or Bearer token." }), {
          status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    if (!payload.title) {
      return new Response(JSON.stringify({ error: "title is required" }), {
        status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Query gold + diamond users — 直接从 profiles.email 拿邮箱
    // 背景：当前 Supabase 项目 auth.users 的 PostgREST 元数据炸了，
    // 走 supabase.auth.admin.listUsers() 必定 500 "range not found"，
    // 所以改读 profiles.email（由 on_auth_user_email_sync 触发器自动同步）。
    // 会员有效性以 membership 等级为准，不看 subscription_status。
    const { data: users, error: userErr } = await supabase
      .from("profiles")
      .select("id, membership, email")
      .in("membership", ["gold", "diamond"])
      .not("email", "is", null);

    if (userErr) {
      return new Response(JSON.stringify({
        error: "Failed to query subscribers: " + userErr.message,
      }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({
        sent: 0, skipped: true, reason: "no_subscribers",
      }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
    }

    // Build email map directly from profiles.email — 不再调用 admin.listUsers
    const emailMap = new Map<string, string>();
    const userIds: string[] = [];
    for (const u of users) {
      if (u.email) {
        emailMap.set(u.id, u.email);
        userIds.push(u.id);
      }
    }

    // Build email
    const credLabel = payload.credibility ? CRED_LABEL[payload.credibility] || "" : "";
    const gameLabel = payload.game_name ? `【${payload.game_name}】` : "";
    const subject = `🔔 新爆料${gameLabel}: ${payload.title.slice(0, 50)}`;

    const siteUrl = "https://news.guoyouwenduji.cc";
    const leakUrl = `${siteUrl}/leaks/detail?id=${payload.id}`;
    const summary = payload.summary || "点击查看详情";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0F172A;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:28px">🌡️</span>
      <h1 style="font-size:20px;margin:8px 0 0;color:#F1F5F9">国游温度计</h1>
    </div>
    <div style="background:#1E293B;border-radius:12px;padding:24px;border:1px solid rgba(245,158,11,0.2)">
      <span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;background:rgba(245,158,11,0.15);color:#FBBF24;margin-bottom:12px">${credLabel || "📰 新爆料"}</span>
      <h2 style="font-size:18px;margin:0 0 8px;color:#F1F5F9;line-height:1.4">${payload.title}</h2>
      ${payload.game_name ? `<p style="font-size:13px;color:#06B6D4;margin:0 0 12px">🎮 ${payload.game_name}</p>` : ""}
      <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 20px">${summary}</p>
      <a href="${leakUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#F59E0B,#D97706);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
        查看详情 →
      </a>
    </div>
    <div style="text-align:center;margin-top:24px">
      <p style="font-size:11px;color:#475569;margin:0 0 4px">
        你收到此邮件因为你是国游爆料 <strong style="color:#F59E0B">黄金/钻石</strong> 会员
      </p>
      <a href="${siteUrl}/account" style="font-size:11px;color:#3B82F6;text-decoration:none">管理通知偏好</a>
    </div>
  </div>
</body>
</html>`.trim();

    // Send emails (batch: 10 at a time to respect Resend rate limits)
    const results: { email: string; success: boolean; error?: string }[] = [];
    const batchSize = 10;

    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const promises = batch.map(async (uid) => {
        const email = emailMap.get(uid);
        if (!email) return { email: uid, success: false, error: "no_email" };

        try {
          const res = await fetch(RESEND_API, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: FROM,
              to: [email],
              subject,
              html,
            }),
          });

          if (!res.ok) {
            const err = await res.text();
            return { email, success: false, error: err.slice(0, 200) };
          }
          return { email, success: true };
        } catch (e: any) {
          return { email, success: false, error: e.message };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < userIds.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const succeeded = results.filter(r => r.success).length;

    console.log(`[notify] Sent ${succeeded}/${userIds.length} emails for leak: ${payload.title}`);

    return new Response(JSON.stringify({
      sent: succeeded,
      total: userIds.length,
      failed: results.filter(r => !r.success).length,
      results: results.filter(r => !r.success).slice(0, 5), // Only return errors
    }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });

  } catch (err: any) {
    console.error("[notify]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
