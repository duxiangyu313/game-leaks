-- ════════════════════════════════════════════════════════════════
-- 查看当前 game_progress 所有游戏
-- ════════════════════════════════════════════════════════════════
SELECT id, name, development_stage, estimated_release_date, credibility_score, is_featured
FROM game_progress
ORDER BY name;
