-- ═══════════════════════════════════════════
-- UGC 审核通过自动发布管道
-- 审核通过 → category='leak' 发布到 leaks 表 / 其他发布到 articles 表
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.publish_approved_ugc()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  -- 只在状态从非 approved 变为 approved 时发布一次
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    SELECT username INTO uname FROM public.profiles WHERE id = NEW.user_id;

    IF NEW.category = 'leak' THEN
      INSERT INTO public.leaks (title, summary, content, source, credibility, game_name, status, published_at, author_id)
      VALUES (
        NEW.title,
        left(regexp_replace(COALESCE(NEW.content,''), '\*\*[^*]+\*\*: [^\n]*\n?', '', 'g'), 200),
        NEW.content,
        COALESCE(substring(NEW.content from '\*\*来源\*\*: ([^\n]+)'), '用户投稿'),
        CASE
          WHEN NEW.content LIKE '%可信度**: 确认%' THEN 'confirmed'
          WHEN NEW.content LIKE '%可信度**: 传闻%' THEN 'rumor'
          ELSE 'likely'
        END,
        NEW.game_name, 'published', now(), NEW.user_id
      );
    ELSE
      INSERT INTO public.articles (title, content, excerpt, category, required_tier, cover_image, tags, status, author_id, author_name, game_name)
      VALUES (
        NEW.title, NEW.content, left(COALESCE(NEW.content,''), 200),
        COALESCE(NEW.category, 'misc'), NEW.content_level, NEW.cover_image, NEW.tags,
        'published', NEW.user_id, COALESCE(uname, '创作者'), NEW.game_name
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_publish_approved_ugc ON public.ugc_submissions;
CREATE TRIGGER trg_publish_approved_ugc
  AFTER UPDATE ON public.ugc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.publish_approved_ugc();

-- 补发：把已经审核通过但没发布的存量投稿发出去（今天测试的那条）
INSERT INTO public.leaks (title, summary, content, source, credibility, game_name, status, published_at, author_id)
SELECT
  s.title,
  left(regexp_replace(COALESCE(s.content,''), '\*\*[^*]+\*\*: [^\n]*\n?', '', 'g'), 200),
  s.content,
  COALESCE(substring(s.content from '\*\*来源\*\*: ([^\n]+)'), '用户投稿'),
  CASE
    WHEN s.content LIKE '%可信度**: 确认%' THEN 'confirmed'
    WHEN s.content LIKE '%可信度**: 传闻%' THEN 'rumor'
    ELSE 'likely'
  END,
  s.game_name, 'published', now(), s.user_id
FROM public.ugc_submissions s
WHERE s.status = 'approved' AND s.category = 'leak'
  AND NOT EXISTS (SELECT 1 FROM public.leaks l WHERE l.title = s.title);

INSERT INTO public.articles (title, content, excerpt, category, required_tier, cover_image, tags, status, author_id, author_name, game_name)
SELECT
  s.title, s.content, left(COALESCE(s.content,''), 200),
  COALESCE(s.category, 'misc'), s.content_level, s.cover_image, s.tags,
  'published', s.user_id, COALESCE(p.username, '创作者'), s.game_name
FROM public.ugc_submissions s
LEFT JOIN public.profiles p ON p.id = s.user_id
WHERE s.status = 'approved' AND s.category <> 'leak'
  AND NOT EXISTS (SELECT 1 FROM public.articles a WHERE a.title = s.title);

SELECT 'UGC publish pipeline ready, backfilled: '
  || (SELECT count(*) FROM public.leaks WHERE source LIKE '%17173%' OR source = '用户投稿') || ' leak(s) from UGC' AS status;
