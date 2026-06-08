-- 在线访客追踪（论坛在线人数）
-- 在 Supabase SQL Editor 中执行

CREATE TABLE IF NOT EXISTS public.active_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  last_seen TIMESTAMPTZ DEFAULT now()
);

-- 允许匿名 upsert
ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon upsert" ON public.active_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.active_visitors FOR UPDATE USING (true);
CREATE POLICY "Allow anon select" ON public.active_visitors FOR SELECT USING (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_active_visitors_session ON public.active_visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen ON public.active_visitors(last_seen);
