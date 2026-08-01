/**
 * 发售日历事件提醒 — 每日扫描 event_subscriptions 发送邮件
 *
 * 触发方式：
 *   pg_cron: SELECT cron.schedule('send-event-reminders', '0 8 * * *',
 *     'SELECT net.http_post(url:=''https://<PROJECT_REF>.supabase.co/functions/v1/send-event-reminders'',
 *      headers:='{"Authorization":"Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb)');
 *
 * 环境变量（在 Supabase Dashboard 设置）：
 *   RESEND_API_KEY — Resend API key (resend.com)
 *   NOTIFY_FROM     — 发件人地址，如 "国游爆料 <noreply@news.guoyouwenduji.cc>"
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API = "https://api.resend.com/emails";
const FROM = Deno.env.get("NOTIFY_FROM") || "国游爆料 <noreply@guoyouwenduji.cc>";
const SITE_URL = "https://news.guoyouwenduji.cc";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const LABELS: Record<string, string> = {
  release: "发售",
  beta: "测试",
  livestream: "直播",
  conference: "展会",
  demo: "试玩",
  update: "更新",
  other: "重要节点",
};

const TYPE_EMOJI: Record<string, string> = {
  release: "🎮",
  beta: "🧪",
  livestream: "📡",
  conference: "🎪",
  demo: "🕹️",
  update: "🔄",
  other: "📅",
};

interface SubscriptionRow {
  id: string;
  event_id: string;
  email: string;
  user_id: string | null;
  notify_days: number;
  notified: boolean;
  game_events: {
    id: string;
    title: string;
    event_date: string;
    event_type: string;
    description: string | null;
    game_id: string | null;
  };
}

serve(async (req: Request) => {
  // ── CORS ──
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // ── 1. 查询需要提醒的订阅 ──
    // 条件：notified = FALSE 且 event_date = CURRENT_DATE + notify_days
    const { data: subs, error: queryErr } = await supabase
      .from("event_subscriptions")
      .select("id, event_id, email, user_id, notify_days, notified, game_events!inner(id, title, event_date, event_type, description, game_id)")
      .eq("notified", false)
      .order("email");

    if (queryErr) {
      console.error("[send-event-reminders] Query error:", queryErr.message);
      return new Response(JSON.stringify({ error: "Query failed: " + queryErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!subs || subs.length === 0) {
      console.log("[send-event-reminders] No pending subscriptions found.");
      return new Response(JSON.stringify({ sent: 0, message: "No pending subscriptions" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // 过滤：event_date::date = CURRENT_DATE + notify_days
    // 使用北京时间（UTC+8）判断"今天"
    const now = new Date();
    const beijingOffset = 8 * 60 * 60 * 1000;
    const beijingNow = new Date(now.getTime() + beijingOffset);
    const todayStr = beijingNow.toISOString().slice(0, 10); // YYYY-MM-DD

    const dueSubs = (subs as unknown as SubscriptionRow[]).filter((s) => {
      const eventDate = s.game_events?.event_date?.slice(0, 10);
      if (!eventDate) return false;

      // 计算 target_date = event_date - notify_days
      const eventDateObj = new Date(eventDate + "T00:00:00+08:00");
      const targetDateObj = new Date(eventDateObj);
      targetDateObj.setDate(targetDateObj.getDate() - s.notify_days);
      const targetStr = targetDateObj.toISOString().slice(0, 10);

      // 事件日期已过的不发
      if (eventDate < todayStr) return false;

      return targetStr === todayStr;
    });

    if (dueSubs.length === 0) {
      console.log("[send-event-reminders] No subscriptions due today.");
      return new Response(JSON.stringify({ sent: 0, message: "No subscriptions due today" }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    console.log(`[send-event-reminders] Found ${dueSubs.length} subscriptions due today`);

    // ── 2. 按邮箱分组（同一用户可能订阅同一事件的多个提醒天数） ──
    const byEmail = new Map<string, SubscriptionRow[]>();
    for (const s of dueSubs) {
      const list = byEmail.get(s.email) || [];
      list.push(s);
      byEmail.set(s.email, list);
    }

    // ── 3. 逐封发送邮件 ──
    let sent = 0;
    let failed = 0;
    const notifiedIds: string[] = [];
    const errors: { email: string; error: string }[] = [];

    for (const [email, items] of byEmail) {
      if (items.length === 1) {
        // 单事件：单独邮件
        const s = items[0];
        const evt = s.game_events;
        const subject = buildSubject(evt, 1);
        const html = buildEmail(evt, s.notify_days);

        const result = await sendEmail(apiKey, email, subject, html);
        if (result.success) {
          sent++;
          notifiedIds.push(s.id);
        } else {
          failed++;
          errors.push({ email, error: result.error || "unknown" });
        }
      } else {
        // 多事件：汇总邮件
        const subject = `🎮 你有 ${items.length} 个关注的游戏事件即将到来`;
        const html = buildMultiEmail(items);

        const result = await sendEmail(apiKey, email, subject, html);
        if (result.success) {
          sent++;
          for (const s of items) notifiedIds.push(s.id);
        } else {
          failed++;
          errors.push({ email, error: result.error || "unknown" });
        }
      }

      // 避免触发 Resend 速率限制
      await new Promise((r) => setTimeout(r, 200));
    }

    // ── 4. 标记已通知 ──
    if (notifiedIds.length > 0) {
      const { error: updateErr } = await supabase
        .from("event_subscriptions")
        .update({ notified: true })
        .in("id", notifiedIds);

      if (updateErr) {
        console.error("[send-event-reminders] Update error:", updateErr.message);
      }
    }

    console.log(`[send-event-reminders] Done: ${sent} sent, ${failed} failed, ${notifiedIds.length} marked`);

    return new Response(
      JSON.stringify({
        sent,
        failed,
        notified: notifiedIds.length,
        totalDue: dueSubs.length,
        errors: errors.slice(0, 10),
      }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err: any) {
    console.error("[send-event-reminders]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});

// ── 辅助函数 ──

function buildSubject(evt: SubscriptionRow["game_events"], count: number): string {
  const typeLabel = LABELS[evt.event_type] || "事件";
  const emoji = TYPE_EMOJI[evt.event_type] || TYPE_EMOJI.other;
  if (count > 1) {
    return `${emoji} 你关注的 ${count} 个游戏${typeLabel}即将到来`;
  }
  return `${emoji} 你关注的《${evt.title}》${typeLabel}即将到来`;
}

function buildEmail(evt: SubscriptionRow["game_events"], notifyDays: number): string {
  const typeLabel = LABELS[evt.event_type] || "事件";
  const emoji = TYPE_EMOJI[evt.event_type] || TYPE_EMOJI.other;
  const eventUrl = evt.game_id
    ? `${SITE_URL}/games/detail?id=${evt.game_id}`
    : `${SITE_URL}/calendar`;
  const dateStr = evt.event_date
    ? new Date(evt.event_date).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0F172A;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:28px">🌡️</span>
      <h1 style="font-size:20px;margin:8px 0 0;color:#F1F5F9">国游爆料</h1>
    </div>
    <div style="background:#1E293B;border-radius:12px;padding:24px;border:1px solid rgba(245,158,11,0.2)">
      <p style="font-size:14px;color:#94A3B8;margin:0 0 8px">你订阅的事件还有 <strong style="color:#F5A623">${notifyDays}</strong> 天就要到了</p>
      <h2 style="font-size:20px;margin:0 0 12px;color:#F1F5F9;line-height:1.4">${emoji} ${evt.title}</h2>
      <table style="margin-bottom:20px;border-collapse:collapse">
        <tr>
          <td style="padding:4px 16px 4px 0;font-size:13px;color:#64748B;white-space:nowrap">类型</td>
          <td style="padding:4px 0;font-size:13px;color:#F1F5F9">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding:4px 16px 4px 0;font-size:13px;color:#64748B;white-space:nowrap">日期</td>
          <td style="padding:4px 0;font-size:13px;color:#F1F5F9">${dateStr}</td>
        </tr>
        ${evt.description ? `<tr><td style="padding:4px 16px 4px 0;font-size:13px;color:#64748B;white-space:nowrap;vertical-align:top">详情</td><td style="padding:4px 0;font-size:13px;color:#94A3B8;line-height:1.5">${evt.description}</td></tr>` : ""}
      </table>
      <a href="${eventUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#E94560,#C0392B);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
        查看详情 →
      </a>
    </div>
    <div style="text-align:center;margin-top:24px">
      <p style="font-size:11px;color:#475569;margin:0 0 4px">
        你收到此邮件因为你在 <a href="${SITE_URL}/calendar" style="color:#3B82F6;text-decoration:none">发售日历</a> 中订阅了此事件提醒
      </p>
      <a href="${SITE_URL}/calendar" style="font-size:11px;color:#3B82F6;text-decoration:none">管理订阅</a>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildMultiEmail(items: SubscriptionRow[]): string {
  const rows = items
    .map((s) => {
      const evt = s.game_events;
      const emoji = TYPE_EMOJI[evt.event_type] || TYPE_EMOJI.other;
      const typeLabel = LABELS[evt.event_type] || "事件";
      const dateStr = evt.event_date
        ? new Date(evt.event_date).toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
          })
        : "";
      const eventUrl = evt.game_id
        ? `${SITE_URL}/games/detail?id=${evt.game_id}`
        : `${SITE_URL}/calendar`;

      return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(30,41,59,0.5)">
          <span style="font-size:16px">${emoji}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(30,41,59,0.5)">
          <a href="${eventUrl}" style="color:#F1F5F9;text-decoration:none;font-size:14px;font-weight:500">${evt.title}</a>
          <div style="font-size:12px;color:#64748B;margin-top:2px">${typeLabel} · ${dateStr} · 提前 ${s.notify_days} 天</div>
        </td>
      </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0F172A;color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:28px">🌡️</span>
      <h1 style="font-size:20px;margin:8px 0 0;color:#F1F5F9">国游爆料</h1>
    </div>
    <div style="background:#1E293B;border-radius:12px;padding:24px;border:1px solid rgba(245,158,11,0.2)">
      <p style="font-size:14px;color:#94A3B8;margin:0 0 16px">以下是你关注的 <strong style="color:#F5A623">${items.length}</strong> 个即将到来的游戏事件：</p>
      <table style="width:100%;border-collapse:collapse">
        ${rows}
      </table>
      <div style="margin-top:20px;text-align:center">
        <a href="${SITE_URL}/calendar" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#E94560,#C0392B);color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
          查看发售日历 →
        </a>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px">
      <p style="font-size:11px;color:#475569;margin:0 0 4px">
        你收到此邮件因为你在 <a href="${SITE_URL}/calendar" style="color:#3B82F6;text-decoration:none">发售日历</a> 中订阅了事件提醒
      </p>
      <a href="${SITE_URL}/calendar" style="font-size:11px;color:#3B82F6;text-decoration:none">管理订阅</a>
    </div>
  </div>
</body>
</html>`.trim();
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[send-event-reminders] Failed to send to ${to}: ${err.slice(0, 200)}`);
      return { success: false, error: err.slice(0, 200) };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
