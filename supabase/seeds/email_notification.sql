-- ═══════════════════════════════════════════
-- 邮件通知系统 · 新爆料自动通知付费用户
-- 依赖: supabase/functions/notify-subscribers (需先部署)
-- 在 Supabase SQL Editor 中执行
-- ═══════════════════════════════════════════

-- 1. 启用 pg_net 扩展（用于从触发器调用 Edge Function）
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. 通知配置
INSERT INTO platform_settings (key, value) VALUES ('email_notification', '{
  "enabled": true,
  "notify_on": ["leak_published"],
  "min_credibility": "rumor",
  "rate_limit_minutes": 5
}'::jsonb) ON CONFLICT (key) DO NOTHING;

-- 3. 爆料发布通知函数（通过 pg_net 调用 Edge Function）
CREATE OR REPLACE FUNCTION notify_leak_published()
RETURNS TRIGGER AS $$
DECLARE
  config JSONB;
  fn_url TEXT;
BEGIN
  -- 仅在状态变为 published 时触发
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'published' THEN
    -- 对于 UPDATE，仅在之前不是 published 时才发送
    IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
      RETURN NEW;
    END IF;

    -- 检查通知是否启用
    SELECT value INTO config FROM platform_settings WHERE key = 'email_notification';
    IF config IS NULL OR (config->>'enabled')::BOOLEAN IS FALSE THEN
      RETURN NEW;
    END IF;

    -- 调用 Edge Function（异步，不阻塞）
    -- 使用内嵌 secret 验证身份（从 platform_settings 读取）
    fn_url := 'https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/notify-subscribers';
    PERFORM net.http_post(
      url := fn_url,
      body := json_build_object(
        'id', NEW.id,
        'title', NEW.title,
        'summary', NEW.summary,
        'game_name', NEW.game_name,
        'credibility', NEW.credibility,
        'secret', 'notify-leak-wh-2026'
      )::jsonb,
      headers := json_build_object('Content-Type', 'application/json')::jsonb,
      timeout_milliseconds := 30000
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建触发器
DROP TRIGGER IF EXISTS trg_leak_notify ON leaks;
CREATE TRIGGER trg_leak_notify
  AFTER INSERT OR UPDATE ON leaks
  FOR EACH ROW
  EXECUTE FUNCTION notify_leak_published();
