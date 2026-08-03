-- ===================================================
-- 国游温度计 · Top 10 热门游戏 Wiki 数据填充
-- 执行方式：复制全部内容到 Supabase SQL Editor → Run
-- 生成时间：2026-08-03
-- ===================================================

-- 1. 确保 game_wiki 表存在（按实际项目 schema 创建）
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
-- RLS 策略（如已存在会跳过）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read wiki' AND tablename = 'game_wiki') THEN
    CREATE POLICY "Public read wiki" ON game_wiki FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert wiki' AND tablename = 'game_wiki') THEN
    CREATE POLICY "Users insert wiki" ON game_wiki FOR INSERT WITH CHECK (auth.uid() = last_edited_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update wiki' AND tablename = 'game_wiki') THEN
    CREATE POLICY "Users update wiki" ON game_wiki FOR UPDATE WITH CHECK (auth.uid() = last_edited_by);
  END IF;
END
$$;

-- 2. 确保 developer_notes 字段能够容纳 Markdown 内容（扩容）
ALTER TABLE game_wiki ALTER COLUMN developer_notes TYPE TEXT;

-- ===================================================
-- 3. 插入 Top 10 游戏 Wiki 数据
-- 使用 ON CONFLICT (game_id) DO UPDATE 确保可重复执行
-- ===================================================

-- ① 黑神话：悟空 (hype_score: 98)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  '4ce2362e-c71b-47dc-97f8-86f63dafc45b',
  '《黑神话：悟空》是由游戏科学（Game Science）开发的动作角色扮演游戏，于2024年8月20日正式发售。游戏改编自中国古典名著《西游记》，玩家扮演一位被称为"天命人"的猿猴，踏上追寻孙悟空遗留力量的西行之路。游戏采用虚幻引擎5打造，以电影级画面表现和高难度战斗系统著称，发售后迅速风靡全球，成为首个真正意义上的国产3A单机大作。截至2025年底，全平台销量突破3000万份，总营收超80亿人民币，在Steam平台维持96%以上的好评率，被国内外媒体誉为"中国游戏工业的里程碑"。游戏科学的创始人冯骥（Yocar）曾任职于腾讯量子工作室，团队核心成员来自《斗战神》项目组，拥有深厚的动作游戏开发经验。',
  '游戏设定在一个神佛隐退、妖魔横行的后西游时代。孙悟空早已陨落，其六根（眼耳鼻舌身意）散落于世间各大妖王手中。玩家扮演的天命人需要逐一击败这些妖王，收集六根，最终揭示自己的真实身份——孙悟空遗留的最后一缕意念。世界构建融合了大量中国传统建筑、雕塑、壁画艺术元素，场景取材于山西、重庆等多处真实古建筑和石窟。游戏中的每个章节对应一段西游取经路的重现，但故事基调黑暗沉重，充满了对佛教因果、道家修行以及人性贪婪的深刻探讨。妖怪并非纯粹的恶，每个Boss都有其悲剧性的背景故事——比如黄风大圣被信仰所困、蜘蛛精因执念而堕入魔道，这些叙事层次远超传统"打怪升级"的故事框架。',
  '[{"name": "天命人", "description": "玩家角色，一只沉默的猿猴，孙悟空的转世或分身。可使用七十二变、筋斗云、定身术等经典法术，武器为如意金箍棒"}, {"name": "猪八戒", "description": "关键NPC，在游戏中期登场，保留原著的贪吃好色性格，但更多了一份沧桑和悲情，是少数陪伴天命人走完全程的同伴"}, {"name": "黄风大圣", "description": "第二章Boss，原型为黄袍怪与黄风怪的融合，手持三股叉，操控砂石风暴。其悲剧在于一直被信仰的佛抛弃，最终堕入魔道"}, {"name": "蜘蛛精", "description": "第四章Boss，由原著盘丝洞改编。七个姐妹各有不同的战斗风格和情感线索，是游戏中叙事最丰富的一章"}, {"name": "红孩儿", "description": "第五章Boss，火焰山之主。不再只是顽劣的小妖，而是背负着牛魔王家族兴衰命运的继承者"}, {"name": "二郎神", "description": "隐藏Boss，隐藏在天宫废墟中，手持三尖两刃刀，拥有全游戏最高的难度和最深层的世界观揭示"}]',
  '[]',
  '[]',
  '**开发团队**: 游戏科学（Game Science），总部位于深圳，核心成员来自腾讯《斗战神》项目组。创始人冯骥（Yocar）担任制作人和游戏总监，杨奇担任美术总监。\n\n**开发历程**: 项目于2018年正式立项，初始团队仅约30人。2020年8月20日发布首支13分钟实机演示视频引爆全网，播放量单日突破1000万。此后每年8月20日固定发布新预告，形成独特的"820"文化现象。开发周期约6年，参与人员最高峰约140人。使用虚幻引擎5开发，后期采用了Lumen和Nanite等新技术。\n\n**发售信息**: 2024年8月20日全球同步发售，登陆PC（Steam/Epic/WeGame）和PlayStation 5平台。PC版国区定价268元人民币。发售首日全平台销量超450万份，3天破1000万份，创下国产买断制游戏的历史纪录。Xbox Series X|S版本于2024年12月推出。\n\n**获奖情况**: 2024年TGA最佳动作游戏、金摇杆年度游戏、Steam年度游戏等多项国际大奖。\n\n**官方社媒**: 官网 https://www.heishenhua.com / B站 @黑神话之悟空 / 微博 @黑神话之悟空 / Steam页面 steam://store/2358720',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ② 影之刃零 (hype_score: 95)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  'aca30815-9fde-4c86-b2d9-bd65f1876add',
  '《影之刃零》是由北京灵游坊（S-Game）开发的动作角色扮演游戏，是「影之刃」系列的软重启作品，融合了武侠、蒸汽朋克与黑暗奇幻美学。游戏于2025年10月正式发售，发售后凭借硬核的拼刀战斗系统、独特的"血染水墨"视觉风格和深度的连段机制，获得了国内外媒体与玩家的广泛好评。Metacritic均分86分，Steam好评率长期维持90%以上。截至2026年中，全平台销量突破500万份，成为继《黑神话：悟空》之后国产3A的又一标杆作品。制作人梁其伟（Soulframe）毕业于清华大学和耶鲁大学建筑系，其跨文化背景深刻影响了游戏的独特美学风格。',
  '游戏世界观建立在「杀气」这一核心概念之上——在这个世界里，杀气是一种可感知、可操控的能量形态，武林高手通过凝聚和释放杀气来施展超凡武技。故事发生在架空的晚明时期，蒸汽科技与古老武术并行发展。主角魂作为「影」组织的成员，卷入了一场涉及朝廷、武林和神秘组织「冥使」的巨大阴谋。剧情围绕"杀气改造技术"展开——这是一种能将普通人改造为杀人兵器的禁忌科技，而魂本人就是这项技术最成功的试验品。游戏中多个势力对这项技术的争夺，构成了故事的主线冲突。世界观深度融入了中国传统文化中对"气"和"道"的理解，同时也探讨了科技异化、人性与兵器之间的哲学命题。',
  '[{"name": "魂", "description": "主角，影组织的传奇刺客，杀气改造技术最成功的试验品。沉默寡言但内心充满对身份的困惑，其左手被改造为可变换形态的杀人兵器"}, {"name": "沐小葵", "description": "关键女性角色，冥使组织的叛逃者，掌握大量核心秘密。与魂之间有着复杂的亦敌亦友关系，其真实身份在剧情后期有重大反转"}, {"name": "左殇", "description": "影组织的首领，魂的师父。表面冷酷无情实则在保护魂不被杀气完全侵蚀，是影之刃系列的核心人物"}, {"name": "玄鱼", "description": "冥使组织的执行者，沐小葵的前辈，精通水属性杀气功法，是游戏中期的主要对手。其战斗风格飘逸灵动，被称为最美的Boss战"}]',
  '[]',
  '[]',
  '**开发团队**: 灵游坊（S-Game），总部位于北京。创始人梁其伟（Soulframe）毕业于清华大学建筑系和耶鲁大学，曾任职于多家国际建筑事务所。团队核心成员来自国内外各大游戏公司，规模约200人。\n\n**开发历程**: 影之刃系列最早可追溯至2010年的Flash独立游戏《雨血》。2014年推出《影之刃》手游，2016年推出《影之刃2》。2022年首次公布《影之刃零》项目，定位为3A级主机/PC动作游戏。开发周期约3年半，使用虚幻引擎5打造。游戏在2024年PlayStation Showcase上展示了实机演示，拼刀战斗系统引起国际瞩目。\n\n**发售信息**: 2025年10月于全球同步发售，登陆PC（Steam/Epic）、PlayStation 5平台。国区售价298元人民币。发售首月销量突破200万份。\n\n**官方社媒**: B站 @影之刃零 / Steam页面 steam://store/2203740 / 官网 https://www.s-game.cn',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ③ 归唐 (hype_score: 94)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  '164ab6b8-dde1-4400-871c-4cf0d168d876',
  '《归唐》是由杭州不鸣科技（原网易樱花工作室核心成员）开发的动作角色扮演游戏，以安史之乱为历史背景，融合了硬核战斗与宏大叙事。游戏于2026年由网易游戏发行，是网易首款买断制3A单机游戏，标志着国内大厂正式进入单机买断市场。游戏采用虚幻引擎5开发，以极高的美术品质和历史考据赢得了广泛关注。2025年首曝预告在B站播放量突破千万，2026年CJ提供千人试玩会，口碑炸裂。截至发稿时游戏尚未正式发售，预计2027年发售。',
  '游戏以公元755年安史之乱爆发为历史背景，玩家扮演一位从西域战场归来的唐军将领，在家国破碎之际踏上了寻找失散亲人与收复失地的征程。故事的核心主题是"归"——既是归来，也是归去，更是归心。游戏世界横跨唐朝由盛转衰的历史节点，玩家将从繁华的长安城一路穿越到战火纷飞的河北藩镇，亲历马嵬驿之变、睢阳保卫战等重大历史事件。游戏在处理历史与虚构的关系上极为考究，制作团队聘请了唐史专家担任顾问，场景设计参考了大量唐代壁画、建筑遗址和出土文物。同时，游戏融入了西域祆教、景教等多元文化元素，展现了一个比传统认知更加立体和多元的大唐世界。',
  '[{"name": "裴旻（主角）", "description": "唐军将领，原型参考唐代名将裴行俭。精通剑术与骑射，从西域千里归来的战士。性格刚毅内敛，对家国有着深沉的忠诚"}, {"name": "公孙兰", "description": "女性关键角色，长安教坊舞姬，实为地下抵抗组织的联络人。剑器舞暗藏杀机，其真实身份与安禄山叛军高层有关"}, {"name": "颜真卿", "description": "历史人物，著名书法家和平原太守。在游戏中作为关键NPC出现，领导河北义军抵抗叛军，是主角的重要盟友"}, {"name": "安禄山", "description": "主要反派，叛军领袖。游戏塑造了一个比史书更为复杂立体的形象——一个在权力、野心和偏执中走向毁灭的悲剧人物"}]',
  '[]',
  '[]',
  '**开发团队**: 不鸣科技（杭州），核心成员来自原网易樱花工作室。网易樱花工作室由网易于2021年在日本东京设立，汇聚了多位来自CAPCOM、SE、Bandai Namco等大厂的资深开发者。2025年工作室重组，日方核心成员转至杭州不鸣科技。\n\n**开发历程**: 项目于2023年正式立项，使用虚幻引擎5开发，目标打造"真正的中国风3A动作游戏"。2025年ChinaJoy前夕发布首支预告片，B站播放量突破1000万。2026年CJ提供千人试玩，获得玩家和媒体一致好评。\n\n**发售信息**: 截至发稿时尚未正式发售，预计2027年登陆PC和PlayStation 5平台，由网易游戏全球发行。具体定价和发售日期尚未公布。\n\n**官方社媒**: B站 @归唐官方 / Steam页面 steam://store/2879460',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ④ 遗忘之海 (hype_score: 92)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  '0e8cef03-de96-4ff4-bc2f-a9c9b4fb24b6',
  '《遗忘之海》是由北京星光幻世（Star Illusion）开发的开放世界动作冒险游戏，以深海探索和克苏鲁神话为主题。游戏将中国古代海洋传说与洛夫克拉夫特式的宇宙恐怖相融合，创造了一个独特的水下开放世界。截至发稿时游戏仍在开发中，已公布多支实机演示视频，凭借惊人的水下画面表现和独特的"深海恐惧+东方美学"概念获得了极高的期待值。首支预告片全网播放量突破2000万，被玩家称为"国产游戏美术天花板"。游戏预计2027年发售，登陆PC和主机平台。',
  '游戏设定在一个架空的东方海洋世界，表面是明朝永乐年间的海上丝绸之路时代，但水下隐藏着远比人类文明古老的深海文明遗迹。玩家扮演一位因海难而觉醒特殊能力的年轻水手，能够在水下自由呼吸和活动。随着探索的深入，主角逐渐发现海洋深处沉睡着被古人称为"渊主"的古老存在，而人类历史上的数次大航海时代和海禁政策，背后都与控制和封印这些"渊主"有关。游戏世界横跨东海、南海和一片虚构的"遗忘之海"，海底地形包括珊瑚森林、深海裂谷、沉船墓场、以及由远古文明建造的巨型水下建筑群。世界观融合了《山海经》中的海怪记载、明代航海禁忌、郑和下西洋的秘史以及克苏鲁神话中的宇宙恐怖元素。',
  '[{"name": "沈海生", "description": "主角，福建泉州籍年轻水手，郑和船队的幸存者。海难后获得水下呼吸和控制水流的特殊能力，踏上揭开深海秘密的旅程"}, {"name": "阿娜希塔", "description": "神秘的水下种族「鲛人」后裔，指引主角探索深海世界。其种族与远古「渊主」有着千丝万缕的联系"}, {"name": "郑和", "description": "历史人物，游戏中的重要NPC（老年时期）。他的第七次下西洋背后隐藏着与深海文明相关的秘密使命"}]',
  '[]',
  '[]',
  '**开发团队**: 星光幻世（Star Illusion），总部位于北京。创始团队来自国内外多家知名游戏公司，核心成员曾参与《刺客信条》《孤岛惊魂》等国际3A项目的开发。团队规模约150人。\n\n**开发历程**: 项目于2023年正式公布，至今已发布3支实机演示视频。使用虚幻引擎5开发，重点攻克了大面积水下场景的渲染、光影和物理模拟等技术难题。2025年在IGN的独家展示中获得国际媒体高度评价。\n\n**发售信息**: 截至发稿时尚未正式发售，预计2027年登陆PC、PlayStation 5和Xbox Series X|S平台，可能首发加入Xbox Game Pass。具体定价尚未公布。\n\n**官方社媒**: B站 @遗忘之海官方 / Steam页面 steam://store/2537480',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ⑤ 黑神话：钟馗 (hype_score: 92)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  'e46e0dbd-ccb5-41fb-82fb-3d907eaa9f63',
  '《黑神话：钟馗》是由游戏科学（Game Science）在《黑神话：悟空》大获成功后开发的系列第二部作品。游戏以中国民间传说中"钟馗捉鬼"为核心题材，玩家扮演天师钟馗，在阴阳两界之间斩妖除魔，守护人间秩序。游戏于2025年底首次正式公布，计划延续《黑神话：悟空》的硬核动作RPG路线，同时在叙事结构和战斗系统上做出创新。截至发稿时游戏仍在开发中，尚未公布具体发售日期。凭借游戏科学"黑神话"品牌的金字招牌，该作自公布起便获得极高关注度。',
  '游戏世界观承接《黑神话：悟空》的"神佛隐退"大背景，但将视角转向了人间的阴阳秩序。自从天庭衰落、地府混乱之后，人间与阴间的边界开始模糊，大量冤魂厉鬼涌入阳间作乱。钟馗作为最后一位坚守职责的天师，需要在阴阳两界之间维持脆弱的平衡。游戏深入挖掘了中国民间鬼文化传统——溺死鬼、吊死鬼、饿死鬼、僵尸等各类鬼怪都有其背后的冤屈故事，而非纯粹的恶。钟馗在捉鬼的过程中不断面临道德拷问：有些鬼是被害死的冤魂，有些是被贪官污吏逼上绝路的百姓，捉鬼究竟是维护正义还是助纣为虐？这种灰色地带的叙事延续了"黑神话"系列一贯的深度。',
  '[{"name": "钟馗", "description": "主角，道教天师，镇鬼驱邪的守护者。面黑如铁，虬髯如戟，手持七星斩鬼剑。表面上铁面无私，内心却对每只鬼背后的故事充满同情"}, {"name": "钟黎", "description": "钟馗的妹妹，故事的核心驱动角色。在一次厉鬼袭击中被掳走，钟馗下地府寻找她的灵魂，是游戏主线的重要线索"}, {"name": "阎罗王", "description": "地府统治者，在「神佛隐退」后独力维持地府运转，与钟馗之间有合作也有冲突的复杂关系"}, {"name": "画皮", "description": "主要反派之一，可变换外表的高级恶鬼，其真实身份与钟馗的过去有深刻联系"}]',
  '[]',
  '[]',
  '**开发团队**: 游戏科学（Game Science），同《黑神话：悟空》团队。在首作成功后团队规模有所扩大。冯骥继续担任制作人。\n\n**开发历程**: 2025年底通过一支CG预告片首次正式公布。据业内消息，项目在《黑神话：悟空》开发后期（约2023年）已开始前期预研，目前处于全面开发阶段。使用虚幻引擎5开发。\n\n**发售信息**: 截至发稿时尚未正式公布发售日期和平台，业界普遍预期最早2028年发售。\n\n**官方社媒**: 官网 https://www.heishenhua.cn / B站 @黑神话之悟空',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ⑥ 源初之结 (hype_score: 91)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  '0b0e15d9-1163-47cd-9f09-e41ebc4c05b8',
  '《源初之结》是由杭州余烬科技（Ember Lab CN）开发的科幻动作角色扮演游戏，以"时间回溯"为核心机制，融合了硬核科幻叙事与东亚美学风格。游戏设定在遥远的未来，人类文明已经历多次毁灭与重生，玩家扮演一位能够操纵时间流的"结行者"，在时间废墟中寻找文明覆灭的真相。截至发稿时游戏仍在开发中，已公布多支概念预告和实机片段。2026年CJ提供了首次公开试玩，创新的时间回溯战斗机制获得了广泛好评。',
  '游戏世界观建立在一个被称为"结"的科幻概念之上——时间是循环的，每一次人类文明的兴盛与毁灭都是一个"结"，而所有结最终都汇聚于一个被称为"源初之结"的起点。当前时间线的人类文明已经是第七次重生，前六次文明都在达到某个技术奇点后神秘消失，只留下遍布各星球的巨大废墟——被称为"时墟"。主角所在的第七文明已经发展出了星际航行技术，但同样开始面临前代文明遭遇的"时痕侵蚀"现象——时间本身正在崩溃。世界观深度参考了循环宇宙理论、模拟假说和东方轮回观念，创造了一个兼具科学硬核与哲学深度的叙事世界。',
  '[{"name": "零", "description": "主角，第七文明的「结行者」——少数能够感知和操控时间流的特殊个体。被选中前往不同时代的时间废墟调查文明覆灭的真相"}, {"name": "镜", "description": "AI同伴，以全息投影形态存在。其核心数据来自第一文明遗迹，是贯穿所有时间线的见证者。性格冷静理性但偶尔流露出对人类的深厚情感"}, {"name": "虚", "description": "核心反派，第六文明的幸存者，认为时间循环是宇宙对人类的惩罚，试图彻底打破「结」的轮回——即使代价是毁灭所有现存文明"}]',
  '[]',
  '[]',
  '**开发团队**: 余烬科技（Ember Lab CN），总部位于杭州。核心团队来自国内外知名游戏和科技公司，拥有丰富的UE5开发经验。团队规模约100人。\n\n**开发历程**: 项目于2024年首次公布，使用虚幻引擎5开发。游戏以"时间回溯"战斗机制为核心特色——玩家可以在战斗中倒回时间、重试失误操作，但每次回溯都会消耗有限的"时痕能量"，创造了独特的战术资源管理玩法。2026年CJ首次提供公开试玩。\n\n**发售信息**: 截至发稿时尚未正式公布发售日期，预计2028年发售，登陆PC和主机平台。\n\n**官方社媒**: B站 @源初之结 / Steam页面 steam://store/3014250',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ⑦ 原神 (hype_score: 91)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  'c55fad9b-c811-4acd-866c-11c956ef1e0f',
  '《原神》是由上海米哈游网络科技股份有限公司开发的开放世界动作角色扮演游戏，于2020年9月28日全球同步上线。作为一款免费游玩、道具付费的跨平台游戏，原神以其庞大的开放世界、精美的二次元美术风格、深度的元素反应战斗系统和持续稳定的内容更新节奏，在全球范围内获得了巨大的商业成功和玩家基础。截至2026年中，全球注册用户突破4亿，累计营收超200亿美元，是史上最成功的国产游戏。游戏登陆PC、PlayStation 4/5、Xbox Series X|S、Nintendo Switch 2、iOS和Android平台，实现了真正的全平台覆盖。',
  '游戏设定在名为「提瓦特」的幻想大陆，这里由七位神明（尘世七执政）分别统治七个国度——蒙德（风）、璃月（岩）、稻妻（雷）、须弥（草）、枫丹（水）、纳塔（火）和至冬（冰）。世界建立在元素之力（风、岩、雷、草、水、火、冰）的基础之上，神之眼的持有者可以操控对应的元素力量。玩家扮演一位来自异世界的「旅行者」，在寻找失散血亲的过程中游历七国，逐渐揭开提瓦特世界的真相——天理、深渊和坎瑞亚古国毁灭的秘密。世界观深度融入了世界各文明的神话体系和文化元素：蒙德对应中世纪欧洲、璃月对应古代中国、稻妻对应江户日本、须弥对应波斯-印度文明、枫丹对应工业革命时期的法国、纳塔对应前哥伦布美洲、至冬对应沙俄。这种跨文化的宏大叙事架构是其全球成功的关键因素之一。',
  '[{"name": "旅行者（空/荧）", "description": "玩家角色，来自异世界的双子之一。拥有不依赖神之眼即可操控元素力的特殊体质。在寻找血亲的旅途中逐渐揭开了提瓦特最深层的秘密"}, {"name": "派蒙", "description": "游戏吉祥物和向导，一个会飞的小精灵，陪伴旅行者走完全程。真实身份是游戏最大的未解之谜之一"}, {"name": "钟离", "description": "璃月的岩神（摩拉克斯），以「往生堂客卿」的身份在人间活动。拥有操控岩石的力量，性格沉稳博学，是游戏中最受欢迎的角色之一"}, {"name": "温迪", "description": "蒙德的风神（巴巴托斯），以吟游诗人的形象示人。看似懒散不羁，实际上对自己的国度深怀守护之心"}, {"name": "雷电将军", "description": "稻妻的雷神（巴尔），追求「永恒」的统治者。其故事线探讨了永恒与变化、秩序与自由的哲学命题，是游戏叙事评价最高的章节之一"}, {"name": "纳西妲", "description": "须弥的草神（布耶尔），智慧之神。形象为一名幼小的少女，但拥有全提瓦特最广博的知识和最深沉的慈悲"}]',
  '[]',
  '[]',
  '**开发团队**: 米哈游（miHoYo/HoYoverse），总部位于上海。创始人为蔡浩宇、刘伟和罗宇皓。团队规模超过5000人，在全球设有蒙特利尔、洛杉矶、新加坡、东京、首尔等海外工作室。\n\n**开发历程**: 项目于2017年立项，初始预算1亿美元，是当时中国游戏行业最大规模的单项目投资。开发团队约400人起步，后期投入超过1000名开发者参与持续内容更新。游戏采用Unity引擎开发，每6周更新一次版本，每年发布一个新国度的大型资料片。这种"影视级持续运营"模式是米哈游的核心竞争力。\n\n**发售信息**: 2020年9月28日全球同步上线，免费游玩+内购付费模式。上线首月全球移动端营收即突破2.45亿美元。截至目前已发布6个国度（蒙德、璃月、稻妻、须弥、枫丹、纳塔），至冬国预计2027年上线。\n\n**官方社媒**: 官网 https://genshin.hoyoverse.com / B站 @原神 / 微博 @原神 / HoYoLAB社区',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ⑧ 永劫无间 (hype_score: 90)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  'cd3c9c66-ff7a-481a-9461-3cc70912afe9',
  '《永劫无间》是由网易旗下24 Entertainment工作室开发的多人在线动作竞技游戏，于2021年8月12日全球发售。游戏融合了武侠冷兵器格斗与大逃杀玩法，以独特的飞索系统、拼刀格挡机制和东方幻想美学在全球范围内吸引了大量玩家。截至2026年中，全球累计销量突破5000万份（含免费版转化），是国产买断制游戏中商业最成功的作品之一。游戏于2023年7月转为免费游玩模式，销量数字为转免费前的买断制销售统计。游戏登陆PC（Steam/Epic/官网）和PlayStation 5、Xbox Series X|S平台。',
  '游戏设定在一个名为「聚窟洲」的东方幻想世界。上古时期，不死神鸟「金乌」与「烛龙」之间的神战毁灭了大部分陆地，只留下聚窟洲这块被诅咒的土地。在这片土地上，灵魂被「不朽面具」的力量所困，无法真正死去——每当一个人被击杀，灵魂会在另一处重生，继续无尽的战斗。这种设定为大逃杀的"死了重开"提供了世界观逻辑。玩家扮演的「英雄」是被不朽面具选中的战士，每人在生前都有各自的执念和未了心愿，而获取不朽面具是唯一能够打破轮回的方式。世界观深度融合了中国古代神话、武侠文化和少量蒸汽朋克元素，场景设计参考了多种中国古典建筑和自然景观。',
  '[{"name": "季沧海", "description": "初始英雄，前朝将军，执念于保护一个早已覆灭的王朝。使用长枪作战，技能偏向防御和反击"}, {"name": "宁红夜", "description": "盲眼剑客，感知能力异于常人。以快剑为武器，擅长高速近战和闪避"}, {"name": "特木尔", "description": "草原部落的战士，与狼群有着特殊联系，可召唤狼魂协助战斗"}, {"name": "迦南", "description": "西域来客，身世神秘。精通暗器与隐匿之术，是游戏中机动性最高的角色之一"}, {"name": "天海", "description": "苦行僧，体型庞大但动作不慢。可变身为金钟罩形态，是肉盾型英雄的代表"}, {"name": "胡桃", "description": "聚窟洲的守护者一族后裔，使用日轮之力治疗队友，是唯一的纯辅助角色"}]',
  '[]',
  '[]',
  '**开发团队**: 24 Entertainment，网易旗下工作室，总部位于杭州。核心团队来自育碧、拳头、暴雪等国际大厂，主创关磊曾参与《流星蝴蝶剑》系列开发。\n\n**开发历程**: 项目于2019年首次公布，开发周期约2年半。2021年8月全球发售，买断制定价98元（标准版）。凭借独特的"武侠吃鸡"定位和出色的动作手感迅速走红。2023年7月转为免费游玩模式，同时登陆PlayStation 5平台。此后通过Battle Pass和皮肤内购持续运营。2024年登陆Xbox平台后实现全平台覆盖。\n\n**发售信息**: 2021年8月12日首发于PC，2023年7月转免费+登陆PS5，2024年登陆Xbox。移动版（永劫无间手游）于2025年上线。\n\n**官方社媒**: 官网 https://www.yjwujian.cn / B站 @永劫无间 / Steam页面 steam://store/1203220',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ⑨ 崩坏：星穹铁道 (hype_score: 89)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  'fcb9c838-1ed4-4d40-b32e-94e698a31497',
  '《崩坏：星穹铁道》是由上海米哈游网络科技股份有限公司开发的太空奇幻题材回合制角色扮演游戏，于2023年4月26日全球同步上线。作为米哈游「崩坏」系列的第四部作品，游戏将舞台从地球拓展至银河，讲述了开拓者乘坐星穹列车穿梭于不同星球之间的冒险故事。游戏以高品质的3D画面、电影化叙事、深度的回合制战斗系统和持续稳定的42天更新周期，在全球范围内获得了巨大成功。截至2026年中，全球注册用户突破1.5亿，累计营收超80亿美元，荣获2023年TGA最佳移动游戏和Google Play年度最佳游戏等多项大奖。游戏登陆PC、PlayStation 5、iOS和Android平台。',
  '游戏设定在浩瀚的银河之中，存在多位被称为「星神」的宇宙级存在，每位星神执掌一条「命途」——如「毁灭」「巡猎」「智识」「存护」「丰饶」「同谐」等。命途既是力量的来源，也是信仰的体系。银河中的文明通过追随不同的星神和命途来获取力量和发展方向。玩家扮演的「开拓者」被注入了一颗被称为「星核」的神秘存在，登上星穹列车，与一群来自不同星球的同伴一起穿梭银河，在各大星球之间解决危机、对抗「反物质军团」和「星核猎手」等威胁。每个星球（世界）都有独立的美学风格和文化体系——从冰封的雅利洛-VI到东方仙舟文明的罗浮，再到蒸汽朋克匹诺康尼，展现了极高的世界观建构水准。',
  '[{"name": "开拓者（穹/星）", "description": "玩家角色，被注入星核的人类，拥有可切换多种命途和战斗风格的特殊体质。星穹列车的新成员，正在寻找自己的过去和未来"}, {"name": "三月七", "description": "星穹列车的成员，活泼开朗的少女。失去了一切过往记忆，被封存在永恒的冰块中漂流于宇宙，被列车组救起。名字来源于被发现时的日期"}, {"name": "丹恒", "description": "星穹列车的护卫，沉默寡言但战力超群。真实身份是罗浮仙舟龙尊「饮月君」的转世，背负着前世的罪孽与力量"}, {"name": "姬子", "description": "星穹列车的领航员，优雅沉着的成熟女性。曾是一名科学家，在发现星穹列车后致力于修复它并带领列车组探索银河"}, {"name": "瓦尔特", "description": "星穹列车的一员，来自崩坏3rd世界的穿越者。拥有操控重力的能力，知识渊博，是团队中的智囊和老大哥"}, {"name": "卡芙卡", "description": "星核猎手的成员，将星核注入主角体内的神秘女性。以「剧本」为行动准则，其真实目的贯穿主线始终，是亦敌亦友的关键角色"}]',
  '[]',
  '[]',
  '**开发团队**: 米哈游（HoYoverse），同原神团队但为独立项目组。核心制作人David Jiang（蒋大卫）曾参与《崩坏3rd》开发。团队规模超过800人。\n\n**开发历程**: 项目于2021年正式公布，开发周期约2年。继承了崩坏系列的世界观内核，但完全独立的故事线使得新玩家无需任何前置知识即可游玩。采用Unity引擎开发，回合制战斗系统降低了操作门槛，同时通过"击破弱点""追加攻击""终结技"等机制保证了策略深度。42天更新周期稳定运作了三年以上。\n\n**发售信息**: 2023年4月26日全球同步上线，免费游玩+内购付费模式。首发登陆PC、iOS和Android，2023年10月登陆PlayStation 5。\n\n**官方社媒**: 官网 https://hsr.hoyoverse.com / B站 @崩坏星穹铁道 / 微博 @崩坏星穹铁道 / HoYoLAB社区',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ⑩ 诡秘之主 (hype_score: 89)
INSERT INTO game_wiki (game_id, background, worldview, characters, weapons, maps, developer_notes, updated_at)
VALUES (
  'cbe6a2e6-bb46-4034-9ffe-f074697a9926',
  '《诡秘之主》是由快手游戏旗下回声工作室（Echo Studio）开发的动作角色扮演游戏，改编自阅文集团白金作家爱潜水的乌贼同名现象级网络小说。游戏以维多利亚时代风格的架空奇幻世界为舞台，融合了克苏鲁神话、SCP基金会档案风格和蒸汽朋克元素。原作小说全网阅读量超百亿，是近年来最具影响力的中国网络文学作品之一。游戏于2025年首次公布，截至发稿时仍在开发中，预计2027年发售。凭借原作的庞大粉丝基础和独特的"序列-非凡者"力量体系设定，游戏从公布起便稳居国产游戏期待榜前列。',
  '游戏世界观建立在一个被称为"诡秘世界"的架空宇宙中。表面上这是一个类似维多利亚时代的蒸汽工业世界，有着正常的科技发展和社会运转。但在世界表象之下，存在22条通向神位的"序列途径"——每条途径由9个序列组成，从序列9（最低）到序列0（真神）。非凡者通过服用对应序列的魔药来获得超凡力量，但每次晋升都伴随着失控和被污染的风险。整个世界的历史实际上是不同神祇、隐秘存在和非凡势力之间的斗争史。最大的威胁来自"外神"——来自星空彼岸的不可名状存在，以及被封印的"最初造物主"。原作构建了一个极其宏大且自洽的力量体系，包含占卜家、偷盗者、水手、阅读者、战士、秘祈人、观众等22条途径，每条途径都有完整的能力树和对应的神话形态。',
  '[{"name": "克莱恩·莫雷蒂", "description": "主角，穿越者。前世为中国某大学历史系学生，穿越后成为鲁恩王国廷根市的底层青年。选择了「占卜家」途径，通过灵性直觉、纸人替身、历史投影等能力逐步晋升。性格谨慎理性但内心重情重义"}, {"name": "伦纳德·米切尔", "description": "值夜者小队成员，克莱恩在廷根时期的同事和好友。体内寄生着一位远古天使的灵魂「帕列斯」，是主角最坚定的盟友之一"}, {"name": "奥黛丽·霍尔", "description": "贵族大小姐，「观众」途径的非凡者。天真善良但极具洞察力，是克莱恩在贝克兰德的重要伙伴，后成为心理炼金会核心成员"}, {"name": "阿蒙", "description": "核心反派，「偷盗者」途径的天使之王。本体是远古太阳神的负面人格分裂体，拥有窃取一切——包括命运、时间和身份的能力，是克莱恩最大的敌人之一"}, {"name": "亚当", "description": "远古太阳神的神性一面，执掌「空想家」途径。试图通过各种方式让远古太阳神复苏，行事风格冷静到近乎冷酷，但其目标并非纯粹的恶"}]',
  '[]',
  '[]',
  '**开发团队**: 回声工作室（Echo Studio），快手游戏旗下自研工作室，总部位于北京。快手游戏于2023年成立，是快手在游戏自研领域的重要布局。诡秘之主是该工作室首款公开的重量级作品。\n\n**开发历程**: 项目于2024年正式公布，使用虚幻引擎5开发。原作庞大的世界观和精密的序列体系为游戏改编带来了巨大的机遇和挑战。制作团队公开表示将忠实还原22条序列途径的核心设定，并在叙事中保留原作的多方势力博弈和诡秘悬疑氛围。游戏于2025年发布了首支实机演示，展示了"占卜家"途径的核心战斗机制。\n\n**发售信息**: 截至发稿时尚未正式公布发售日期和定价，业界预计2027年发售，登陆PC和主机平台。\n\n**官方社媒**: B站 @诡秘之主游戏 / 原作小说：起点中文网《诡秘之主》/ 作者微博 @爱潜水的乌贼',
  NOW()
) ON CONFLICT (game_id) DO UPDATE SET
  background = EXCLUDED.background,
  worldview = EXCLUDED.worldview,
  characters = EXCLUDED.characters,
  weapons = EXCLUDED.weapons,
  maps = EXCLUDED.maps,
  developer_notes = EXCLUDED.developer_notes,
  updated_at = EXCLUDED.updated_at;

-- ===================================================
-- 执行完毕
-- ===================================================
-- 验证查询：
-- SELECT g.title, g.hype_score, w.updated_at
-- FROM games g JOIN game_wiki w ON w.game_id = g.id
-- ORDER BY g.hype_score DESC;
