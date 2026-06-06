-- 修复社区成员计数为 0 的问题
-- 原因: profiles 表 RLS 策略限制匿名用户只能查看自己的 profile，导致 COUNT 返回 0

-- 方案1: 添加允许公开计数的 RLS 策略（推荐）
CREATE POLICY "Allow public count" ON profiles
  FOR SELECT
  USING (true);

-- 方案2: 如果 site_stats VIEW 不存在，创建它
-- DROP VIEW IF EXISTS site_stats;
-- CREATE VIEW site_stats AS
-- SELECT
--   (SELECT COUNT(*) FROM games) AS total_games,
--   (SELECT COUNT(*) FROM leaks WHERE status = 'published') AS total_leaks,
--   (SELECT COUNT(*) FROM profiles) AS total_members,
--   (SELECT COUNT(*) FROM games WHERE status = 'released') AS released_games;

-- 验证
SELECT COUNT(*) AS member_count FROM profiles;
