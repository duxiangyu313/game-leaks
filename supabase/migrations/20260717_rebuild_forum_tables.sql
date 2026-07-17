-- ═══════════════════════════════════════════
-- 重建论坛表 + 在线访客统计表
-- 背景: 数据库简化时 forum_posts / forum_replies 被误删，
--       active_visitors 从未创建 → 论坛页统计一直显示 MOCK 假数据
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

-- 1. 论坛帖子表（结构与 src/types/database.ts 一致）
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category text NOT NULL DEFAULT 'general',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  is_pinned boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 论坛回复表
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  created_at timestamptz DEFAULT now()
);

-- 3. 在线访客心跳表（ForumLiveStats 组件依赖）
CREATE TABLE IF NOT EXISTS public.active_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  last_seen timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_active_visitors_last_seen ON public.active_visitors(last_seen);

-- 心跳插入时顺带清理1小时前的僵尸会话
CREATE OR REPLACE FUNCTION public.purge_stale_visitors()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.active_visitors WHERE last_seen < now() - interval '1 hour';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_purge_stale_visitors ON public.active_visitors;
CREATE TRIGGER trg_purge_stale_visitors
  AFTER INSERT ON public.active_visitors
  FOR EACH STATEMENT EXECUTE FUNCTION public.purge_stale_visitors();

-- 4. RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_visitors ENABLE ROW LEVEL SECURITY;

-- 帖子: 所有人可读；登录用户可发帖；作者可改删；浏览数/回复数计数允许公开更新
CREATE POLICY "forum_posts_select" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "forum_posts_insert" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_posts_update" ON public.forum_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "forum_posts_delete" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 回复: 所有人可读；登录用户可回复；作者可删
CREATE POLICY "forum_replies_select" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "forum_replies_insert" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_replies_delete" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 访客心跳: 匿名可读写（session_id 是随机UUID，无隐私）
CREATE POLICY "active_visitors_select" ON public.active_visitors FOR SELECT USING (true);
CREATE POLICY "active_visitors_insert" ON public.active_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "active_visitors_update" ON public.active_visitors FOR UPDATE USING (true) WITH CHECK (true);

-- 5. 灌水种子帖（结合近期热点，日期分布在近5天）
INSERT INTO public.forum_posts (title, content, category, author_name, view_count, reply_count, is_pinned, created_at) VALUES
('【置顶】欢迎来到国游温度计社区！发帖规则看这里', E'欢迎各位国游爱好者！\n\n本社区板块：\n- 游戏讨论：国产游戏玩法、评测、攻略\n- 爆料讨论：最新爆料的真实性分析\n- 综合讨论：行业观察、杂谈\n\n规则很简单：友善交流、不引战、不人身攻击。爆料请注明来源可信度。', 'general', '国游温度计', 328, 2, true, now() - interval '5 days'),
('古剑四明天试玩！有中签的老哥吗？现场求反馈', E'官方说这次重点展示战斗系统——多场Boss战+独立关卡，还有那个非遗古彩戏法的Boss"彩衣侯·空空子"。\n\nSGF首曝之后动作手感被喷了那么久，这次官方直接把战斗放C位，感觉是要正面回应质疑了。\n\n中签的兄弟试完回来说说真实手感！没中的可以看12:10的官方直播。', 'games', '巡夜司判', 156, 3, false, now() - interval '1 day'),
('异环全球流水14亿但完美世界还亏损，怎么看？', E'财报显示异环截至6月底全球流水破14亿，60%走官方渠道，日本还登顶PS商店。但完美世界上半年预亏8000万-1.2亿。\n\n财经媒体管这叫"打窝"——推广费一次性确认，流水分期确认。Q3才见真章。\n\n大家觉得这种"先亏后赚"的出海模式，中小厂玩得起吗？', 'general', '掌灯人', 89, 2, false, now() - interval '20 hours'),
('湮灭之潮成都试玩报名倒计时！7/23截止', E'8月15-16日成都东郊记忆，千人规模，1小时体验（独立关卡+两场Boss挑战）。\n\n报名7/23就截止了，成都的兄弟抓紧！\n\n顺便说一句，这游戏8月底还要去科隆做海外首试——腾讯这个"资本+中小团队"的模式感觉真要跑通了。', 'games', '蜀中游侠', 67, 1, false, now() - interval '2 days'),
('黑神话钟馗8月会有新预告吗？820还是科隆？', E'游科在3djuegos专访里说了"每年至少一支预告片"，去年8月科隆首曝CG。\n\n所以今年新情报大概率也是8月：要么820（悟空两周年），要么科隆（8/26-30）。\n\n已知信息：生死主题、多武器、画质目标超越悟空。你们赌哪个时间点？', 'leaks', '天命观察员', 142, 2, false, now() - interval '3 days'),
('归唐金亨泰试玩+数毛社认可，网易这次稳了？', E'SGF之后归唐的势头有点猛：金亨泰亲自试玩说"超出想象"、数毛社认可写实画质、IGN深度专访、还跟甘肃文旅厅合作1:1复刻敦煌。\n\n但发售日还是没公布。UE5+Lumen+Nanite全家桶，PS5 Pro都在测了。\n\n就看别再出信任危机那种幺蛾子了……', 'games', '河西信使', 118, 2, false, now() - interval '4 days')
ON CONFLICT DO NOTHING;

-- 6. 种子回复（与 reply_count 对应）
DO $$
DECLARE
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
BEGIN
  SELECT id INTO p1 FROM public.forum_posts WHERE title LIKE '【置顶】欢迎来到国游温度计社区%' LIMIT 1;
  SELECT id INTO p2 FROM public.forum_posts WHERE title LIKE '古剑四明天试玩%' LIMIT 1;
  SELECT id INTO p3 FROM public.forum_posts WHERE title LIKE '异环全球流水14亿%' LIMIT 1;
  SELECT id INTO p4 FROM public.forum_posts WHERE title LIKE '湮灭之潮成都试玩报名%' LIMIT 1;
  SELECT id INTO p5 FROM public.forum_posts WHERE title LIKE '黑神话钟馗8月%' LIMIT 1;
  SELECT id INTO p6 FROM public.forum_posts WHERE title LIKE '归唐金亨泰试玩%' LIMIT 1;

  INSERT INTO public.forum_replies (post_id, content, author_name, created_at) VALUES
  (p1, '来了来了，B站关注过来的！', '温度计粉丝01', now() - interval '4 days'),
  (p1, '终于有个专门聊国产3A的地方了', '玄机子', now() - interval '3 days'),
  (p2, '中签了！明天去现场，回来发详细反馈', '沪上剑客', now() - interval '20 hours'),
  (p2, '羡慕中签的，我蹲12:10直播', '云玩家老张', now() - interval '18 hours'),
  (p2, '重点帮忙试试打击感和受击反馈，SGF那段实机看着有点飘', '动作游戏苦手', now() - interval '12 hours'),
  (p3, '打窝这个说法太形象了哈哈哈，钓过鱼的都懂', '钓鱼佬本佬', now() - interval '16 hours'),
  (p3, '60%官方渠道才是重点，利润率比渠道服高多了，Q3见', '行业观察猿', now() - interval '10 hours'),
  (p4, '成都人报名了！东郊记忆离我家20分钟', '蓉城玩家', now() - interval '1 day'),
  (p5, '赌科隆，去年就是科隆首曝，游科喜欢在同一个场子放消息', '规律怪', now() - interval '2 days'),
  (p5, '820吧，悟空两周年这个节点情怀拉满', '天命人路过', now() - interval '2 days'),
  (p6, '甘肃文旅那个合作真的加分，敦煌1:1复刻想想就震撼', '丝路行者', now() - interval '3 days'),
  (p6, '就怕又是"实机demo惊艳，成品拉胯"，先观望', '理性玩家', now() - interval '3 days');
END $$;

SELECT 'Forum rebuilt: ' || (SELECT count(*) FROM public.forum_posts) || ' posts, '
  || (SELECT count(*) FROM public.forum_replies) || ' replies, active_visitors ready' AS status;
