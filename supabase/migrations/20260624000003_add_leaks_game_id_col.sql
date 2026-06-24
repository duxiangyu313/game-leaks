-- Migration: leaks 表补充 game_id 列
-- Date: 2026-06-24
-- Description: 允许爆料直接关联游戏 ID（之前只有 game_name 文本字段）

ALTER TABLE leaks ADD COLUMN IF NOT EXISTS game_id UUID REFERENCES games(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leaks_game_id ON leaks(game_id);
