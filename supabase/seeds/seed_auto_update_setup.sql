-- ═══════════════════════════════════════════
-- 国游爆料 · 自动更新机制 SQL 配置
-- 在 Supabase SQL Editor 执行
-- ═══════════════════════════════════════════

-- ============================================
-- 1. 启用 pg_cron 扩展（如果未启用）
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. 创建每日自动更新定时任务（每天凌晨2点）
-- ============================================
SELECT cron.schedule(
  'daily-auto-update',           -- 任务名称
  '0 2 * * *',                    -- cron: 每天凌晨2:00
  $$
  SELECT
    net.http_post(
      url := 'https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/auto-update',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
    ) AS request_id;
  $$
);

-- ============================================
-- 3. 创建站点统计视图（首页数据快照）
-- ============================================
CREATE OR REPLACE VIEW site_stats AS
SELECT
  (SELECT count(*) FROM games) AS total_games,
  (SELECT count(*) FROM games WHERE status = 'released') AS released_games,
  (SELECT count(*) FROM games WHERE hype_score >= 85) AS hot_games,
  (SELECT count(*) FROM leaks WHERE status = 'published') AS published_leaks,
  (SELECT count(*) FROM profiles) AS total_members,
  (SELECT count(*) FROM profiles WHERE membership != 'free') AS paid_members,
  (SELECT max(updated_at) FROM games) AS last_game_update,
  (SELECT max(published_at) FROM leaks WHERE status = 'published') AS last_leak_update;

-- ============================================
-- 4. 创建自动更新日志表
-- ============================================
CREATE TABLE IF NOT EXISTS auto_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  games_updated INTEGER DEFAULT 0,
  games_released TEXT[] DEFAULT '{}',
  leaks_published INTEGER DEFAULT 0,
  memberships_expired INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE auto_update_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read logs" ON auto_update_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE membership = 'diamond'));

-- ============================================
-- 5. 验证
-- ============================================
SELECT * FROM site_stats;
SELECT cron.jobname, cron.schedule FROM cron.job WHERE cron.jobname = 'daily-auto-update';
