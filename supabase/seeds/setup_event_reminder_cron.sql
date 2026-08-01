-- ============================================================
-- 发售日历事件提醒 — pg_cron 定时任务配置
-- 每天北京时间 08:00（UTC 00:00）自动调用 Edge Function
-- ============================================================

-- 1. 启用 pg_cron 扩展（如未启用）
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 2. 启用 pg_net 扩展（用于 HTTP 请求，如未启用）
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- 3. 删除旧的定时任务（如存在，不存在则跳过）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-event-reminders-daily') THEN
    PERFORM cron.unschedule('send-event-reminders-daily');
  END IF;
END $$;

-- 4. 创建定时任务：每天 UTC 00:00（北京时间 08:00）触发
SELECT cron.schedule(
  'send-event-reminders-daily',
  '0 0 * * *',  -- 每天 UTC 00:00 = 北京时间 08:00
  $$
  SELECT net.http_post(
    url := 'https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/send-event-reminders',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 5. 验证任务已创建
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'send-event-reminders-daily';
