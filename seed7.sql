-- ===================================================
-- 第7批数据库表
-- 复制全部内容到 Supabase SQL Editor → Run
-- ===================================================

-- 1. 游戏百科表
CREATE TABLE IF NOT EXISTS game_wiki (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL UNIQUE,
  background TEXT DEFAULT '',
  worldview TEXT DEFAULT '',
  characters JSONB DEFAULT '[]',
  weapons JSONB DEFAULT '[]',
  maps JSONB DEFAULT '[]',
  developer_notes TEXT DEFAULT '',
  last_edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_wiki ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wiki" ON game_wiki FOR SELECT USING (true);
CREATE POLICY "Users update wiki" ON game_wiki FOR UPDATE WITH CHECK (auth.uid() = last_edited_by);
CREATE POLICY "Users insert wiki" ON game_wiki FOR INSERT WITH CHECK (auth.uid() = last_edited_by);

-- 2. 百科编辑审核表
CREATE TABLE IF NOT EXISTS game_wiki_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  field_name TEXT NOT NULL,
  old_value TEXT DEFAULT '',
  new_value TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE game_wiki_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wiki_edits" ON game_wiki_edits FOR SELECT USING (true);
CREATE POLICY "Users insert wiki_edits" ON game_wiki_edits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. DLC/更新内容表
CREATE TABLE IF NOT EXISTS game_dlc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  dlc_type TEXT DEFAULT 'dlc' CHECK (dlc_type IN ('dlc','update','expansion','season_pass')),
  description TEXT DEFAULT '',
  release_date DATE,
  price TEXT DEFAULT '',
  status TEXT DEFAULT 'released' CHECK (status IN ('released','upcoming','in-dev','rumored')),
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_dlc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dlc" ON game_dlc FOR SELECT USING (true);

-- 4. 价格历史表
CREATE TABLE IF NOT EXISTS game_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  store TEXT NOT NULL,
  currency TEXT DEFAULT 'CNY',
  original_price NUMERIC(10,2),
  current_price NUMERIC(10,2),
  discount_percent INTEGER DEFAULT 0,
  lowest_price NUMERIC(10,2),
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prices" ON game_prices FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_prices_game_date ON game_prices(game_id, recorded_at);

-- 5. 预购信息表
CREATE TABLE IF NOT EXISTS game_preorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  edition TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  bonus TEXT DEFAULT '',
  purchase_link TEXT DEFAULT '',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_preorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read preorders" ON game_preorders FOR SELECT USING (true);

-- 6. 增强评测表
ALTER TABLE game_reviews ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE game_reviews ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE game_reviews ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'PC';
ALTER TABLE game_reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- ===================================================
-- 种子数据
-- ===================================================

-- 百科：黑神话悟空
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, developer_notes)
SELECT id,
  '《黑神话：悟空》是一款由中国游戏工作室"游戏科学"开发的第三人称动作角色扮演游戏。游戏以中国古典名著《西游记》为背景，讲述了取经之后五百年的故事。玩家将扮演一位"天命人"，踏上一条充满危险与惊喜的西游之路。游戏采用Unreal Engine 5开发，于2024年8月20日发售，首日Steam同时在线峰值突破280万，创造了国产游戏的历史。',
  '游戏世界设定在一个神话与写实交织的东方奇幻世界。取经之后，悟空被封为斗战胜佛，但他逐渐发现自己身处一个更大的骗局之中。天庭、灵山、妖界三方势力角力，而凡间的黑暗正在蔓延。游戏中有多个风格迥异的区域：翠竹掩映的黑风山、黄沙漫天的火焰山、白雪皑皑的小西天、以及诡异的盘丝洞。每个区域都有独立的生态系统和隐藏的秘密。',
  '[{"name":"天命人","desc":"玩家扮演的角色，一个没有名号的年轻猴子。身世成谜，被菩提祖师选中，踏上寻找真相的西游之路。可使用七十二变、筋斗云等经典神通。"},{"name":"孙悟空","desc":"曾经的齐天大圣，如今的斗战胜佛。在幕后操控着一切，是敌是友难以判断。据说他被天庭软禁在凌霄殿深处。"},{"name":"二郎神杨戬","desc":"天庭第一战将，第三只眼能看穿一切变化。对天命人的存在十分警惕，多次出手阻挠。"},{"name":"白骨夫人","desc":"盘丝洞之主，曾经的妖精女王。她与悟空有一段不为人知的过往，是揭示真相的关键人物。"},{"name":"猪八戒","desc":"曾经的净坛使者，如今被贬下凡成了黑风山的妖王。他掌握着悟空被封的秘密，但需要酒肉才能撬开他的嘴。"}]'::jsonb,
  '[{"name":"如意金箍棒","type":"主武器","desc":"天命人的初始武器，可变大变小。能切换三种形态：劈棍重击、戳棍速攻、立棍防御反击"},{"name":"九齿钉耙","type":"特殊武器","desc":"击败猪八戒后获得，附带土属性伤害，对妖物有额外加成"},{"name":"紫金铃","type":"法宝","desc":"佩戴后可自动释放音波攻击，打断敌人施法"},{"name":"定风珠","type":"法宝","desc":"免疫风属性伤害，对飞行类敌人有奇效"}]'::jsonb,
  '游戏科学最初只有13人团队，几乎全部来自腾讯量子工作室。创始人冯骥在腾讯工作了10年后选择离职创业。首支预告片于2020年8月20日发布，原计划2023年发售，因UE5引擎升级延期一年。游戏开发成本约4亿人民币，发售三天销量突破1000万。'
FROM games WHERE title='黑神话：悟空' LIMIT 1
ON CONFLICT (game_id) DO NOTHING;

-- 百科：影之刃零
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons)
SELECT id,
  '《影之刃零》是灵游坊（S-GAME）开发的暗黑武侠动作RPG，是《雨血》系列的续作。游戏延续了"暗黑武侠+功夫朋克"美学风格，讲述了一个关于复仇与救赎的故事。预计2026年9月9日正式发售。',
  '游戏设定在一个架空的东方世界，科技与武术在这里形成了奇妙的共生关系。功夫朋克（Kung Fu Punk）是这个世界的核心美学：既有传统的刀剑拳脚，也有蒸汽驱动的机械傀儡和改造武器。江湖之上，各方势力争斗不休，一个名为"影"的神秘组织在暗中操控一切。',
  '[{"name":"魂","desc":"本作主角，一名失去了记忆的杀手。他左手为机械义肢，可以使用各种暗器和机关。右手持一把黑色的长刀，刀名即为影之刃。他不断追寻自己的过去，却发现了更大的阴谋。"},{"name":"血","desc":"魂的宿敌与旧识，一个强大的剑客。他与魂有着相同的出身，却选择了不同的道路。"},{"name":"沐小葵","desc":"灵游坊的招牌角色之一，精通暗器的高手。她将成为魂旅途中的重要同伴。"}]'::jsonb,
  '[{"name":"影之刃","type":"主武器刀","desc":"魂的招牌武器，可根据连击积累戾气，释放毁灭性的终结技"},{"name":"鬼手","type":"副武器义肢","desc":"魂的左手机械义肢，可变形为钩爪、炮管、护盾等多种形态"}]'::jsonb
FROM games WHERE title='影之刃零' LIMIT 1
ON CONFLICT (game_id) DO NOTHING;

-- 百科：归唐
INSERT INTO game_wiki (game_id, background, worldview, characters, developer_notes)
SELECT id,
  '《归唐》是网易雷火临安24团队开发的历史题材动作冒险游戏，也是网易首款自研买断制3A。游戏以安史之乱后的唐朝为背景，讲述了一段发生在敦煌的悲壮故事。玩家将扮演一名唐朝士兵，在乱世中追寻归家之路。2026年10月18日发售。',
  '公元756年，安史之乱爆发。吐蕃趁大唐内乱之际，出兵攻占了河西走廊，切断了唐朝与西域的联系。敦煌——这座丝绸之路上的明珠，成为了孤城。游戏聚焦于这段鲜为人知的历史，玩家将经历从长安到敦煌的漫长旅途，见证战争的残酷与人性的光辉。',
  '[{"name":"李归","desc":"一名年轻的唐朝士兵，来自敦煌。安史之乱后，他随军从长安出发，踏上返乡之路。他精通刀法和骑射，但真正的力量来自于他的信念——回到家人身边。"},{"name":"吐蕃将军","desc":"吐蕃远征军的主将，一个悲剧性的角色。他奉命占领敦煌，却在这里发现了自己民族的古老预言。"},{"name":"月氏公主","desc":"月氏部落的末代公主，她掌握着安西都护府失落的秘密，是李归旅途中的关键盟友。"}]'::jsonb,
  '网易雷火临安24团队是2020年专门为《归唐》项目组建的。核心成员来自育碧、EA、Capcom等国际大厂。游戏开发周期超过5年，投资超过6亿人民币，是网易迄今为止投入最大的单机游戏项目。采用改良版Unreal Engine 5，自研了"大漠渲染系统"以呈现真实的敦煌风光。'
FROM games WHERE title='归唐' LIMIT 1
ON CONFLICT (game_id) DO NOTHING;

-- DLC/更新
INSERT INTO game_dlc (game_id, title, dlc_type, description, release_date, status) SELECT id, '花果山：新章', 'dlc', '追加花果山全新区域，包含5个新Boss和15小时游戏内容', '2025-06-01', 'released' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_dlc (game_id, title, dlc_type, description, release_date, status) SELECT id, '挑战模式', 'update', '新增Boss Rush挑战模式，击败全部Boss解锁特殊奖励', '2025-02-15', 'released' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_dlc (game_id, title, dlc_type, description, release_date, status) SELECT id, '豪华版升级包', 'dlc', '含3套独占皮肤、数字设定集、原声带', '2026-09-09', 'upcoming' FROM games WHERE title='影之刃零' LIMIT 1;
INSERT INTO game_dlc (game_id, title, dlc_type, description, release_date, status) SELECT id, '收藏版特典', 'dlc', '含兵马俑皮肤、敦煌壁画滤镜、制作纪录片', '2026-10-18', 'upcoming' FROM games WHERE title='归唐' LIMIT 1;

-- 价格历史（黑神话悟空 Steam+Epic+PS5）
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PC', 'steam', 268.00, 268.00, 0, 188.00, '2026-05-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PC', 'steam', 268.00, 214.40, 20, 188.00, '2026-04-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PC', 'steam', 268.00, 188.00, 30, 188.00, '2026-03-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PC', 'steam', 268.00, 268.00, 0, 268.00, '2026-02-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PC', 'steam', 268.00, 268.00, 0, 268.00, '2026-01-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PC', 'epic', 268.00, 228.00, 15, 188.00, '2026-05-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;
INSERT INTO game_prices (game_id, platform, store, original_price, current_price, discount_percent, lowest_price, recorded_at) SELECT id, 'PS5', 'ps_store', 398.00, 398.00, 0, 278.00, '2026-05-01' FROM games WHERE title='黑神话：悟空' LIMIT 1;

-- 预购信息
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PC', 'standard', 298.00, '预购特典：动态主题 + 早期解锁鬼手改', 'https://store.steampowered.com' FROM games WHERE title='影之刃零' LIMIT 1;
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PC', 'deluxe', 398.00, '豪华版：标准版全部 + 3皮肤 + 设定集 + 原声带', 'https://store.steampowered.com' FROM games WHERE title='影之刃零' LIMIT 1;
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PC', 'collectors', 698.00, '收藏版：豪华版全部 + 1:1影之刃模型 + 铁盒 + 地图', 'https://store.steampowered.com' FROM games WHERE title='影之刃零' LIMIT 1;
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PS5', 'standard', 398.00, 'PS5独占：动态主题 + 早期解锁影步技能', 'https://store.playstation.com' FROM games WHERE title='影之刃零' LIMIT 1;
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PC', 'standard', 298.00, '预购特典：归唐OST + 数字设定集', 'https://store.steampowered.com' FROM games WHERE title='归唐' LIMIT 1;
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PC', 'deluxe', 498.00, '豪华版：标准版全部 + 兵马俑皮肤 + 制作纪录片', 'https://store.steampowered.com' FROM games WHERE title='归唐' LIMIT 1;
INSERT INTO game_preorders (game_id, platform, edition, price, bonus, purchase_link) SELECT id, 'PS5', 'standard', 398.00, 'PS5预购：动态主题 + 敦煌壁纸集', 'https://store.playstation.com' FROM games WHERE title='归唐' LIMIT 1;
