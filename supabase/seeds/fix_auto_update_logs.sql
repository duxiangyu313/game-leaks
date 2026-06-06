CREATE TABLE IF NOT EXISTS auto_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  games_updated INTEGER DEFAULT 0,
  games_released TEXT[] DEFAULT '{}',
  leaks_published INTEGER DEFAULT 0,
  memberships_expired INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE auto_update_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone read logs" ON auto_update_logs;
CREATE POLICY "Anyone read logs" ON auto_update_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone insert logs" ON auto_update_logs;
CREATE POLICY "Anyone insert logs" ON auto_update_logs FOR INSERT WITH CHECK (true);

SELECT 'auto_update_logs 创建完成' AS status;
