-- ═══════════════════════════════════════════
-- 修复注册报错 "Database error saving new user"
-- 原因: profiles 表简化后（只剩 id/username/avatar/membership/created_at/updated_at）
--       auth.users 的触发器还在往已删除的列插入数据导致失败
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

-- 1. 重建 handle_new_user 函数，匹配简化后的 profiles 表结构
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, membership)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'user_' || substr(NEW.id::text, 1, 8)),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. 确保触发器存在且指向新函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 清理其他可能残留的注册相关触发器（引用已删除的表）
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
DROP FUNCTION IF EXISTS public.gen_ref_code() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_trial() CASCADE;
DROP FUNCTION IF EXISTS public.signup_user(text, text) CASCADE;

-- 4. 确保 profiles 表 RLS 允许触发器插入（SECURITY DEFINER 绕过 RLS，但保险起见）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Allow trigger insert'
  ) THEN
    CREATE POLICY "Allow trigger insert" ON public.profiles
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 验证: 执行后注册新账号应该成功
SELECT 'Trigger fixed' AS status;

-- ═══ 追加 (2026-07-17 晚): 真正的根因 ═══
-- profiles 表上还挂着付费系统残留的 generate_referral_code 触发器
-- 它调用 gen_random_bytes() (pgcrypto 不可用) 导致整个注册链回滚
-- 修复:
-- DO $$ ... DROP TRIGGER (all on public.profiles) ... $$;
-- DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;
