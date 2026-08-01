-- ══════════════════════════════════════════════════════
-- game_requirements 诊断 + RLS 修复 | 2026-08-01
-- ══════════════════════════════════════════════════════

-- ── 1. 诊断:表里到底有没有数据? ──────────────────
SELECT '=== 1. 数据量 ===' AS info;
SELECT COUNT(*) AS total_rows FROM game_requirements;

-- 看前 5 条
SELECT '=== 2. 前5条数据 ===' AS info;
SELECT
  game_id,
  LEFT(cpu_min, 30) AS cpu_min,
  ram_min,
  storage_min
FROM game_requirements
LIMIT 5;

-- ── 2. 诊断:RLS 状态 ──────────────────────────────
SELECT '=== 3. RLS 状态 ===' AS info;
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  CASE WHEN c.relrowsecurity THEN '✅ 已启用' ELSE '❌ 未启用' END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'game_requirements' AND n.nspname = 'public';

-- ── 3. 诊断:RLS 策略列表 ──────────────────────────
SELECT '=== 4. RLS 策略 ===' AS info;
SELECT
  policyname AS 策略名,
  cmd AS 操作类型,
  qual AS USING表达式,
  with_check AS with_check表达式
FROM pg_policies
WHERE tablename = 'game_requirements' AND schemaname = 'public';

-- ══════════════════════════════════════════════════════
-- 4. 修复:确保 RLS 启用 + 公开 SELECT 策略存在
-- ══════════════════════════════════════════════════════

-- 启用 RLS (已启用则无害)
ALTER TABLE public.game_requirements ENABLE ROW LEVEL SECURITY;

-- 创建公开 SELECT 策略 (已存在则无害, IF NOT EXISTS PG 15+)
-- 兼容写法: 先删再建 (DROP IF EXISTS)
DROP POLICY IF EXISTS "Public read game_requirements" ON public.game_requirements;
CREATE POLICY "Public read game_requirements"
  ON public.game_requirements
  FOR SELECT
  USING (true);

-- 验证修复结果
SELECT '=== 5. 修复后 RLS 策略 ===' AS info;
SELECT
  policyname AS 策略名,
  cmd AS 操作类型
FROM pg_policies
WHERE tablename = 'game_requirements' AND schemaname = 'public';
