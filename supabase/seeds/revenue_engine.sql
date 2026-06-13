-- ═══════════════════════════════════════════
-- 收益计算引擎 · SQL 函数
-- 在 Supabase SQL Editor 中执行
-- ═══════════════════════════════════════════

-- 收入计算核心函数
-- 调用方式：SELECT calculate_revenue();
-- 建议：Supabase Cron 每月 1 号 00:00 执行

CREATE OR REPLACE FUNCTION calculate_revenue()
RETURNS TABLE(status TEXT, records_created INTEGER, total_amount INTEGER) AS $$
DECLARE
  month_str TEXT := to_char(current_date, 'YYYY-MM');
  r RECORD;
  split_config JSONB;
  ad_rate_free INTEGER := 3;      -- 免费内容千次浏览 ¥3
  ad_rate_gold INTEGER := 5;      -- 黄金内容千次浏览 ¥5
  ad_rate_diamond INTEGER := 8;   -- 钻石内容千次浏览 ¥8
  sub_pool INTEGER := 0;          -- 会员订阅总金额（分）
  total_engagement INTEGER := 0;
  creator_share INTEGER;
  amount INTEGER;
  records_created INTEGER := 0;
  total_amount INTEGER := 0;
BEGIN
  -- 1. 获取分成配置
  SELECT value INTO split_config FROM platform_settings WHERE key = 'revenue_splits';
  IF split_config IS NULL THEN
    split_config := '{"free":{"creator_ad_share":100},"gold":{"creator_sub_share":25},"diamond":{"creator_sub_share":40,"split_months":[50,30,20]}}'::jsonb;
  END IF;

  -- 2. 计算本月订阅总池（从 payments 表）
  SELECT COALESCE(SUM(amount), 0) INTO sub_pool
  FROM stripe_payments
  WHERE status = 'completed'
    AND to_char(created_at, 'YYYY-MM') = month_str;

  -- 如果当月没有订阅收入，使用估算值（根据活跃会员数 × 平均月费）
  IF sub_pool = 0 THEN
    SELECT COALESCE(SUM(
      CASE
        WHEN p.membership = 'gold' THEN 2900   -- ¥29/月
        WHEN p.membership = 'diamond' THEN 8900 -- ¥89/月
        ELSE 0
      END
    ), 0) INTO sub_pool
    FROM profiles p
    WHERE p.subscription_status = 'active'
      AND p.membership IN ('gold', 'diamond');
  END IF;

  -- 3. 计算所有 UGC 内容的总互动量（用于按比例分配订阅池）
  SELECT COALESCE(SUM(view_count + like_count * 2 + comment_count * 3), 0)
  INTO total_engagement
  FROM ugc_content
  WHERE published_at >= date_trunc('month', current_date);

  IF total_engagement = 0 THEN total_engagement := 1; END IF;

  -- 4. 遍历每条 UGC 内容，计算收益
  FOR r IN
    SELECT
      c.id, c.user_id, c.content_level,
      c.view_count, c.like_count, c.comment_count,
      (c.view_count + c.like_count * 2 + c.comment_count * 3) AS engagement
    FROM ugc_content c
    WHERE c.published_at >= date_trunc('month', current_date)
  LOOP
    amount := 0;

    -- 4a. 广告分成（按浏览量）
    IF r.content_level = 'free' THEN
      amount := amount + (r.view_count * ad_rate_free / 1000);
    ELSIF r.content_level = 'gold' THEN
      amount := amount + (r.view_count * ad_rate_gold / 1000);
    ELSIF r.content_level = 'diamond' THEN
      amount := amount + (r.view_count * ad_rate_diamond / 1000);
    END IF;

    -- 4b. 会员订阅分成（仅 gold/diamond 内容）
    IF r.content_level IN ('gold', 'diamond') AND sub_pool > 0 THEN
      creator_share := (split_config -> r.content_level ->> 'creator_sub_share')::INTEGER;
      IF creator_share IS NULL OR creator_share = 0 THEN
        creator_share := CASE WHEN r.content_level = 'gold' THEN 25 ELSE 40 END;
      END IF;
      -- 按互动比例分配订阅池
      amount := amount + (sub_pool * creator_share / 100) * (r.engagement::NUMERIC / total_engagement);
    END IF;

    -- 4c. 钻石内容分期支付（分3个月）
    IF r.content_level = 'diamond' THEN
      -- 当月只发放 50%
      amount := amount * 50 / 100;
    END IF;

    IF amount > 0 THEN
      amount := FLOOR(amount)::INTEGER;
      INSERT INTO revenue_records (content_id, content_type, creator_id, amount, revenue_type, settlement_month, settlement_status, settlement_split, created_at)
      VALUES (r.id, 'ugc', r.user_id, amount, 'ad_share', month_str, 'settled', 0, now());
      records_created := records_created + 1;
      total_amount := total_amount + amount;

      -- 更新创作者余额
      UPDATE profiles SET revenue_balance = revenue_balance + amount, total_earned = total_earned + amount
      WHERE id = r.user_id;
    END IF;
  END LOOP;

  -- 5. 处理钻石内容前两个月的延迟分成
  INSERT INTO revenue_records (content_id, content_type, creator_id, amount, revenue_type, settlement_month, settlement_status, settlement_split, notes, created_at)
  SELECT
    c.id, 'ugc', c.user_id,
    FLOOR((prev.amount * CASE
      WHEN prev.settlement_month = to_char(current_date - INTERVAL '1 month', 'YYYY-MM') THEN 30
      WHEN prev.settlement_month = to_char(current_date - INTERVAL '2 months', 'YYYY-MM') THEN 20
      ELSE 0
    END / 100))::INTEGER,
    'subscription_share', month_str, 'settled', 0,
    'diamond split month ' || CASE
      WHEN prev.settlement_month = to_char(current_date - INTERVAL '1 month', 'YYYY-MM') THEN '2/3'
      ELSE '3/3'
    END,
    now()
  FROM revenue_records prev
  JOIN ugc_content c ON prev.content_id = c.id
  WHERE c.content_level = 'diamond'
    AND prev.revenue_type = 'ad_share'
    AND prev.settlement_month IN (
      to_char(current_date - INTERVAL '1 month', 'YYYY-MM'),
      to_char(current_date - INTERVAL '2 months', 'YYYY-MM')
    );

  DECLARE
    inserted_count INTEGER;
  BEGIN
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    records_created := records_created + inserted_count;
  END;

  RETURN QUERY SELECT 'ok'::TEXT, records_created, total_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══ 奖励计算（邀请成功） ═══
-- 当被邀请人首次付费时调用
CREATE OR REPLACE FUNCTION apply_referral_reward(p_invited_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  ref_record RECORD;
  reward_days INTEGER;
BEGIN
  SELECT * INTO ref_record FROM referral_records
  WHERE invited_user_id = p_invited_user_id AND reward_applied = false
  ORDER BY invited_at DESC LIMIT 1;

  IF ref_record IS NULL THEN RETURN 'no_pending_referral'; END IF;

  -- 邀请人获得会员延期
  reward_days := ref_record.reward_days;
  IF EXISTS (SELECT 1 FROM profiles WHERE id = ref_record.referrer_id AND membership = 'diamond') THEN
    reward_days := reward_days * 2; -- 钻石双倍
  END IF;

  UPDATE profiles
  SET subscription_end_date = COALESCE(subscription_end_date, now()) + (reward_days || ' days')::INTERVAL
  WHERE id = ref_record.referrer_id;

  -- 被邀请人也获得奖励天数（新用户体验）
  UPDATE profiles
  SET subscription_end_date = COALESCE(subscription_end_date, now()) + (ref_record.reward_days || ' days')::INTERVAL
  WHERE id = p_invited_user_id;

  UPDATE referral_records SET reward_applied = true, reward_expires_at = now() + INTERVAL '30 days'
  WHERE id = ref_record.id;

  RETURN 'reward_applied_' || reward_days || '_days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
