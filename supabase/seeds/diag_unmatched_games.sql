-- ══════════════════════════════════════════════════════
-- 诊断:哪些游戏有配置 / 哪些没配置
-- ══════════════════════════════════════════════════════

-- ── 1. 总览:有配置 vs 没配置 ──────────────────────
SELECT
  CASE WHEN r.game_id IS NOT NULL THEN '✅ 有配置' ELSE '❌ 没配置' END AS 状态,
  COUNT(*) AS 数量
FROM games g
LEFT JOIN game_requirements r ON r.game_id = g.id
GROUP BY 1
ORDER BY 1;

-- ── 2. 没配置的游戏列表(按热度排序) ──────────────
SELECT
  g.title        AS 游戏名,
  g.hype_score   AS 热度,
  g.status       AS 状态,
  g.developer    AS 开发商
FROM games g
LEFT JOIN game_requirements r ON r.game_id = g.id
WHERE r.game_id IS NULL
ORDER BY g.hype_score DESC NULLS LAST, g.title;

-- ── 3. 有配置的游戏列表(确认哪些匹配成功了) ──────
SELECT
  g.title        AS 游戏名,
  g.hype_score   AS 热度,
  r.cpu_min      AS CPU最低,
  r.gpu_min      AS GPU最低,
  r.ram_min || 'GB'  AS 内存最低,
  r.storage_min || 'GB' AS 空间最低
FROM games g
JOIN game_requirements r ON r.game_id = g.id
ORDER BY g.hype_score DESC NULLS LAST, g.title;
