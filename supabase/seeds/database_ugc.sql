-- ═══════════════════════════════════════════
-- 国游爆料 · UGC会员制系统 · 数据库迁移
-- 在 Supabase SQL Editor 中执行此文件
-- ═══════════════════════════════════════════

-- 1. 新增枚举
DO $$ BEGIN CREATE TYPE content_level AS ENUM ('free', 'gold', 'diamond'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payout_method AS ENUM ('alipay', 'wechat'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. 修改现有表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES auth.users(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ip_hash TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS revenue_balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earned INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_level content_level DEFAULT 'free';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_ugc BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS revenue_split INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS can_delete_after TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS related_referral_id UUID;
UPDATE profiles SET membership = 'gold' WHERE membership = 'silver';

-- 3. 新建表
CREATE TABLE IF NOT EXISTS ugc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, content TEXT DEFAULT '', cover_image TEXT,
  category TEXT DEFAULT 'analysis' CHECK (category IN ('preview','analysis','review','leak','news','video','opinion','interview','misc')),
  content_level content_level NOT NULL DEFAULT 'free', game_name TEXT, game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}', status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','revision')),
  reviewer_id UUID REFERENCES auth.users(id), review_note TEXT, revenue_split INTEGER CHECK (revenue_split BETWEEN 0 AND 100),
  submitted_at TIMESTAMPTZ DEFAULT now(), reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ugc_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), submission_id UUID REFERENCES ugc_submissions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, content TEXT DEFAULT '', cover_image TEXT, category TEXT DEFAULT 'analysis',
  content_level content_level NOT NULL DEFAULT 'free', game_name TEXT, game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}', view_count INTEGER DEFAULT 0, like_count INTEGER DEFAULT 0, comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT now(), can_delete_after TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('ugc','article','leak')),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0, revenue_type TEXT NOT NULL CHECK (revenue_type IN ('ad_share','subscription_share','bonus')),
  settlement_month TEXT, settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending','settled','withdrawn')),
  settlement_split INTEGER, notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, method payout_method NOT NULL DEFAULT 'alipay', account_info TEXT NOT NULL,
  real_name TEXT, status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  admin_id UUID REFERENCES auth.users(id), admin_note TEXT, processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT UNIQUE NOT NULL, usage_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, referral_code TEXT NOT NULL,
  reward_days INTEGER NOT NULL DEFAULT 7, reward_applied BOOLEAN DEFAULT false,
  invited_at TIMESTAMPTZ DEFAULT now(), reward_expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ip_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ip_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, registered_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banned_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reason TEXT, banned_by UUID REFERENCES auth.users(id), banned_at TIMESTAMPTZ DEFAULT now(), forfeited_amount INTEGER DEFAULT 0
);

-- 4. 索引
CREATE INDEX IF NOT EXISTS idx_ugc_submissions_status ON ugc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ugc_submissions_user ON ugc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_ugc_content_user ON ugc_content(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_creator ON revenue_records(creator_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_ip_registrations_hash ON ip_registrations(ip_hash);

-- 5. RLS
ALTER TABLE ugc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator read own" ON ugc_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Creator insert" ON ugc_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access" ON ugc_submissions USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE ugc_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON ugc_content FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON ugc_content USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creator read own" ON revenue_records FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Admin full access" ON revenue_records USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User read own" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User insert" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access" ON withdrawal_requests USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON referral_codes FOR SELECT USING (true);

ALTER TABLE referral_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involved users read" ON referral_records FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = invited_user_id);
CREATE POLICY "Admin full access" ON referral_records USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admin write" ON platform_settings USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE ip_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only" ON ip_registrations FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

ALTER TABLE banned_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON banned_accounts FOR SELECT USING (true);
CREATE POLICY "Admin write" ON banned_accounts USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND membership = 'diamond'));

-- 6. 初始数据
INSERT INTO platform_settings (key, value) VALUES ('cold_start', '{"enabled": true, "started_at": "2026-06-12T00:00:00Z", "diamond_split": 50, "withdrawal_min": 2000}') ON CONFLICT (key) DO NOTHING;
INSERT INTO platform_settings (key, value) VALUES ('revenue_splits', '{"free": {"creator_ad_share": 100}, "gold": {"creator_sub_share": 25}, "diamond": {"creator_sub_share": 40, "split_months": [50, 30, 20]}}') ON CONFLICT (key) DO NOTHING;

-- 7. 触发器：新用户自动生成邀请码
CREATE OR REPLACE FUNCTION gen_ref_code() RETURNS TRIGGER AS $$
DECLARE c TEXT;
BEGIN
  c := upper(substring(encode(gen_random_bytes(6), 'hex') for 8));
  INSERT INTO referral_codes (user_id, code) VALUES (NEW.id, c) ON CONFLICT (user_id) DO NOTHING;
  UPDATE profiles SET referral_code = c WHERE id = NEW.id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS trg_ref_code ON profiles;
CREATE TRIGGER trg_ref_code AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION gen_ref_code();

-- 8. 触发器：钻石内容30天删除锁
CREATE OR REPLACE FUNCTION set_diamond_lock() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_level = 'diamond' AND NEW.can_delete_after IS NULL THEN
    NEW.can_delete_after := NEW.published_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_diamond_lock ON ugc_content;
CREATE TRIGGER trg_diamond_lock BEFORE INSERT ON ugc_content FOR EACH ROW EXECUTE FUNCTION set_diamond_lock();

-- 9. 触发器：审核通过→自动发布
CREATE OR REPLACE FUNCTION publish_approved() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO ugc_content (submission_id, user_id, title, content, cover_image, category, content_level, game_name, game_id, tags, published_at)
    VALUES (NEW.id, NEW.user_id, NEW.title, NEW.content, NEW.cover_image, NEW.category, NEW.content_level, NEW.game_name, NEW.game_id, NEW.tags, now());
    NEW.reviewed_at = now();
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_publish ON ugc_submissions;
CREATE TRIGGER trg_publish BEFORE UPDATE ON ugc_submissions FOR EACH ROW EXECUTE FUNCTION publish_approved();
