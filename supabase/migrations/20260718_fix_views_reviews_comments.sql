-- ═══════════════════════════════════════════
-- 修复: increment_view RPC + game_reviews 评测表 + game_comments 评论表
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

-- ═══ 1. increment_view RPC（文章/爆料浏览计数递增）═══
CREATE OR REPLACE FUNCTION public.increment_view(article_id uuid DEFAULT NULL, leak_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF article_id IS NOT NULL THEN
    UPDATE public.articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = article_id;
  ELSIF leak_id IS NOT NULL THEN
    UPDATE public.leaks SET view_count = COALESCE(view_count, 0) + 1 WHERE id = leak_id;
  END IF;
END;
$$;

-- ═══ 2. game_reviews 游戏评测（深度评测）═══
CREATE TABLE IF NOT EXISTS public.game_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 10),
  platform text,
  playtime_hours numeric,
  pros text,
  cons text,
  images jsonb DEFAULT '[]'::jsonb,
  video_url text,
  helpful_count integer DEFAULT 0,
  is_editor_pick boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_game_reviews_game ON public.game_reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_game_reviews_user ON public.game_reviews(user_id);

ALTER TABLE public.game_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gr_select" ON public.game_reviews FOR SELECT USING (true);
CREATE POLICY "gr_insert" ON public.game_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gr_update_own" ON public.game_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gr_delete_own" ON public.game_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══ 3. game_comments 游戏简评（短评+打分）═══
CREATE TABLE IF NOT EXISTS public.game_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 10),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_game_comments_game ON public.game_comments(game_id);

ALTER TABLE public.game_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gc_select" ON public.game_comments FOR SELECT USING (true);
CREATE POLICY "gc_insert" ON public.game_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gc_delete_own" ON public.game_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 灌3条评测样例（归唐/古剑/黑神话）
INSERT INTO public.game_reviews (game_id, user_id, title, content, rating, platform, playtime_hours, pros, cons, is_editor_pick)
SELECT id, (SELECT id FROM public.profiles WHERE membership='diamond' LIMIT 1),
  '归唐：一场穿越河西走廊的沉浸式动作盛宴',
  E'作为国产3A在SGF上全球首曝的作品，归唐给人的第一印象是视觉冲击力。UE5全套技术栈（Lumen+Nanite+Virtual Shadow Maps）的加持下，敦煌和河西走廊被还原到了令人震撼的程度。\n\n战斗系统采用写实近战格斗+潜行，手感偏硬核，需要适应帧数窗口。18分钟实机演示中的攻城战场面最为惊艳——同屏单位数量、火光粒子效果、破坏物理都达到了国际一流水平。\n\n目前最大不确定因素是发售日期。但考虑到网易全资支持+数毛社/Kotaku/IGN已给出正面评价，归唐大概率会成为国产3A第二座里程碑。',
  8.5, 'PC', 3, '顶级画面表现力、历史题材深度、数毛社认可的技术力', '发售日期未公布、战斗手感需上手适应', true
FROM public.games WHERE title = '归唐' AND NOT EXISTS (SELECT 1 FROM public.game_reviews WHERE title LIKE '归唐%')
LIMIT 1;

INSERT INTO public.game_reviews (game_id, user_id, title, content, rating, platform, pros, cons, is_featured)
SELECT id, (SELECT id FROM public.profiles WHERE membership='diamond' LIMIT 1),
  '古剑：烛龙的UE5第一战——幽冥国风美学的一次豪赌',
  E'7月18日线下试玩会前夕，所有人都在问同一个问题：烛龙能不能用UE5做出让人满意的动作系统？\n\n从已公开的信息看，古剑的美术方向是对的——"幽冥国风"这个定位精准避开了和黑神话的写实硬核硬碰硬，选择了更有辨识度的志怪审美。Boss"彩衣侯·空空子"融合非遗古彩戏法元素的设计思路也让人眼前一亮。\n\n但风险在于：SGF首曝时动作手感受到质疑，这次官方把战斗系统放C位展示，既是回应质疑也是孤注一掷。如果试玩能证明动作手感过关，古剑将是国产3A第三棒的最强候选。',
  7.5, 'PC', '独特幽冥国风美学定位、武器切换+灵兽协同创新机制', '动作手感待验证、发售日期未公布', true
FROM public.games WHERE title = '古剑' AND NOT EXISTS (SELECT 1 FROM public.game_reviews WHERE title LIKE '古剑%')
LIMIT 1;

INSERT INTO public.game_reviews (game_id, user_id, title, content, rating, platform, playtime_hours, pros, cons, is_editor_pick, is_featured)
SELECT id, (SELECT id FROM public.profiles WHERE membership='diamond' LIMIT 1),
  '黑神话悟空：由中国玩家见证的里程碑——3000万份之后，没有回头路',
  E'从2024年8月20日至今，黑神话悟空用3000万份的全球销量证明了：中国单机游戏可以站着把钱挣了。\n\n回看这款游戏，最核心的成就不在销量数字，而在于它证明了"中国文化+顶级制作=全球市场接受"这个等式的成立。海外过半的销量占比是最强的背书——让老外克服文化鸿沟的，不是西游记原作知识，而是Boss战的震撼力和美术的感染力。\n\n续作钟馗选择"生死"这个全人类共通的命题作为叙事核心，是在有意识地降低海外理解门槛。多武器系统的加入则回应了悟空最大的玩法遗憾——主武器只有棍棒。\n\n唯一需要警醒的是：钟馗2025年6月才全面启动开发，距今刚满一年。别催游科。',
  9.5, 'PC/PS5/XSX', 120, 'Boss战设计世界顶级、美术/音乐/演出全维度工业水准、文化输出标杆级', '关卡设计线性、武器种类单一、续作开发进度需耐心等待', true, true
FROM public.games WHERE title = '黑神话：悟空' AND NOT EXISTS (SELECT 1 FROM public.game_reviews WHERE title LIKE '黑神话悟空%')
LIMIT 1;

SELECT 'RPC + reviews + comments ready: '
  || (SELECT count(*) FROM public.game_reviews) || ' reviews, '
  || (SELECT count(*) FROM public.game_comments) || ' comments' AS status;
