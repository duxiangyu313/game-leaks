-- ═══════════════════════════════════════════
-- 投稿奖励系统 · 爆料现金奖励 + 游戏提名会员延期
-- 在 Supabase SQL Editor 中执行
-- ═══════════════════════════════════════════

-- 1. 奖励配置
INSERT INTO platform_settings (key, value) VALUES ('submission_rewards', '{
  "leak": {
    "rumor":    300,
    "likely":   500,
    "confirmed": 1000,
    "hot_bonus_1000": 500,
    "hot_bonus_5000": 2000
  },
  "game_nomination": {
    "reward_days": 3,
    "monthly_cap": 10
  },
  "monthly_budget": 15000,
  "enabled": true
}'::jsonb) ON CONFLICT (key) DO NOTHING;

-- 2. 月度预算追踪（每月 1 号自动重置）
INSERT INTO platform_settings (key, value) VALUES ('submission_reward_budget', ('{
  "month": "' || to_char(current_date, 'YYYY-MM') || '",
  "spent": 0,
  "leak_count": 0,
  "nomination_count": 0
}')::jsonb) ON CONFLICT (key) DO NOTHING;

-- 3. 核心奖励函数
CREATE OR REPLACE FUNCTION grant_submission_reward(
  p_submission_id UUID,
  p_user_id UUID,
  p_type TEXT  -- 'leak' | 'game_nomination'
) RETURNS JSONB AS $$
DECLARE
  config JSONB;
  budget JSONB;
  reward_amount INTEGER := 0;
  reward_days INTEGER := 0;
  reward_desc TEXT := '';
  leak_cred TEXT;
  sub_title TEXT;
  month_str TEXT := to_char(current_date, 'YYYY-MM');
BEGIN
  -- 读取配置
  SELECT value INTO config FROM platform_settings WHERE key = 'submission_rewards';
  IF config IS NULL OR (config->>'enabled')::BOOLEAN IS FALSE THEN
    RETURN jsonb_build_object('status', 'disabled');
  END IF;

  -- 读取/初始化月度预算
  SELECT value INTO budget FROM platform_settings WHERE key = 'submission_reward_budget';
  IF budget IS NULL OR budget->>'month' != month_str THEN
    budget := jsonb_build_object('month', month_str, 'spent', 0, 'leak_count', 0, 'nomination_count', 0);
  END IF;

  -- 检查月度预算上限
  IF (budget->>'spent')::INTEGER >= (config->>'monthly_budget')::INTEGER THEN
    RETURN jsonb_build_object('status', 'budget_exhausted', 'spent', budget->>'spent');
  END IF;

  -- ─── 快捷爆料奖励 ───
  IF p_type = 'leak' THEN
    -- 从提交内容中提取可信度（格式: **可信度**: xxx）
    SELECT regexp_replace(substring(content from '\*\*可信度\*\*:\s*(\S+)'), '\s+$', ''), title
    INTO leak_cred, sub_title
    FROM ugc_submissions WHERE id = p_submission_id;

    CASE leak_cred
      WHEN '确认' THEN reward_amount := (config->'leak'->>'confirmed')::INTEGER;
      WHEN '可靠' THEN reward_amount := (config->'leak'->>'likely')::INTEGER;
      WHEN '传闻' THEN reward_amount := (config->'leak'->>'rumor')::INTEGER;
      ELSE reward_amount := (config->'leak'->>'rumor')::INTEGER;
    END CASE;
    reward_desc := '爆料奖励: ' || COALESCE(sub_title, '无标题');

  -- ─── 游戏提名奖励 ───
  ELSIF p_type = 'game_nomination' THEN
    reward_days := (config->'game_nomination'->>'reward_days')::INTEGER;
    IF reward_days IS NULL OR reward_days <= 0 THEN reward_days := 3; END IF;

    -- 检查本月提名上限
    IF (budget->>'nomination_count')::INTEGER >= (config->'game_nomination'->>'monthly_cap')::INTEGER THEN
      RETURN jsonb_build_object('status', 'nomination_cap_reached', 'cap', config->'game_nomination'->>'monthly_cap');
    END IF;

    -- 给用户延长会员
    UPDATE profiles
    SET subscription_end_date = COALESCE(subscription_end_date, now()) + (reward_days || ' days')::INTERVAL
    WHERE id = p_user_id;
    reward_desc := '游戏提名奖励: +' || reward_days || '天会员';
    budget := jsonb_set(budget, '{nomination_count}', to_jsonb((budget->>'nomination_count')::INTEGER + 1));
  END IF;

  -- ─── 写入收益记录 ───
  IF reward_amount > 0 THEN
    -- 检查预算
    IF (budget->>'spent')::INTEGER + reward_amount > (config->>'monthly_budget')::INTEGER THEN
      RETURN jsonb_build_object('status', 'budget_exhausted', 'spent', budget->>'spent');
    END IF;

    INSERT INTO revenue_records (
      content_id, content_type, creator_id, amount,
      revenue_type, settlement_status, settlement_month, notes, created_at
    ) VALUES (
      p_submission_id, 'ugc', p_user_id, reward_amount,
      'bonus', 'settled', month_str, reward_desc, now()
    );

    -- 更新创作者余额
    UPDATE profiles
    SET revenue_balance = revenue_balance + reward_amount, total_earned = total_earned + reward_amount
    WHERE id = p_user_id;

    budget := jsonb_set(budget, '{spent}', to_jsonb((budget->>'spent')::INTEGER + reward_amount));
    budget := jsonb_set(budget, '{leak_count}', to_jsonb((budget->>'leak_count')::INTEGER + 1));
  END IF;

  -- 更新预算追踪
  UPDATE platform_settings SET value = budget, updated_at = now()
  WHERE key = 'submission_reward_budget';

  RETURN jsonb_build_object(
    'status', 'ok',
    'amount', reward_amount,
    'days', reward_days,
    'desc', reward_desc,
    'budget_remaining', (config->>'monthly_budget')::INTEGER - (budget->>'spent')::INTEGER
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. 热门爆料追投函数（内容发布后由管理员手动或定时触发）
CREATE OR REPLACE FUNCTION hot_leak_bonus(p_content_id UUID) RETURNS JSONB AS $$
DECLARE
  config JSONB;
  content_record RECORD;
  bonus INTEGER := 0;
  month_str TEXT := to_char(current_date, 'YYYY-MM');
BEGIN
  SELECT value INTO config FROM platform_settings WHERE key = 'submission_rewards';
  IF config IS NULL THEN RETURN jsonb_build_object('status', 'no_config'); END IF;

  SELECT * INTO content_record FROM ugc_content WHERE id = p_content_id;
  IF content_record IS NULL THEN RETURN jsonb_build_object('status', 'not_found'); END IF;

  -- 仅处理爆料类内容（category = 'leak'）
  IF content_record.category != 'leak' THEN
    RETURN jsonb_build_object('status', 'not_leak');
  END IF;

  -- 已追投过的不重复
  IF EXISTS (SELECT 1 FROM revenue_records
    WHERE content_id = p_content_id AND revenue_type = 'bonus'
    AND notes LIKE '热门爆料追投%') THEN
    RETURN jsonb_build_object('status', 'already_bonused');
  END IF;

  IF content_record.view_count >= 5000 THEN
    bonus := (config->'leak'->>'hot_bonus_5000')::INTEGER;
  ELSIF content_record.view_count >= 1000 THEN
    bonus := (config->'leak'->>'hot_bonus_1000')::INTEGER;
  END IF;

  IF bonus > 0 THEN
    INSERT INTO revenue_records (
      content_id, content_type, creator_id, amount,
      revenue_type, settlement_status, settlement_month, notes, created_at
    ) VALUES (
      p_content_id, 'ugc', content_record.user_id, bonus,
      'bonus', 'settled', month_str,
      '热门爆料追投: 浏览量' || content_record.view_count, now()
    );
    UPDATE profiles
    SET revenue_balance = revenue_balance + bonus, total_earned = total_earned + bonus
    WHERE id = content_record.user_id;
  END IF;

  RETURN jsonb_build_object('status', 'ok', 'bonus', bonus, 'views', content_record.view_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. 修改审核通过触发器 — 自动发放奖励
CREATE OR REPLACE FUNCTION publish_approved_v2() RETURNS TRIGGER AS $$
DECLARE
  reward_result JSONB;
  sub_type TEXT;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- 发布到 ugc_content
    INSERT INTO ugc_content (
      submission_id, user_id, title, content, cover_image,
      category, content_level, game_name, game_id, tags, published_at
    ) VALUES (
      NEW.id, NEW.user_id, NEW.title, NEW.content, NEW.cover_image,
      NEW.category, NEW.content_level, NEW.game_name, NEW.game_id,
      NEW.tags, now()
    );

    -- 确定投稿类型并发放奖励
    IF NEW.category = 'leak' THEN
      sub_type := 'leak';
    ELSIF NEW.title LIKE '[游戏提名]%' THEN
      sub_type := 'game_nomination';
    ELSE
      sub_type := 'article';
    END IF;

    -- 爆料和游戏提名发放奖励
    IF sub_type IN ('leak', 'game_nomination') THEN
      reward_result := grant_submission_reward(NEW.id, NEW.user_id, sub_type);
      NEW.review_note := COALESCE(NEW.review_note, '') || ' [奖励: ' || COALESCE(reward_result->>'desc', reward_result->>'status') || ']';
    END IF;

    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 替换旧触发器
DROP TRIGGER IF EXISTS trg_publish ON ugc_submissions;
CREATE TRIGGER trg_publish BEFORE UPDATE ON ugc_submissions
FOR EACH ROW EXECUTE FUNCTION publish_approved_v2();
