-- 邮件订阅通知系统
-- 在 Supabase SQL Editor 中执行此文件

CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  game_ids TEXT[] DEFAULT '{}',       -- 关注的游戏ID列表，空=全部
  send_all BOOLEAN DEFAULT true,      -- 是否接收所有通知
  confirmed BOOLEAN DEFAULT false,    -- 邮件确认状态
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS：允许匿名用户插入（订阅），仅本人可查看/删除
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert" ON public.email_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select by email" ON public.email_subscriptions
  FOR SELECT USING (true);

-- 索引：快速查重
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON public.email_subscriptions(email);
