-- ════════════════════════════════════════════════════════════════
-- 国游温度计 · 游戏数据全面审计 (精简版)
-- 只查 games 表本身 + game_requirements (已确认存在)
-- ════════════════════════════════════════════════════════════════

-- ── 1. 总览:所有游戏状态分布 ──────────────────────────
SELECT
  COALESCE(status, '(NULL)') AS 状态,
  COUNT(*) AS 数量
FROM games
GROUP BY status
ORDER BY 数量 DESC;

-- ── 2. 状态过时:已发售但状态不是 released ──────────────
SELECT
  title AS 游戏名,
  status AS 当前状态,
  release_date AS 发售日,
  developer AS 开发商,
  hype_score AS 热度
FROM games
WHERE release_date IS NOT NULL
  AND release_date != ''
  AND release_date ~ '^\d{4}-\d{2}-\d{2}'
  AND release_date::DATE < NOW()::DATE
  AND status != 'released'
ORDER BY release_date;

-- ── 3. 已发售游戏的字段完整性 ──────────────────────────
SELECT
  title AS 游戏名,
  release_date AS 发售日,
  hype_score AS 热度,
  CASE WHEN description IS NULL OR description = '' THEN '❌' ELSE '✅' END AS 描述,
  CASE WHEN cover IS NULL OR cover = '' THEN '❌' ELSE '✅' END AS 封面,
  CASE WHEN rating IS NULL THEN '❌' ELSE '✅' END AS 评分,
  CASE WHEN genre IS NULL OR array_length(genre, 1) IS NULL THEN '❌' ELSE '✅' END AS 类型,
  CASE WHEN platforms IS NULL OR array_length(platforms, 1) IS NULL THEN '❌' ELSE '✅' END AS 平台,
  CASE WHEN developer IS NULL OR developer = '' THEN '❌' ELSE '✅' END AS 开发商,
  CASE WHEN publisher IS NULL OR publisher = '' THEN '❌' ELSE '✅' END AS 发行商
FROM games
WHERE status = 'released'
ORDER BY hype_score DESC NULLS LAST;

-- ── 4. 未发售游戏的字段完整性 ──────────────────────────
SELECT
  title AS 游戏名,
  status AS 状态,
  release_date AS 预期发售,
  hype_score AS 热度,
  CASE WHEN description IS NULL OR description = '' THEN '❌' ELSE '✅' END AS 描述,
  CASE WHEN cover IS NULL OR cover = '' THEN '❌' ELSE '✅' END AS 封面,
  CASE WHEN developer IS NULL OR developer = '' THEN '❌' ELSE '✅' END AS 开发商,
  CASE WHEN genre IS NULL OR array_length(genre, 1) IS NULL THEN '❌' ELSE '✅' END AS 类型,
  CASE WHEN platforms IS NULL OR array_length(platforms, 1) IS NULL THEN '❌' ELSE '✅' END AS 平台
FROM games
WHERE status != 'released'
ORDER BY hype_score DESC NULLS LAST;

-- ── 5. 配置要求覆盖情况 ────────────────────────────────
SELECT
  g.title AS 游戏名,
  g.status AS 状态,
  CASE WHEN req.game_id IS NOT NULL THEN '✅有配置' ELSE '❌无配置' END AS 配置
FROM games g
LEFT JOIN game_requirements req ON req.game_id = g.id
ORDER BY g.hype_score DESC NULLS LAST, g.title;

-- ── 6. 完全空壳游戏:缺描述+缺封面+无配置 ───────────────
SELECT
  title AS 游戏名,
  status AS 状态,
  hype_score AS 热度,
  release_date AS 发售日
FROM games g
WHERE (description IS NULL OR description = '')
  AND (cover IS NULL OR cover = '')
  AND NOT EXISTS (SELECT 1 FROM game_requirements req WHERE req.game_id = g.id)
ORDER BY hype_score DESC NULLS LAST;

-- ── 7. 高热度但内容缺失(优先补) ───────────────────────
SELECT
  title AS 游戏名,
  hype_score AS 热度,
  status AS 状态,
  CASE WHEN description IS NULL OR description = '' THEN '❌缺描述' ELSE '' END AS 描述,
  CASE WHEN cover IS NULL OR cover = '' THEN '❌缺封面' ELSE '' END AS 封面,
  CASE WHEN rating IS NULL THEN '❌缺评分' ELSE '' END AS 评分,
  CASE WHEN NOT EXISTS (SELECT 1 FROM game_requirements req WHERE req.game_id = g.id) THEN '❌缺配置' ELSE '' END AS 配置,
  CASE WHEN developer IS NULL OR developer = '' THEN '❌缺开发商' ELSE '' END AS 开发商
FROM games g
WHERE hype_score >= 60
  AND (
    description IS NULL OR description = ''
    OR cover IS NULL OR cover = ''
    OR rating IS NULL
    OR developer IS NULL OR developer = ''
    OR NOT EXISTS (SELECT 1 FROM game_requirements req WHERE req.game_id = g.id)
  )
ORDER BY hype_score DESC;
