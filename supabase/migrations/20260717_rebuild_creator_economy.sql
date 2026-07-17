-- ═══════════════════════════════════════════
-- 重建创作者经济系统（收益/提现/邀请/平台设置）
-- 在 Supabase Dashboard → SQL Editor 执行
-- 金额单位统一为「分」（前端 /100 显示）
-- ═══════════════════════════════════════════

-- 1. 平台设置
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.platform_settings (key, value) VALUES
  ('cold_start', '{"enabled": false, "started_at": "2026-07-17T00:00:00Z", "withdrawal_min": 2000, "diamond_split": 50}')
ON CONFLICT (key) DO NOTHING;

-- 2. 收益记录
CREATE TABLE IF NOT EXISTS public.revenue_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  revenue_type text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  settlement_split numeric,
  settlement_month text,
  settlement_status text DEFAULT 'settled' CHECK (settlement_status IN ('pending','settled','withdrawn')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (content_id, revenue_type)
);

-- 3. 提现申请
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('alipay','wechat')),
  account_info text NOT NULL,
  real_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  admin_id uuid,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. 邀请码 + 邀请记录
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code text NOT NULL,
  reward_days integer NOT NULL DEFAULT 7,
  reward_applied boolean DEFAULT false,
  reward_expires_at timestamptz,
  invited_at timestamptz DEFAULT now()
);

-- 5. 给现有用户补发邀请码 + 新用户自动生成（只用 PG 内置函数，异常兜底绝不阻断注册）
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.referral_codes (user_id, code)
    VALUES (NEW.id, upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 8)))
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN NULL; -- 任何异常都不能阻断注册链
  END;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_ensure_referral_code ON public.profiles;
CREATE TRIGGER trg_ensure_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_referral_code();

INSERT INTO public.referral_codes (user_id, code)
SELECT p.id, upper(substr(md5(p.id::text || clock_timestamp()::text), 1, 8))
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.referral_codes rc WHERE rc.user_id = p.id);

-- 6. RPC: 应用邀请码（新用户登录后调用，幂等）
CREATE OR REPLACE FUNCTION public.apply_referral(ref_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me uuid := auth.uid();
  rc RECORD;
  my_created timestamptz;
BEGIN
  IF me IS NULL THEN RETURN json_build_object('ok', false, 'reason', 'not_logged_in'); END IF;
  -- 已被邀请过则跳过（幂等）
  IF EXISTS (SELECT 1 FROM referral_records WHERE invited_user_id = me) THEN
    RETURN json_build_object('ok', false, 'reason', 'already_referred');
  END IF;
  SELECT * INTO rc FROM referral_codes WHERE code = upper(trim(ref_code));
  IF NOT FOUND OR rc.user_id = me THEN
    RETURN json_build_object('ok', false, 'reason', 'invalid_code');
  END IF;
  -- 仅注册 7 天内的新账号可绑定邀请关系
  SELECT created_at INTO my_created FROM profiles WHERE id = me;
  IF my_created IS NULL OR my_created < now() - interval '7 days' THEN
    RETURN json_build_object('ok', false, 'reason', 'not_new_user');
  END IF;
  INSERT INTO referral_records (referrer_id, invited_user_id, referral_code, reward_days)
  VALUES (rc.user_id, me, rc.code, 7);
  UPDATE referral_codes SET usage_count = COALESCE(usage_count,0) + 1 WHERE id = rc.id;
  RETURN json_build_object('ok', true);
END;
$$;

-- 7. RPC: 月度结算（管理后台"运行月度结算"按钮调用，仅 diamond）
-- 规则: 爆料 传闻¥3/可靠¥5/确认¥10 · 视频¥2 · 浏览奖励 1000浏览+¥5 / 5000浏览+¥20
CREATE OR REPLACE FUNCTION public.calculate_revenue()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n int := 0;
  total bigint := 0;
  r RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond') THEN
    RAISE EXCEPTION '仅管理员可运行结算';
  END IF;

  -- 基础奖励：已通过的爆料/视频投稿
  FOR r IN
    SELECT s.id, s.user_id, s.category, s.content,
      CASE
        WHEN s.category = 'leak' AND s.content LIKE '%可信度**: 确认%' THEN 1000
        WHEN s.category = 'leak' AND s.content LIKE '%可信度**: 传闻%' THEN 300
        WHEN s.category = 'leak' THEN 500
        WHEN s.category = 'video' THEN 200
        ELSE 0
      END AS reward
    FROM ugc_submissions s
    WHERE s.status = 'approved' AND s.category IN ('leak','video')
      AND NOT EXISTS (SELECT 1 FROM revenue_records x WHERE x.content_id = s.id AND x.revenue_type = 'base_reward')
  LOOP
    IF r.reward > 0 THEN
      INSERT INTO revenue_records (creator_id, content_id, content_type, revenue_type, amount, settlement_month, settlement_status, notes)
      VALUES (r.user_id, r.id, r.category, 'base_reward', r.reward, to_char(now(),'YYYY-MM'), 'settled', '投稿审核通过奖励')
      ON CONFLICT (content_id, revenue_type) DO NOTHING;
      n := n + 1; total := total + r.reward;
    END IF;
  END LOOP;

  -- 浏览奖励：投稿发布后的 leaks/articles 浏览量（按标题匹配）
  FOR r IN
    SELECT s.id, s.user_id, s.category, COALESCE(l.view_count, a.view_count, 0) AS vc
    FROM ugc_submissions s
    LEFT JOIN leaks l ON l.title = s.title
    LEFT JOIN articles a ON a.title = s.title
    WHERE s.status = 'approved'
  LOOP
    IF r.vc >= 1000 AND NOT EXISTS (SELECT 1 FROM revenue_records x WHERE x.content_id = r.id AND x.revenue_type = 'view_bonus_1000') THEN
      INSERT INTO revenue_records (creator_id, content_id, content_type, revenue_type, amount, settlement_month, settlement_status, notes)
      VALUES (r.user_id, r.id, r.category, 'view_bonus_1000', 500, to_char(now(),'YYYY-MM'), 'settled', '浏览量突破1000奖励');
      n := n + 1; total := total + 500;
    END IF;
    IF r.vc >= 5000 AND NOT EXISTS (SELECT 1 FROM revenue_records x WHERE x.content_id = r.id AND x.revenue_type = 'view_bonus_5000') THEN
      INSERT INTO revenue_records (creator_id, content_id, content_type, revenue_type, amount, settlement_month, settlement_status, notes)
      VALUES (r.user_id, r.id, r.category, 'view_bonus_5000', 2000, to_char(now(),'YYYY-MM'), 'settled', '浏览量突破5000奖励');
      n := n + 1; total := total + 2000;
    END IF;
  END LOOP;

  RETURN json_build_object('records_created', n, 'total_amount', total);
END;
$$;

-- 8. RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_records ENABLE ROW LEVEL SECURITY;

-- 平台设置: 所有人可读（冷启动检查），diamond 可改
CREATE POLICY "ps_select" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "ps_update_admin" ON public.platform_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));

-- 收益: 本人可读，diamond 可读可改（提现打款后标记 withdrawn）
CREATE POLICY "rev_select_own" ON public.revenue_records FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "rev_select_admin" ON public.revenue_records FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));
CREATE POLICY "rev_update_admin" ON public.revenue_records FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));

-- 提现: 本人可申请可查，diamond 可查可审
CREATE POLICY "wd_insert_own" ON public.withdrawal_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "wd_select_own" ON public.withdrawal_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "wd_select_admin" ON public.withdrawal_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));
CREATE POLICY "wd_update_admin" ON public.withdrawal_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));

-- 邀请码/记录: 本人可读（写入走 SECURITY DEFINER 函数）
CREATE POLICY "rc_select_own" ON public.referral_codes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "rr_select_own" ON public.referral_records FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR invited_user_id = auth.uid());

SELECT 'Creator economy rebuilt: ' || (SELECT count(*) FROM public.referral_codes) || ' referral codes issued' AS status;
