-- ════════════════════════════════════════════════════════════════
-- game_progress 表数据审计
-- ════════════════════════════════════════════════════════════════

-- ── 1. 总览 ────────────────────────────────────────────
SELECT
  COUNT(*) AS 总记录数,
  COUNT(*) FILTER (WHERE development_stage = '已发售') AS 已发售,
  COUNT(*) FILTER (WHERE development_stage != '已发售') AS 开发中,
  COUNT(*) FILTER (WHERE public_info IS NULL OR public_info = '') AS 缺公开信息,
  COUNT(*) FILTER (WHERE gold_info IS NULL OR gold_info = '') AS 缺Gold信息,
  COUNT(*) FILTER (WHERE diamond_info IS NULL OR diamond_info = '') AS 缺Diamond信息,
  COUNT(*) FILTER (WHERE risk_assessment IS NULL OR risk_assessment = '') AS 缺风险评估,
  COUNT(*) FILTER (WHERE cover_url IS NULL OR cover_url = '') AS 缺封面,
  COUNT(*) FILTER (WHERE developer IS NULL OR developer = '') AS 缺开发商,
  COUNT(*) FILTER (WHERE estimated_release_date IS NULL OR estimated_release_date = '') AS 缺发售日
FROM game_progress;

-- ── 2. 所有游戏列表 + 字段完整性 ──────────────────────
SELECT
  name AS 游戏名,
  development_stage AS 开发阶段,
  developer AS 开发商,
  estimated_release_date AS 预计发售,
  credibility_score AS 可信度,
  is_featured AS 精选,
  last_updated AS 最后更新,
  CASE WHEN public_info IS NULL OR public_info = '' THEN '❌' ELSE '✅' END AS 公开信息,
  CASE WHEN gold_info IS NULL OR gold_info = '' THEN '❌' ELSE '✅' END AS Gold信息,
  CASE WHEN diamond_info IS NULL OR diamond_info = '' THEN '❌' ELSE '✅' END AS Diamond信息,
  CASE WHEN risk_assessment IS NULL OR risk_assessment = '' THEN '❌' ELSE '✅' END AS 风险评估,
  CASE WHEN cover_url IS NULL OR cover_url = '' THEN '❌' ELSE '✅' END AS 封面
FROM game_progress
ORDER BY
  CASE development_stage
    WHEN '概念阶段' THEN 1
    WHEN '原型开发' THEN 2
    WHEN '开发中' THEN 3
    WHEN 'Alpha测试' THEN 4
    WHEN 'Beta测试' THEN 5
    WHEN '已获版号' THEN 6
    WHEN '压盘阶段' THEN 7
    WHEN '即将发售' THEN 8
    WHEN '已发售' THEN 9
    ELSE 0
  END,
  credibility_score DESC NULLS LAST;

-- ── 3. 已发售但还在追踪列表里的 ────────────────────────
SELECT
  name AS 游戏名,
  development_stage AS 开发阶段,
  estimated_release_date AS 发售日,
  last_updated AS 最后更新
FROM game_progress
WHERE development_stage = '已发售'
ORDER BY estimated_release_date DESC;

-- ── 4. 开发阶段分布 ────────────────────────────────────
SELECT
  development_stage AS 开发阶段,
  COUNT(*) AS 数量
FROM game_progress
GROUP BY development_stage
ORDER BY COUNT(*) DESC;
