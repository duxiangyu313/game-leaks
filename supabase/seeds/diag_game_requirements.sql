-- 快速诊断:数据量 + 哪些游戏有配置 + games表前10个title
SELECT '=== 数据量 ===' AS info;
SELECT COUNT(*) AS total_rows FROM game_requirements;

SELECT '=== 有配置的游戏 ===' AS info;
SELECT g.title, r.cpu_min, r.ram_min
FROM game_requirements r
JOIN games g ON g.id = r.game_id
LIMIT 10;

SELECT '=== games表前10个title ===' AS info;
SELECT title FROM games ORDER BY hype_score DESC NULLS LAST LIMIT 10;
