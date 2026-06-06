-- ═══════════════════════════════════════════
-- 国游爆料 · user_memberships 表迁移
-- 用于跟踪会员订阅历史，与 profiles 表解耦
-- 在 Supabase SQL Editor 中执行
-- 日期: 2026-06-04
-- ═══════════════════════════════════════════

-- 1. 创建 user_memberships 表
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier membership_tier NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  billing_cycle TEXT
    CHECK (billing_cycle IN ('monthly', 'yearly')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_session_id TEXT,
  amount INTEGER, -- 支付金额（分）
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_sub ON user_memberships(stripe_subscription_id);

-- 每个用户同时只有一个活跃订阅（但允许多条历史记录）
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_memberships_one_active
  ON user_memberships (user_id) WHERE status = 'active';

-- 2. RLS 策略
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own memberships" ON user_memberships;
CREATE POLICY "Users read own memberships" ON user_memberships
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON user_memberships;
CREATE POLICY "Service role full access" ON user_memberships
  USING (true) WITH CHECK (true);

-- 3. 为现有付费用户回填数据（如果 profiles 中有已付费用户）
INSERT INTO user_memberships (user_id, tier, status, billing_cycle, start_date, end_date, stripe_customer_id, stripe_subscription_id)
SELECT
  id AS user_id,
  membership AS tier,
  CASE subscription_status
    WHEN 'active' THEN 'active'::TEXT
    WHEN 'past_due' THEN 'past_due'::TEXT
    WHEN 'canceled' THEN 'canceled'::TEXT
    ELSE 'active'::TEXT
  END AS status,
  'monthly' AS billing_cycle, -- 默认，实际由 webhook 更新
  COALESCE(updated_at, created_at, now()) AS start_date,
  COALESCE(subscription_end_date, now() + INTERVAL '1 month') AS end_date,
  stripe_customer_id,
  stripe_subscription_id
FROM profiles
WHERE membership != 'free'
  AND subscription_status IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_memberships um WHERE um.user_id = profiles.id AND um.status = 'active'
  );

-- 验证
SELECT 'user_memberships 表创建完成' AS status;
SELECT count(*) AS existing_active FROM user_memberships WHERE status = 'active';
