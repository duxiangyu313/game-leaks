-- 论坛帖子表
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('games','leaks','general','off-topic')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT '匿名用户',
  is_pinned BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read forum_posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Users insert forum_posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own posts" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);

-- 论坛回复表
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT '匿名用户',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read replies" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "Users insert replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 种子数据
INSERT INTO forum_posts (title, content, category, author_name, view_count, reply_count, created_at) VALUES
('《归唐》6月6日SGF实机演示讨论集中帖', '如题，明天就是SGF了！归唐的12分钟实机马上就能看到了。大家来预测一下会展示什么内容？', 'games', '游戏猎人', 3200, 128, now() - interval '2 hours'),
('客观评价一下影之刃零的最新实机演示', '看了最新的实机演示，说几点个人看法：战斗流畅度明显提升，连击更顺滑了。功夫朋克的美术风格越来越成熟。', 'games', '硬核玩家', 2100, 86, now() - interval '5 hours'),
('PS5 Pro首发护航阵容分析，归唐稳了？', '归唐确认成为PS5 Pro首发护航游戏，这波操作太关键了！', 'games', '主机党', 1800, 54, now() - interval '8 hours'),
('《归唐》12分钟实机爆料！开发进度90%', '多个渠道确认，归唐开发进度已达90%，10月18日发售，298元！', 'leaks', '爆料达人', 8900, 256, now() - interval '1 hour'),
('蛇夫座第二项目：现代军事战术射击题材', '通过招聘信息交叉验证，蛇夫座正在招募军事战术射击经验的开发者。', 'leaks', '军事游戏迷', 4500, 134, now() - interval '3 hours'),
('2026年国产3A你最期待哪一款？投票贴', '今年国产3A大爆发，你的钱包准备好了吗？投票选出你最期待的游戏！', 'general', '管理员', 15600, 456, now() - interval '1 day'),
('升级显卡备战国产3A：RTX 5070 vs RX 9070', '想升级显卡玩国产3A，RTX 5070和RX 9070怎么选？求推荐。', 'general', '硬件发烧友', 8900, 234, now() - interval '3 hours'),
('论坛新人报到专帖，大家来认识一下', '欢迎各位新老玩家！这里是新人报到帖，来打个招呼吧。', 'off-topic', '管理员', 45000, 1234, now() - interval '7 days'),
('晒一晒你的游戏设备和桌面布置', '最近换了新的显示器，感觉玩国产3A更爽了。大家也来晒晒自己的桌面！', 'off-topic', '桌面控', 18900, 567, now() - interval '3 hours');

INSERT INTO forum_replies (post_id, author_name, content, created_at) VALUES
((SELECT id FROM forum_posts LIMIT 1 OFFSET 0), '主机党', '如果是298元我直接预购！PS5 Pro首发护航太香了', now() - interval '1 hour'),
((SELECT id FROM forum_posts LIMIT 1 OFFSET 0), '硬核玩家', '12分钟实机比预期多一倍，网易诚意满满', now() - interval '30 minutes'),
((SELECT id FROM forum_posts LIMIT 1 OFFSET 0), '观望中', '等实机出来再说，纯单机我还是持保留态度', now() - interval '10 minutes');
