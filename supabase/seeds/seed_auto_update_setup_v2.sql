-- ═══════════════════════════════════════════
-- 国游爆料 · 自动更新机制 SQL v2
-- 兼容 Supabase 免费版（无需 pg_cron）
-- ═══════════════════════════════════════════

-- ============================================
-- 1. 站点统计视图（首页数据快照）
-- ============================================
DROP VIEW IF EXISTS site_stats;
CREATE VIEW site_stats AS
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
-- 2. 自动更新日志表
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

-- RLS
ALTER TABLE auto_update_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read logs" ON auto_update_logs;
CREATE POLICY "Public read logs" ON auto_update_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write logs" ON auto_update_logs;
CREATE POLICY "Admin write logs" ON auto_update_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. 每日自动更新函数（手动或外部 cron 调用）
-- ============================================
CREATE OR REPLACE FUNCTION run_daily_update()
RETURNS TABLE(result JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INT := 0;
  released_list TEXT[] := '{}';
  leak_count INT := 0;
  expired_count INT := 0;
  error_list TEXT[] := '{}';
  game_record RECORD;
  today TEXT;
BEGIN
  today := current_date::TEXT;

  -- 发售日到期 → released
  FOR game_record IN
    SELECT id, title FROM games
    WHERE status = 'announced'
      AND release_date IS NOT NULL
      AND release_date <= today
  LOOP
    BEGIN
      UPDATE games SET status = 'released', updated_at = now()
      WHERE id = game_record.id;
      updated_count := updated_count + 1;
      released_list := array_append(released_list, game_record.title);
    EXCEPTION WHEN OTHERS THEN
      error_list := array_append(error_list, 'Failed: ' || game_record.title);
    END;
  END LOOP;

  -- 定时爆料 → published
  UPDATE leaks SET status = 'published', published_at = now()
  WHERE status = 'scheduled' AND scheduled_at <= now();
  GET DIAGNOSTICS leak_count = ROW_COUNT;

  -- 会员过期
  FOR game_record IN
    SELECT um.id, um.user_id FROM user_memberships um
    WHERE um.status = 'active' AND um.end_date < today
  LOOP
    BEGIN
      UPDATE user_memberships SET status = 'expired', updated_at = now()
      WHERE id = game_record.id;
      UPDATE profiles SET membership = 'free', subscription_status = 'inactive', updated_at = now()
      WHERE id = game_record.user_id;
      expired_count := expired_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_list := array_append(error_list, 'Expire failed: ' || game_record.id);
    END;
  END LOOP;

  -- 记日志
  INSERT INTO auto_update_logs (games_updated, games_released, leaks_published, memberships_expired, errors)
  VALUES (updated_count, released_list, leak_count, expired_count, error_list);

  RETURN QUERY SELECT jsonb_build_object(
    'timestamp', now()::TEXT,
    'games_updated', updated_count,
    'games_released', released_list,
    'leaks_published', leak_count,
    'memberships_expired', expired_count,
    'errors', error_list
  );
END;
$$;

-- ============================================
-- 4. 验证
-- ============================================
SELECT * FROM site_stats;
-- 手动测试：SELECT * FROM run_daily_update();
