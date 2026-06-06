/**
 * 国游爆料 · 每日自动更新任务
 * 通过 Supabase Scheduled Functions (pg_cron) 每天凌晨2点触发
 *
 * 功能:
 * 1. 自动更新游戏状态（发售日到期 → released）
 * 2. 自动更新游戏发售日（根据最新爆料）
 * 3. 生成每日站点统计快照
 * 4. 检查到期会员资格
 * 5. 返回更新摘要
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface UpdateReport {
  timestamp: string;
  gamesUpdated: number;
  gamesReleased: string[];
  leaksPublished: number;
  membershipsExpired: number;
  errors: string[];
}

serve(async (_req) => {
  const report: UpdateReport = {
    timestamp: new Date().toISOString(),
    gamesUpdated: 0,
    gamesReleased: [],
    leaksPublished: 0,
    membershipsExpired: 0,
    errors: [],
  };

  try {
    // ═══════════════════════════════
    // 1. 自动发售：发售日已到的游戏 → released
    // ═══════════════════════════════
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: toRelease } = await supabase
      .from("games")
      .select("id,title,release_date")
      .eq("status", "announced")
      .lte("release_date", today)
      .not("release_date", "is", null);

    if (toRelease && toRelease.length > 0) {
      for (const game of toRelease) {
        const { error } = await supabase
          .from("games")
          .update({ status: "released", updated_at: new Date().toISOString() })
          .eq("id", game.id);

        if (error) {
          report.errors.push(`Failed to release ${game.title}: ${error.message}`);
        } else {
          report.gamesReleased.push(game.title);
          report.gamesUpdated++;
        }
      }
    }

    // ═══════════════════════════════
    // 2. 自动发布定时爆料
    // ═══════════════════════════════
    const { data: scheduledLeaks } = await supabase
      .from("leaks")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .not("scheduled_at", "is", null);

    if (scheduledLeaks && scheduledLeaks.length > 0) {
      const { error: leakErr } = await supabase
        .from("leaks")
        .update({ status: "published", published_at: new Date().toISOString() })
        .in("id", scheduledLeaks.map(l => l.id));

      if (leakErr) {
        report.errors.push(`Failed to publish leaks: ${leakErr.message}`);
      } else {
        report.leaksPublished = scheduledLeaks.length;
      }
    }

    // ═══════════════════════════════
    // 3. 会员过期检查
    // ═══════════════════════════════
    const { data: expiredMembers } = await supabase
      .from("user_memberships")
      .select("id,user_id,tier")
      .eq("status", "active")
      .lt("end_date", today);

    if (expiredMembers && expiredMembers.length > 0) {
      for (const m of expiredMembers) {
        // 过期会员 → expired
        await supabase
          .from("user_memberships")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", m.id);

        // 同步 profiles 降级到 free
        await supabase
          .from("profiles")
          .update({
            membership: "free",
            subscription_status: "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("id", m.user_id);
      }
      report.membershipsExpired = expiredMembers.length;
    }

    // ═══════════════════════════════
    // 4. 每日站点统计快照
    // ═══════════════════════════════
    const [{ count: gameCount }, { count: leakCount }, { count: memberCount }] =
      await Promise.all([
        supabase.from("games").select("id", { count: "exact", head: true }),
        supabase.from("leaks").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

    console.log(
      `[auto-update] ${report.timestamp} | ` +
      `Games: ${gameCount} | Leaks: ${leakCount} | Members: ${memberCount} | ` +
      `Released: ${report.gamesReleased.length} | Expired: ${report.membershipsExpired}`
    );

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(`[auto-update] Fatal error: ${err.message}`);
    report.errors.push(`Fatal: ${err.message}`);
    return new Response(JSON.stringify(report), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
