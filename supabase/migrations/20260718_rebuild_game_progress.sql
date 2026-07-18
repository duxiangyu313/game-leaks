-- ═══════════════════════════════════════════
-- 重建游戏开发进度表（/games/progress 页面依赖，数据库简化时被误删）
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.game_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cover_url text,
  developer text,
  publisher text,
  genre text,
  development_stage text NOT NULL DEFAULT '概念阶段'
    CHECK (development_stage IN ('概念阶段','原型开发','Alpha测试','Beta测试','压盘阶段','已发售')),
  estimated_release_date text,
  team_size integer,
  last_updated timestamptz DEFAULT now(),
  credibility_score integer DEFAULT 5 CHECK (credibility_score BETWEEN 0 AND 10),
  public_info text DEFAULT '',
  gold_info text DEFAULT '',
  diamond_info text DEFAULT '',
  risk_assessment text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gp_select" ON public.game_progress FOR SELECT USING (true);
CREATE POLICY "gp_write_admin" ON public.game_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));

-- 从 games 库灌入开发进度（status → development_stage 映射）
INSERT INTO public.game_progress (name, developer, publisher, genre, development_stage, estimated_release_date, credibility_score, cover_url, is_featured, tags, last_updated)
SELECT
  g.title,
  g.developer,
  g.publisher,
  NULL,
  CASE
    WHEN g.status = 'released' THEN '已发售'
    WHEN g.status = 'early_access' THEN 'Beta测试'
    WHEN g.status = 'beta' OR g.status = 'playtest' THEN 'Beta测试'
    WHEN g.status = 'alpha' THEN 'Alpha测试'
    WHEN g.status = 'announced' THEN '概念阶段'
    WHEN g.status = 'in_development' THEN '原型开发'
    WHEN g.status = 'pre_alpha' THEN '原型开发'
    ELSE '概念阶段'
  END,
  g.release_date,
  COALESCE(g.hype_score, 5),
  g.cover_image,
  g.hype_score >= 8,
  ARRAY[]::text[],
  GREATEST(g.updated_at, g.created_at, '2026-06-01'::timestamptz)
FROM public.games g
WHERE NOT EXISTS (SELECT 1 FROM public.game_progress gp WHERE gp.name = g.title);

-- 为归唐、黑神话、影之刃零补充手工描述（gold_info/risk_assessment 等付费深度内容）
UPDATE public.game_progress SET
  public_info = '归唐是网易临安24工作室开发的三A级线性叙事动作冒险游戏，改编自晚唐张议潮归义军收复河西的真实历史。采用虚幻引擎5，确认使用Lumen全局光照、Nanite微多边形几何系统和Virtual Shadow Maps虚拟阴影贴图。PS5 Pro已在测试中。制作人金亨泰试玩后盛赞"超出想象"，数毛社认可写实画质。IGN已进行深度专访。',
  gold_info = '归唐采用线性叙事驱动，主打写实近战格斗与潜行玩法。开发团队实地前往敦煌进行三维扫描，构建了基于物理的真实材质系统（砖块/皮革/布料/羊皮纸）。游戏收录了体积光照、可破坏环境、漂浮尘埃粒子、互动野生动物及流体模拟效果。18分钟实机已公开。',
  developer = '网易雷火·临安24工作室',
  genre = '动作冒险',
  estimated_release_date = 'TBA',
  credibility_score = 9,
  risk_assessment = '低风险：网易全资支持，技术实力已验证，数毛社+Kotaku等多海外媒体盛赞。唯一不确定性为发售日期未公布，且暑期档竞争激烈。',
  last_updated = '2026-07-14T00:00:00Z'
WHERE name = '归唐';

UPDATE public.game_progress SET
  public_info = '黑神话悟空是游戏科学开发的西游题材动作RPG，2024年8月20日发售，全球销量突破3000万份（海外过半），营收超90亿人民币。Boss战设计被誉为业界顶尖，获得央视焦点访谈+共青团中央报告+金摇杆年度游戏等多项国家级/国际级认可。2026年7月起全球音乐会巡演（洛杉矶卡内基等世界顶级音乐厅），续作《黑神话：钟馗》已官宣开发。',
  gold_info = '悟空采用UE5，主打多Boss战驱动体验。续作钟馗已确认：多武器系统（主武器可能为剑）、生死主题叙事（降低海外文化门槛）、画质目标超越悟空、延续Boss战核心设计，计划每年至少一支预告片。开发已于2025年6月全面启动。',
  developer = '游戏科学',
  publisher = '游戏科学',
  genre = '动作RPG',
  credibility_score = 10,
  risk_assessment = '零风险（已发售）：3000万销量+业界顶级口碑。唯一风险为续作钟馗体量是否足够支撑市场期待，但品牌红利+soulslike赛道持续增长=容错空间极大。',
  last_updated = '2026-07-17T00:00:00Z'
WHERE name = '黑神话：悟空';

UPDATE public.game_progress SET
  public_info = '影之刃零是灵游坊开发的黑暗武侠动作RPG，采用UE5打造"武侠朋克"风格。曾在S-Party 2025千人线下试玩，IGN放出22分钟实机演示。游戏将推出专属State of Play专场，确认为PS5限时独占。',
  gold_info = '核心设计：高速连击+格挡反击+暗器系统，Boss设计受FromSoftware影响但更强调速度和招式演出。已展示全部内容均为支线，主线体量据传远超预期。确认10月29日全球发售。冯骥公开力挺。',
  developer = '灵游坊',
  genre = '动作RPG',
  estimated_release_date = '2026-10-29',
  credibility_score = 9,
  risk_assessment = '低风险：已定档10月29日，PS专属State of Play背书，冯骥公开力挺。唯一顾虑为灵游坊此前未做过3A体量项目，但试玩反馈+IGN实机+制作人过往口碑均正面。',
  last_updated = '2026-07-13T00:00:00Z'
WHERE name = '影之刃零';

UPDATE public.game_progress SET
  public_info = '湮灭之潮是腾讯旗下日蚀边缘工作室（持股95%）开发的骑士幻想动作RPG。UE5买断制，以异世界入侵下的破碎伦敦×亚瑟王传说为背景，主角格雯德琳可召唤圆桌骑士协同作战。2026年8月15日成都千人试玩，8月26日科隆游戏展海外首次试玩。',
  developer = '日蚀边缘工作室（腾讯天游持股95%）',
  genre = '动作RPG',
  estimated_release_date = 'TBA',
  credibility_score = 8,
  is_featured = true,
  last_updated = '2026-07-17T00:00:00Z'
WHERE name = '湮灭之潮';

UPDATE public.game_progress SET
  public_info = '古剑（古剑奇谭四）是上海烛龙开发的UE5动作RPG，玩家扮演"地界司判"游走阴阳两界，中式志怪+幽冥国风。买断制登陆PC/PS5/XSX。2026年7月18日上海美术馆首次大规模线下试玩会，以战斗系统为核心展示。',
  developer = '上海烛龙工作室',
  genre = '动作RPG',
  estimated_release_date = 'TBA',
  credibility_score = 7,
  is_featured = true,
  last_updated = '2026-07-17T00:00:00Z'
WHERE name = '古剑';

SELECT 'game_progress rebuilt: ' || (SELECT count(*) FROM public.game_progress) || ' games tracked' AS status;
