-- 扩展 development_stage 允许值，支持更细粒度的进度跟踪
-- 在 Supabase Dashboard → SQL Editor 执行，或通过部署自动执行

ALTER TABLE public.game_progress
  DROP CONSTRAINT IF EXISTS game_progress_development_stage_check;

ALTER TABLE public.game_progress
  ADD CONSTRAINT game_progress_development_stage_check
  CHECK (development_stage IN (
    '概念阶段',
    '原型开发',
    'Alpha测试',
    'Beta测试',
    '压盘阶段',
    '已发售',
    '已获版号',
    '即将发售',
    '开发中'
  ));

SELECT 'development_stage constraint expanded to 9 values' AS status;
