-- 预购提醒订阅表
CREATE TABLE IF NOT EXISTS preorder_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, email)
);
ALTER TABLE preorder_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert subscription" ON preorder_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read subscriptions" ON preorder_subscriptions FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE membership = 'diamond'));
CREATE INDEX IF NOT EXISTS idx_preorder_game ON preorder_subscriptions(game_id);
