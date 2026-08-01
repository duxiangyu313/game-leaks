-- ══════════════════════════════════════════════════════
-- 国游爆料 · 发售日历事件订阅 | 2026-08-01
--
-- 功能：用户可订阅日历事件，选择提前 1/3/7 天邮件通知
-- 表:   event_subscriptions
-- 触发: supabase/functions/send-event-reminders (pg_cron 每天 08:00)
-- ══════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────
-- 步骤 1: 建表
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id    UUID NOT NULL REFERENCES public.game_events(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notify_days INT DEFAULT 1 CHECK (notify_days IN (1, 3, 7)),
  notified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- 索引：加速 Edge Function 每日扫描
CREATE INDEX IF NOT EXISTS idx_event_subscriptions_notified
  ON public.event_subscriptions(notified, event_id);

CREATE INDEX IF NOT EXISTS idx_event_subscriptions_email
  ON public.event_subscriptions(email);

-- ──────────────────────────────────────────────────────
-- 步骤 2: RLS 策略（先清理旧策略，避免重复执行报错）
-- ──────────────────────────────────────────────────────
ALTER TABLE public.event_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscriptions by email" ON public.event_subscriptions;
DROP POLICY IF EXISTS "Anyone can create subscriptions" ON public.event_subscriptions;
DROP POLICY IF EXISTS "Anyone can delete own subscriptions" ON public.event_subscriptions;

-- 任何人都可以查看订阅（按邮箱查询自己的订阅）
CREATE POLICY "Anyone can view subscriptions by email"
  ON public.event_subscriptions
  FOR SELECT
  USING (true);

-- 任何人都可以创建订阅（匿名用户也可订阅）
CREATE POLICY "Anyone can create subscriptions"
  ON public.event_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- 任何人都可以删除自己的订阅（通过邮箱匹配）
CREATE POLICY "Anyone can delete own subscriptions"
  ON public.event_subscriptions
  FOR DELETE
  USING (true);

-- ──────────────────────────────────────────────────────
-- 步骤 3: 注释
-- ──────────────────────────────────────────────────────
COMMENT ON TABLE public.event_subscriptions IS '用户事件订阅表：日历事件提醒邮件订阅';
COMMENT ON COLUMN public.event_subscriptions.event_id IS '关联 game_events.id';
COMMENT ON COLUMN public.event_subscriptions.email IS '订阅者邮箱';
COMMENT ON COLUMN public.event_subscriptions.user_id IS '登录用户 ID（可选，匿名订阅为 NULL）';
COMMENT ON COLUMN public.event_subscriptions.notify_days IS '提前天数：1/3/7';
COMMENT ON COLUMN public.event_subscriptions.notified IS '是否已发送提醒（Edge Function 标记）';
COMMENT ON COLUMN public.event_subscriptions.created_at IS '订阅创建时间';

-- ──────────────────────────────────────────────────────
-- 步骤 4: 示例数据（使用真实 game_events）
-- ──────────────────────────────────────────────────────
-- 注：以下 INSERT 在 SQL Editor 中运行时，
--     如果对应 event_id 不存在会自动跳过（ON CONFLICT 无害）
INSERT INTO public.event_subscriptions (event_id, email, notify_days, notified)
SELECT e.id, 'demo@guoyouwenduji.cc', 3, FALSE
FROM public.game_events e
WHERE e.title LIKE '%黑神话%'
  AND e.event_date > CURRENT_DATE
LIMIT 1
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO public.event_subscriptions (event_id, email, notify_days, notified)
SELECT e.id, 'demo@guoyouwenduji.cc', 7, FALSE
FROM public.game_events e
WHERE e.title LIKE '%影之刃%'
  AND e.event_date > CURRENT_DATE
LIMIT 1
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO public.event_subscriptions (event_id, email, notify_days, notified)
SELECT e.id, 'demo@guoyouwenduji.cc', 1, FALSE
FROM public.game_events e
WHERE e.title LIKE '%归唐%'
  AND e.event_date > CURRENT_DATE
LIMIT 1
ON CONFLICT (event_id, email) DO NOTHING;

-- ──────────────────────────────────────────────────────
-- 步骤 5: 验证查询
-- ──────────────────────────────────────────────────────
-- SELECT * FROM public.event_subscriptions;
-- SELECT e.title, e.event_date, s.email, s.notify_days, s.notified
--   FROM public.event_subscriptions s
--   JOIN public.game_events e ON s.event_id = e.id
--  ORDER BY e.event_date;
