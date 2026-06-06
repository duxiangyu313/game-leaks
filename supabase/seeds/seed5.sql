-- 游戏系统配置要求
CREATE TABLE IF NOT EXISTS game_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL UNIQUE,
  os_min TEXT, os_rec TEXT,
  cpu_min TEXT, cpu_rec TEXT,
  gpu_min TEXT, gpu_rec TEXT,
  ram_min TEXT, ram_rec TEXT,
  storage_min TEXT, storage_rec TEXT,
  directx TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read game_requirements" ON game_requirements FOR SELECT USING (true);

-- 游戏事件日历
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('release','beta','livestream','conference','demo','update','other')),
  event_date DATE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#06B6D4',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read game_events" ON game_events FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_events_date ON game_events(event_date);

-- 编辑评分
CREATE TABLE IF NOT EXISTS game_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  title TEXT,
  content TEXT NOT NULL,
  pros TEXT, cons TEXT,
  playtime_hours INTEGER,
  is_editor_pick BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, user_id)
);
ALTER TABLE game_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON game_reviews FOR SELECT USING (true);
CREATE POLICY "Users insert reviews" ON game_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 种子数据：游戏配置要求
INSERT INTO game_requirements (game_id, os_min, cpu_min, gpu_min, ram_min, storage_min, os_rec, cpu_rec, gpu_rec, ram_rec, storage_rec) VALUES
((SELECT id FROM games WHERE title='黑神话：悟空' LIMIT 1), 'Windows 10 64-bit', 'Intel Core i5-8400 / AMD Ryzen 5 1600', 'NVIDIA GTX 1060 6GB / AMD RX 580 8GB', '16 GB', '130 GB SSD', 'Windows 10 64-bit', 'Intel Core i7-9700 / AMD Ryzen 5 5500', 'NVIDIA RTX 4070 / AMD RX 7800 XT', '32 GB', '130 GB SSD'),
((SELECT id FROM games WHERE title='影之刃零' LIMIT 1), 'Windows 10 64-bit', 'Intel Core i5-10400 / AMD Ryzen 5 3600', 'NVIDIA RTX 2060 / AMD RX 6600', '16 GB', '100 GB SSD', 'Windows 10 64-bit', 'Intel Core i7-12700 / AMD Ryzen 7 7700', 'NVIDIA RTX 4070 / AMD RX 7800 XT', '32 GB', '100 GB SSD'),
((SELECT id FROM games WHERE title='湮灭之潮' LIMIT 1), 'Windows 10 64-bit', 'Intel Core i5-12400 / AMD Ryzen 5 7600', 'NVIDIA RTX 3060 / AMD RX 6700 XT', '16 GB', '120 GB SSD', 'Windows 11 64-bit', 'Intel Core i7-13700 / AMD Ryzen 7 7800X3D', 'NVIDIA RTX 4080 / AMD RX 7900 XT', '32 GB', '120 GB SSD'),
((SELECT id FROM games WHERE title='归唐' LIMIT 1), 'Windows 10 64-bit', 'Intel Core i5-10400 / AMD Ryzen 5 3600', 'NVIDIA RTX 2070 / AMD RX 6700 XT', '16 GB', '100 GB SSD', 'Windows 10 64-bit', 'Intel Core i7-12700 / AMD Ryzen 7 7700', 'NVIDIA RTX 4080 / AMD RX 7900 XT', '32 GB', '100 GB SSD');

-- 种子数据：游戏事件
INSERT INTO game_events (game_id, title, event_type, event_date, description, color) VALUES
((SELECT id FROM games WHERE title='归唐' LIMIT 1), '归唐 SGF 2026 全球首秀', 'conference', '2026-06-06', '夏日游戏节主秀实机演示', '#E94560'),
((SELECT id FROM games WHERE title='影之刃零' LIMIT 1), '影之刃零 正式发售', 'release', '2026-09-09', '全球同步上线 PC/PS5', '#10B981'),
((SELECT id FROM games WHERE title='湮灭之潮' LIMIT 1), '湮灭之潮 成都线下试玩会', 'demo', '2026-08-15', '成都线下试玩，全体玩家开放报名', '#F59E0B'),
((SELECT id FROM games WHERE title='望月' LIMIT 1), '望月 广州线下试玩会', 'demo', '2026-06-19', '广州线下试玩，开放世界体验', '#06B6D4'),
((SELECT id FROM games WHERE title='燕云十六声' LIMIT 1), '燕云十六声 Beta测试', 'beta', '2026-07-01', '首次公开Beta测试', '#8B5CF6'),
(NULL, 'ChinaJoy 2026 国产3A专场', 'conference', '2026-07-28', 'Chinajoy游戏展，多款国产3A参展', '#EC4899'),
(NULL, 'B站高能电玩节 夏季篇', 'livestream', '2026-06-15', 'B站游戏发布会，国产3A最新动态', '#06B6D4');

-- 统计数据视图
CREATE OR REPLACE VIEW site_stats AS
SELECT
  (SELECT COUNT(*) FROM games) AS total_games,
  (SELECT COUNT(*) FROM leaks WHERE status='published') AS total_leaks,
  (SELECT COUNT(*) FROM profiles) AS total_members,
  (SELECT COUNT(*) FROM games WHERE status='released') AS total_released;
