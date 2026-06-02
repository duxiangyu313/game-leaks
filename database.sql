-- ═══════════════════════════════════════════
-- 国游爆料 · 会员系统数据库Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ═══════════════════════════════════════════

-- 1. 会员等级枚举
CREATE TYPE membership_tier AS ENUM ('free', 'silver', 'gold', 'diamond');

-- 2. 用户档案扩展 (关联 Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar TEXT,
  membership membership_tier DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive', -- active, past_due, canceled
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 支付记录
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- 单位：分 (cents)
  currency TEXT DEFAULT 'cny',
  tier membership_tier NOT NULL,
  billing_cycle TEXT NOT NULL, -- 'monthly' | 'yearly'
  status TEXT DEFAULT 'pending', -- pending, completed, refunded, failed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 退款申请
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 内容权限配置
CREATE TABLE content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'article', 'leak', 'analysis', 'devlog'
  content_id TEXT NOT NULL,
  required_tier membership_tier DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_profiles_membership ON profiles(membership);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_session ON payments(stripe_session_id);
CREATE INDEX idx_content_access_tier ON content_access(required_tier);

-- RLS 策略：用户只能读取自己的档案
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users read own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own refunds" ON refunds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own refunds" ON refunds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public read content_access" ON content_access
  FOR SELECT USING (true);

-- 触发器：新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, membership)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
