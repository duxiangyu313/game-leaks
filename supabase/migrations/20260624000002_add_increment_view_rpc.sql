-- Migration: 创建浏览量增加 RPC 函数
-- Date: 2026-06-24
-- Description: 用于异步安全增加爆料/文章的浏览量

CREATE OR REPLACE FUNCTION increment_view(leak_id UUID DEFAULT NULL, article_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF leak_id IS NOT NULL THEN
    UPDATE leaks SET view_count = COALESCE(view_count, 0) + 1 WHERE id = leak_id;
  END IF;
  IF article_id IS NOT NULL THEN
    UPDATE articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = article_id;
  END IF;
END;
$$;

-- 授予 anon 角色执行权限
GRANT EXECUTE ON FUNCTION increment_view TO anon, authenticated;
