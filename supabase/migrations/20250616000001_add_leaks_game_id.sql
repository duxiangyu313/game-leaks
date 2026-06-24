-- ============================================================
-- 为 leaks 表添加 game_id 外键列
-- 修复：爆料详情页游戏链接指向 leak 自身 ID 而非游戏 ID
-- 执行方式：在 Supabase SQL Editor 中直接运行
-- ============================================================

-- 1. 添加 game_id 列
ALTER TABLE leaks ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE SET NULL;

-- 2. 根据 game_name 回填已有数据的 game_id
UPDATE leaks SET game_id = (SELECT id FROM games WHERE title = leaks.game_name LIMIT 1)
WHERE game_name IS NOT NULL AND game_id IS NULL;

-- 3. 验证
SELECT id, title, game_name, game_id FROM leaks ORDER BY published_at DESC LIMIT 10;
