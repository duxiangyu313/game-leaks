-- ═══════════════════════════════════════════
-- 重建游戏事件日历表（/calendar 页面依赖，数据库简化时被误删）
-- 在 Supabase Dashboard → SQL Editor 执行
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.game_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'other'
    CHECK (event_type IN ('release','beta','livestream','conference','demo','update','other')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_game_events_date ON public.game_events(event_date);

ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ge_select" ON public.game_events FOR SELECT USING (true);
CREATE POLICY "ge_write_admin" ON public.game_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND membership = 'diamond'));

-- 灌入 2026年7-10月 真实事件（game_id 按标题模糊关联游戏库，找不到留空）
INSERT INTO public.game_events (title, description, event_date, event_type, game_id) VALUES
-- 7月
('《解限机》全球公测', '西山居机甲对战，Steam国产预约第一，520万预约', '2026-07-02', 'release', (SELECT id FROM public.games WHERE title LIKE '%解限机%' LIMIT 1)),
('《异环》Steam/Epic全球发售', '完美世界超自然都市开放世界，日本登顶PS商店热门榜', '2026-07-08', 'release', (SELECT id FROM public.games WHERE title LIKE '%异环%' LIMIT 1)),
('BW 2026 开幕', 'Bilibili World 上海，3天40万人次，18%海外购票', '2026-07-10', 'conference', NULL),
('《星痕共鸣》上线', '腾讯异世界多人RPG', '2026-07-17', 'release', (SELECT id FROM public.games WHERE title LIKE '%星痕共鸣%' LIMIT 1)),
('《无主星渊》上线', '网易星际搜打撤，Steam新品节全球试玩榜TOP1', '2026-07-17', 'release', (SELECT id FROM public.games WHERE title LIKE '%无主星渊%' LIMIT 1)),
('《无限暖暖》2.8"黄金尘"版本', '送7套新服装+80抽', '2026-07-17', 'update', (SELECT id FROM public.games WHERE title LIKE '%无限暖暖%' LIMIT 1)),
('《古剑》上海线下试玩会', '上海美术馆，战斗系统核心展示，12:10线上直播', '2026-07-18', 'demo', (SELECT id FROM public.games WHERE title LIKE '%古剑%' LIMIT 1)),
('黑神话音乐会·北京站', '北京展览馆剧场，钟馗主题曲返场', '2026-07-18', 'other', (SELECT id FROM public.games WHERE title LIKE '%黑神话%悟空%' LIMIT 1)),
('湮灭之潮成都试玩报名截止', '8/15成都千人试玩最后报名日', '2026-07-23', 'other', (SELECT id FROM public.games WHERE title LIKE '%湮灭之潮%' LIMIT 1)),
('《苏丹的游戏》移动版上线', 'GameTree全球发行，Steam特别好评续作移动端', '2026-07-24', 'release', NULL),
('黑神话音乐会·成都站', '巡演国内第二站', '2026-07-25', 'other', (SELECT id FROM public.games WHERE title LIKE '%黑神话%悟空%' LIMIT 1)),
('ChinaJoy 2026 开幕', '上海新国际博览中心，近900家企业超1000款游戏，主题"与AI同游"', '2026-07-31', 'conference', NULL),
-- 8月
('ChinaJoy 2026 闭幕', NULL, '2026-08-03', 'conference', NULL),
('《湮灭之潮》成都千人试玩', '东郊记忆，1小时体验：独立关卡+两场Boss挑战', '2026-08-15', 'demo', (SELECT id FROM public.games WHERE title LIKE '%湮灭之潮%' LIMIT 1)),
('黑神话悟空发售两周年', '外界预期钟馗新情报节点之一', '2026-08-20', 'other', (SELECT id FROM public.games WHERE title LIKE '%黑神话%悟空%' LIMIT 1)),
('科隆游戏展 gamescom 2026', '湮灭之潮海外首次试玩+新预告；钟馗新情报预期节点', '2026-08-26', 'conference', NULL),
-- 9-10月
('《深空之眼》转"陪伴服"', '停止新内容研发，承诺运行至2031年', '2026-09-17', 'update', NULL),
('《影之刃零》全球发售', '灵游坊武侠朋克动作游戏，PS5/PC', '2026-10-29', 'release', (SELECT id FROM public.games WHERE title LIKE '%影之刃零%' LIMIT 1))
ON CONFLICT DO NOTHING;

SELECT 'game_events rebuilt: ' || (SELECT count(*) FROM public.game_events) || ' events' AS status;
