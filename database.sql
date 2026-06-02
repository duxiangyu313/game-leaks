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

-- 6. 文章表
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'analysis',
  required_tier membership_tier DEFAULT 'free',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- draft, published, scheduled
  scheduled_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access articles" ON articles USING (auth.uid() IN (SELECT id FROM profiles WHERE membership = 'diamond'));

-- 7. 爆料表
CREATE TABLE leaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  source TEXT,
  credibility TEXT DEFAULT 'rumor',
  game_name TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE leaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published leaks" ON leaks FOR SELECT USING (status = 'published');

-- 8. 游戏表
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  english_title TEXT,
  cover TEXT,
  developer TEXT,
  publisher TEXT,
  genre TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  release_date TEXT,
  status TEXT DEFAULT 'in-dev',
  description TEXT DEFAULT '',
  hype_score INTEGER DEFAULT 50,
  rating NUMERIC(2,1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read games" ON games FOR SELECT USING (true);

-- 9. 管理员操作日志
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  detail TEXT,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_leaks_status ON leaks(status);
CREATE INDEX idx_leaks_scheduled ON leaks(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);
