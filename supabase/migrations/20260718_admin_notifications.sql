-- ═══════════════════════════════════════════
-- 管理员实时通知系统
-- 新注册/登录/帖子/投稿 → pg_net → Edge Function → 邮箱 → 微信推送
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

-- 0. device_sessions 表（数据库简化时被删，ContentProtection 组件依赖 + 登录触发器依赖）
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user ON public.device_sessions(user_id);

ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ds_insert_own ON public.device_sessions;
CREATE POLICY ds_insert_own ON public.device_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS ds_update_own ON public.device_sessions;
CREATE POLICY ds_update_own ON public.device_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS ds_select_own ON public.device_sessions;
CREATE POLICY ds_select_own ON public.device_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 确保 pg_net 可用
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ═══ 通知函数：统一调 Edge Function ═══
CREATE OR REPLACE FUNCTION public.notify_admin(
  event_type text,
  event_title text,
  event_body text,
  event_link text DEFAULT 'https://news.guoyouwenduji.cc/admin'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 异步 HTTP POST，不阻塞主事务
  PERFORM net.http_post(
    url := 'https://gumpxfxbxxyljikaizsh.supabase.co/functions/v1/admin-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNzM1NDUsImV4cCI6MjA5NTk0OTU0NX0.MnnnjS_kkxL6fdS3S0gXSrQ0v3rEUikehmr08HmHJkU'
    ),
    body := json_build_object(
      'secret', 'admin-notify-wh-20260718',
      'type', event_type,
      'title', event_title,
      'body', event_body,
      'timestamp', now(),
      'link', event_link
    )::text,
    timeout_milliseconds := 5000
  );
EXCEPTION WHEN OTHERS THEN
  -- 通知失败不阻断主流程
  NULL;
END;
$$;

-- ═══ 需求获取用户邮箱的函数 ═══
CREATE OR REPLACE FUNCTION public.get_user_email(uid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT email FROM auth.users WHERE id = uid),
    '未知用户'
  );
$$;

-- ═══ 触发器 1: 新用户注册 ═══
CREATE OR REPLACE FUNCTION public.trg_notify_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  uname := COALESCE(NEW.username, 'user_' || substr(NEW.id::text, 1, 8));
  -- 写入日志
  INSERT INTO public.admin_logs (action, detail, created_at)
  VALUES ('user_signup', json_build_object('user_id', NEW.id, 'username', uname)::text, now());
  -- 发通知
  PERFORM public.notify_admin(
    'user_signup',
    '新用户注册：' || uname,
    '用户名：' || uname || E'\n注册时间：' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    'https://news.guoyouwenduji.cc/admin/users'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_signup ON public.profiles;
CREATE TRIGGER trg_notify_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_signup();

-- ═══ 触发器 2: 用户登录（新设备） ═══
CREATE OR REPLACE FUNCTION public.trg_notify_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  id_count int;
BEGIN
  -- 去重：同一 user_id 24h 内只通知一次
  SELECT count(*) INTO id_count
  FROM public.device_sessions
  WHERE user_id = NEW.user_id
    AND last_seen > now() - interval '24 hours'
    AND id != NEW.id;

  IF id_count > 0 THEN
    RETURN NEW; -- 24h 内已有设备记录，跳过
  END IF;

  INSERT INTO public.admin_logs (action, detail, created_at)
  VALUES ('user_login', json_build_object('user_id', NEW.user_id, 'fingerprint', NEW.device_fingerprint)::text, now());

  PERFORM public.notify_admin(
    'user_login',
    '用户登录（新设备）',
    '用户ID：' || NEW.user_id::text || E'\n设备指纹：' || COALESCE(NEW.device_fingerprint, '未知') || E'\n登录时间：' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    'https://news.guoyouwenduji.cc/admin/users'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_login ON public.device_sessions;
CREATE TRIGGER trg_notify_login
  AFTER INSERT ON public.device_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_login();

-- ═══ 触发器 3: 新论坛帖子 ═══
CREATE OR REPLACE FUNCTION public.trg_notify_forum_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_logs (action, detail, created_at)
  VALUES ('forum_post', json_build_object('id', NEW.id, 'title', NEW.title, 'category', NEW.category, 'author', NEW.author_name)::text, now());

  PERFORM public.notify_admin(
    'forum_post',
    '新论坛帖子',
    '标题：' || NEW.title || E'\n作者：' || COALESCE(NEW.author_name, '匿名') || E'\n板块：' || NEW.category || E'\n时间：' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    'https://news.guoyouwenduji.cc/forum/post?id=' || NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_forum_post ON public.forum_posts;
CREATE TRIGGER trg_notify_forum_post
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_forum_post();

-- ═══ 触发器 4: 新投稿 ═══
CREATE OR REPLACE FUNCTION public.trg_notify_ugc_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  type_label text;
BEGIN
  type_label := CASE NEW.category
    WHEN 'leak' THEN '爆料'
    WHEN 'article' THEN '文章'
    WHEN 'game_nomination' THEN '游戏提名'
    WHEN 'video' THEN '视频'
    ELSE NEW.category
  END;

  INSERT INTO public.admin_logs (action, detail, created_at)
  VALUES ('ugc_submission', json_build_object('id', NEW.id, 'title', NEW.title, 'category', NEW.category, 'user_id', NEW.user_id, 'content_level', NEW.content_level)::text, now());

  PERFORM public.notify_admin(
    'ugc_submission',
    '新投稿：' || NEW.title,
    '类型：' || type_label || E'\n标题：' || NEW.title || E'\n内容等级：' || COALESCE(NEW.content_level, 'free') || E'\n时间：' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    'https://news.guoyouwenduji.cc/admin/submissions'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_ugc_submission ON public.ugc_submissions;
CREATE TRIGGER trg_notify_ugc_submission
  AFTER INSERT ON public.ugc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_notify_ugc_submission();

-- ═══ 验证 ═══
SELECT 'Notifications ready: '
  || (SELECT count(*) FROM pg_trigger WHERE tgname LIKE 'trg_notify_%') || ' triggers installed' AS status;
