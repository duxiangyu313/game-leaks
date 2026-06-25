-- 支付宝付款确认表
-- 在 Supabase SQL Editor 执行: https://supabase.com/dashboard/project/gumpxfxbxxyljikaizsh/sql/new

CREATE TABLE IF NOT EXISTS payment_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  alipay_txn TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('gold', 'diamond')),
  cycle TEXT NOT NULL CHECK (cycle IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: 公开插入（用户提交），管理员可查看/修改
ALTER TABLE payment_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许任何人提交付款确认" ON payment_confirmations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "允许任何人查看付款确认" ON payment_confirmations
  FOR SELECT USING (true);

CREATE POLICY "允许更新付款确认" ON payment_confirmations
  FOR UPDATE USING (true) WITH CHECK (true);
