-- ════════════════════════════════════════════════════════════════
-- 国游温度计 · 文章评论种子数据
-- 为每篇分析文章添加 2-4 条引发讨论的评论
-- 日期: 2026-08-01
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- 建表 (如果不存在)
-- ════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.post_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  paragraph_index INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 确保 RLS 允许公开读取评论
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public read post_comments" ON post_comments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated insert post_comments" ON post_comments FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ════════════════════════════════════════════════════════════════
-- 获取已有用户 ID, 如果没有则创建临时用户
-- ════════════════════════════════════════════════════════════════
DO $$
DECLARE
  usr1 UUID;
  usr2 UUID;
  usr3 UUID;
  usr4 UUID;
  usr5 UUID;
  art_id UUID;
  art_title TEXT;
  comment_count INTEGER;
BEGIN
  -- 尝试获取已有用户
  SELECT id INTO usr1 FROM auth.users LIMIT 1 OFFSET 0;
  SELECT id INTO usr2 FROM auth.users LIMIT 1 OFFSET 1;
  SELECT id INTO usr3 FROM auth.users LIMIT 1 OFFSET 2;
  SELECT id INTO usr4 FROM auth.users LIMIT 1 OFFSET 3;
  SELECT id INTO usr5 FROM auth.users LIMIT 1 OFFSET 4;

  -- 如果用户不够 5 个, 用第一个用户兜底
  IF usr2 IS NULL THEN usr2 := usr1; END IF;
  IF usr3 IS NULL THEN usr3 := usr1; END IF;
  IF usr4 IS NULL THEN usr4 := usr1; END IF;
  IF usr5 IS NULL THEN usr5 := usr1; END IF;

  -- 如果完全没有用户, 跳过
  IF usr1 IS NULL THEN
    RAISE NOTICE '⚠️ auth.users 表中没有用户, 请先注册至少一个用户再跑此脚本';
    RETURN;
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- 文章 1: 7月版号197款创年内新高
  -- ══════════════════════════════════════════════════════════════
  SELECT id INTO art_id FROM articles WHERE slug = '2026-08-01-version-approval-analysis';
  IF art_id IS NOT NULL THEN
    INSERT INTO post_comments (article_id, user_id, content, created_at) VALUES
      (art_id, usr1, '版号加速发放确实是积极信号，但大家别忘了影之刃零是原创IP，没有西游记这样的国民级认知度。商业上能不能复制黑神话的成功，我个人持谨慎态度。', NOW() - INTERVAL '5 hours'),
      (art_id, usr2, '不同意楼上过于悲观的看法。影之刃系列在核心玩家圈子里认知度很高，而且UE5的画面表现力已经不输国际3A。关键看定价策略和全球发行能力。', NOW() - INTERVAL '4 hours'),
      (art_id, usr3, '说个冷知识：2026年累计1147款版号，月均160+，这发放速度确实在加速。但仔细看名单，大部分还是手游和网游，单机3A占比其实很小。政策是真的在鼓励单机吗？还是只是顺带过审？', NOW() - INTERVAL '3 hours'),
      (art_id, usr4, '灵游坊背后有腾讯增持，资金和发行渠道应该不用担心。真正的问题是：原创武侠IP能不能打动海外玩家？国内玩家可以靠情怀买单，海外可不行。', NOW() - INTERVAL '2 hours');
    RAISE NOTICE '✅ 文章1 评论插入完成';
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- 文章 2: 科隆展位售罄、ChinaJoy开幕
  -- ══════════════════════════════════════════════════════════════
  SELECT id INTO art_id FROM articles WHERE slug = '2026-08-01-china-games-global-expo';
  IF art_id IS NOT NULL THEN
    INSERT INTO post_comments (article_id, user_id, content, created_at) VALUES
      (art_id, usr2, '16家中国厂商集体亮相科隆，这画面确实震撼。但说句实话，有几个是真的靠产品品质去的？别到时候又是一堆手游摊位，跟2021年没啥区别。', NOW() - INTERVAL '5 hours'),
      (art_id, usr5, '楼上怕是没去过科隆现场吧？今年游戏科学、灵游坊、叠纸都有展位，全都是实机试玩。跟几年前只能发传单的待遇完全不同了。', NOW() - INTERVAL '4 hours'),
      (art_id, usr1, '文章说得对，"上桌只是第一步，留在桌上才是考验"。中国游戏在科隆能不能持续拿出好产品才是关键。一年去一次容易，连续五年都去才叫真本事。', NOW() - INTERVAL '3 hours'),
      (art_id, usr3, '有个问题大家没讨论：16家厂商里有多少是去发自己产品的，有多少是去谈代理发行的？这两者的意义完全不同。腾讯Level Infinite带的不全是自家产品吧？', NOW() - INTERVAL '2 hours');
    RAISE NOTICE '✅ 文章2 评论插入完成';
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- 文章 3: 2026下半年国产3A发售日历
  -- ══════════════════════════════════════════════════════════════
  SELECT id INTO art_id FROM articles WHERE slug = '2026-08-01-h2-release-calendar';
  IF art_id IS NOT NULL THEN
    INSERT INTO post_comments (article_id, user_id, content, created_at) VALUES
      (art_id, usr3, '影之刃零Q4发售预测很合理，但我觉得可能更早。版号已经到手，ChinaJoy试玩反响不错，没必要拖到12月。10月发售赶国庆档不好吗？', NOW() - INTERVAL '6 hours'),
      (art_id, usr1, '黑神话钟馗8月实机演示这个消息靠谱吗？游戏科学一向保密做得好，上次科隆放CG的时候连发售窗口都没给。感觉2027年都悬。', NOW() - INTERVAL '5 hours'),
      (art_id, usr4, '雾影猎人7月30日已经发售了，有人玩了来说说体验吗？字节做的魂系，总感觉会差口气...', NOW() - INTERVAL '4 hours'),
      (art_id, usr2, '看了下名单，真正2026年能发售的可能就影之刃零和雾影猎人。其他的基本都是"目标2026"→实际2027的节奏。国产3A的跳票率大家懂的都懂。', NOW() - INTERVAL '3 hours'),
      (art_id, usr5, '归唐没人讨论吗？唐朝背景的3A，光美术风格就足够让我期待了。只是信息确实太少了，希望能尽快看到实机。', NOW() - INTERVAL '2 hours');
    RAISE NOTICE '✅ 文章3 评论插入完成';
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- 文章 4: ChinaJoy 2026现场
  -- ══════════════════════════════════════════════════════════════
  SELECT id INTO art_id FROM articles WHERE slug = '2026-08-01-chinajoy-2025-indie-spotlight';
  IF art_id IS NOT NULL THEN
    INSERT INTO post_comments (article_id, user_id, content, created_at) VALUES
      (art_id, usr1, '人在CJ现场，抵抗者排队确实夸张，等了40分钟。试玩版大概15分钟，氛围营造是真不错，但射击手感还需要打磨。期待正式版。', NOW() - INTERVAL '8 hours'),
      (art_id, usr4, '仙剑四重制版用UE5？这可是个好消息。原版的剧情是系列巅峰，就是画面太老了。只要不魔改剧情，画面焕新就够了。', NOW() - INTERVAL '6 hours'),
      (art_id, usr2, '说句不好听的，CJ上试玩版觉得好≠正式版能好。多少游戏试玩惊艳，发售后拉胯的？还是等媒体评测和玩家口碑再下结论吧。', NOW() - INTERVAL '4 hours'),
      (art_id, usr5, '时空低语有人关注吗？国产科幻3A这个定位太需要了。流浪地球证明了中国人能拍好科幻电影，游戏领域能不能也出一个？', NOW() - INTERVAL '3 hours'),
      (art_id, usr3, '雾影猎人选在CJ前一天发售，这营销策略确实精。但字节做单机...说实话我对互联网大厂做3A的品质一直存疑。有玩了的来说说吗？', NOW() - INTERVAL '2 hours');
    RAISE NOTICE '✅ 文章4 评论插入完成';
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- 文章 5: 叠纸250亿估值 (Gold 专享)
  -- ══════════════════════════════════════════════════════════════
  SELECT id INTO art_id FROM articles WHERE slug = '2026-08-01-papergames-valuation-analysis';
  IF art_id IS NOT NULL THEN
    INSERT INTO post_comments (article_id, user_id, content, created_at) VALUES
      (art_id, usr2, '叠纸做3A最大的优势其实是美术。暖暖系列和恋与深空的3D渲染技术积累是真实的。但做3A动作游戏和做换装/恋爱完全两个赛道，团队基因能转过来吗？', NOW() - INTERVAL '7 hours'),
      (art_id, usr5, '敖尹事件其实暴露了一个根本问题：叠纸想全球化扩张，但核心用户是中国女性玩家。这两个群体的审美差异太大了，不可能两头讨好。', NOW() - INTERVAL '5 hours'),
      (art_id, usr1, '250亿估值主要靠恋与深空撑着，一旦乙女赛道开始下滑，估值就得回调。百面千相短期内不可能贡献营收，这个估值确实有泡沫成分。', NOW() - INTERVAL '3 hours'),
      (art_id, usr3, '文章最后的分析很到位——"从能做好看到能做好玩，中间的距离比想象的远"。叠纸的美术没问题，但3A动作游戏的核心是战斗系统和关卡设计，这些靠美术功底解决不了。', NOW() - INTERVAL '2 hours');
    RAISE NOTICE '✅ 文章5 评论插入完成';
  END IF;

  -- ══════════════════════════════════════════════════════════════
  -- 为其他已有文章也加评论 (按 category = analysis 或 preview)
  -- ══════════════════════════════════════════════════════════════
  FOR art_id, art_title IN
    SELECT id, title FROM articles
    WHERE id NOT IN (
      SELECT DISTINCT article_id FROM post_comments
    )
    AND category IN ('analysis', 'preview', 'news', 'leak', 'review')
    AND status = 'published'
    LIMIT 20
  LOOP
    -- 随机插入 2 条通用讨论评论
    INSERT INTO post_comments (article_id, user_id, content, created_at) VALUES
      (art_id, usr1,
       CASE (RANDOM() * 4)::INT
         WHEN 0 THEN '这篇分析很到位，数据详实。不过我觉得还有一个角度没提到：国产3A的定价策略对市场长期健康发展的影响。'
         WHEN 1 THEN '写得不错，但有一个地方想补充。国产游戏的研发周期普遍偏长，中间的资金压力是外人难以想象的。'
         WHEN 2 THEN '观点新颖，但部分论据感觉还不够充分。希望能看到更多第一手的数据支撑。'
         ELSE '作为一个从黑神话开始关注国产3A的玩家，越来越觉得这个赛道需要更多冷静的分析，少一些盲目吹捧。'
       END,
       NOW() - (RANDOM() * INTERVAL '24 hours')),

      (art_id, usr3,
       CASE (RANDOM() * 4)::INT
         WHEN 0 THEN '同意楼上的部分观点，但不能忽视的是玩家的期待值已经被黑神话拉得太高了。后面的大作压力都不小。'
         WHEN 1 THEN '有个疑问：这些国产3A的成本回收周期一般是多久？光靠国内市场能回本吗？'
         WHEN 2 THEN '其实最关键的还是游戏好玩不好玩，画面和IP都是锦上添花。希望开发者别本末倒置。'
         ELSE '蹲一个后续更新，想看看这些趋势在下半年会不会有变化。'
       END,
       NOW() - (RANDOM() * INTERVAL '12 hours'));

    comment_count := comment_count + 2;
  END LOOP;

  RAISE NOTICE '✅ 其他文章评论插入完成: % 条', comment_count;

  -- 最终统计
  SELECT COUNT(*) INTO comment_count FROM post_comments;
  RAISE NOTICE '══════════════════════════════════════';
  RAISE NOTICE '📊 评论总表数据量: % 条', comment_count;
  RAISE NOTICE '══════════════════════════════════════';
END $$;


-- ════════════════════════════════════════════════════════════════
-- 验证: 各文章评论数
-- ════════════════════════════════════════════════════════════════
SELECT
  a.title,
  a.category,
  COUNT(c.id) AS 评论数
FROM articles a
LEFT JOIN post_comments c ON c.article_id = a.id
WHERE a.status = 'published'
GROUP BY a.id, a.title, a.category
ORDER BY 评论数 DESC, a.title;
