-- 删除重复的失落之魂条目（保留杨冰工作室版本 7f7df27c）
-- UltiZero Games 为旧英文名，已合并到杨冰工作室

-- 检查重复
SELECT id, title, developer, status, hype_score FROM games WHERE title = '失落之魂';

-- 删除 UltiZero Games 版本（旧数据/信息不完整）
DELETE FROM games WHERE id = '9445bc46-63d5-418e-a93b-1002ca8909b0' AND title = '失落之魂';

-- 确认删除成功
SELECT id, title, developer, status, hype_score FROM games WHERE title = '失落之魂';
