-- ═══════════════════════════════════════════
-- 国游爆料 · 游戏库全面更新 | 2026-06-04
-- 更新 8 款已有游戏 + 新增 7 款 = 15 款
-- ═══════════════════════════════════════════

-- ============================================
-- 一、更新已有游戏（8款）
-- ============================================

-- 1. 归唐（已有）
UPDATE games SET
  english_title = 'Blood Message',
  developer = '网易雷火·临安24工作室',
  publisher = '网易游戏',
  genre = ARRAY['动作冒险','开放世界','历史','叙事'],
  platforms = ARRAY['PC','PS5','Xbox Series X|S'],
  release_date = '2026-10-18',
  status = 'announced',
  hype_score = 94,
  description = '网易首款自研买断制3A单机。公元848年安史之乱后，沙州敦煌无名信使穿越三千里敌占区向长安传递密信的悲壮史诗。UE5打造，写实冷兵器搏杀+潜行暗杀+生存资源管理，线性关卡×电影化叙事。6月6日夏日游戏节12分钟实机首曝，将成PS5 Pro首发护航游戏。Steam国区298元。',
  updated_at = NOW()
WHERE title = '归唐';

-- 2. 影之刃零（已有）
UPDATE games SET
  developer = '灵游坊',
  publisher = '灵游坊',
  genre = ARRAY['动作RPG','武侠','暗黑','功夫朋克'],
  platforms = ARRAY['PC','PS5','PS5 Pro'],
  release_date = '2026-10-29',
  status = 'announced',
  hype_score = 95,
  description = '暗黑武侠功夫朋克。主角灵魂雨生命仅剩66天，全人类手工制作拒绝AI。主线20-30小时，愿望单破百万。原定9月9日，6月3日官宣跳票50天至10月29日：升级角色模型、重构场景打破灰暗印象、不依赖光追的性能优化。索尼将举办专属State of Play（15-20分钟深度解析），夏季开启预购。',
  updated_at = NOW()
WHERE title = '影之刃零';

-- 3. 黑神话：悟空（已有）
UPDATE games SET
  developer = '游戏科学',
  publisher = '游戏科学',
  genre = ARRAY['动作RPG','神话','魂系','开放世界'],
  platforms = ARRAY['PC','PS5','Xbox Series X|S'],
  release_date = '2024-08-20',
  status = 'released',
  hype_score = 98,
  rating = 9.5,
  description = '国产3A开山之作。基于《西游记》改编，全球销量超2000万份，TGA年度最佳动作游戏。第二个DLC"西天取经"2026年8月发售，新增可玩角色猪八戒，流程约15小时。游戏科学正在预研黑神话续作。第三个项目代号"山海"以山海经+西游世界观打造开放世界。',
  updated_at = NOW()
WHERE title = '黑神话：悟空';

-- 4. 燕云十六声（已有）
UPDATE games SET
  developer = '网易Everstone工作室',
  publisher = '网易游戏',
  genre = ARRAY['开放世界','武侠','历史','MMO'],
  platforms = ARRAY['PC','PS5','移动端'],
  release_date = '2025-12-26',
  status = 'released',
  hype_score = 72,
  description = '网易开放世界武侠巨制。五代十国历史背景，单人模式×多人模式双线并行。2025年12月26日正式上线，免费游玩+外观付费。2026年5月28日推出"皇宫"资料片，PS5 Pro版支持光线追踪反射和PSSR超分辨率。',
  updated_at = NOW()
WHERE title = '燕云十六声';

-- 5. 湮灭之潮（已有）
UPDATE games SET
  developer = '蛇夫座·日蚀边缘',
  publisher = '腾讯',
  genre = ARRAY['动作ACT','科幻','亚瑟王','奇幻'],
  platforms = ARRAY['PC','PS5','Xbox Series X|S'],
  release_date = NULL,
  status = 'in-dev',
  hype_score = 88,
  description = '腾讯旗下100人成都团队。亚瑟王传说×伦敦废墟，鬼泣式高速ACT，骑士协同战斗系统，30+Boss战，主线超30小时。今夏成都线下试玩面向全体玩家开放报名。团队含世嘉育碧卡普空资深开发者。',
  updated_at = NOW()
WHERE title = '湮灭之潮';

-- 6. 黑神话：钟馗（已有）
UPDATE games SET
  developer = '游戏科学',
  publisher = '游戏科学',
  genre = ARRAY['动作RPG','神话','捉鬼','开放世界'],
  platforms = ARRAY['PC','PS5'],
  release_date = '2027',
  status = 'in-dev',
  hype_score = 92,
  description = '游戏科学第二款3A独立作品。以钟馗为主角，UE5打造全新捉鬼宇宙。团队已扩至165人。2026年2月冯骥发布6分钟实机短片（无战斗纯场景），马年新春祝福非正式预告。',
  updated_at = NOW()
WHERE title = '黑神话：钟馗';

-- 7. 望月（已有）
UPDATE games SET
  developer = '月灵工作室',
  publisher = '独立',
  genre = ARRAY['开放世界','魂系','都市','动作'],
  platforms = ARRAY['PC'],
  release_date = '2026-12-01',
  status = 'in-dev',
  hype_score = 78,
  description = '老广都市风开放世界。月灵协战+五行克制+骇入系统融合玩法，2026年6月广州线下试玩开放。独特的广式都市×魂系美学的碰撞。',
  updated_at = NOW()
WHERE title = '望月';

-- 8. 锦衣卫（已有）
UPDATE games SET
  developer = '成都离忧',
  publisher = '独立',
  genre = ARRAY['动作RPG','武侠','历史','写实'],
  platforms = ARRAY['PC'],
  release_date = NULL,
  status = 'announced',
  hype_score = 65,
  description = '国产武侠动作新作。以明朝锦衣卫为背景，主打写实搏杀与历史沉浸感。独立团队打造，剑走偏锋的暗黑武侠风格。',
  updated_at = NOW()
WHERE title = '锦衣卫';

-- ============================================
-- 二、新增游戏（7款）
-- ============================================

-- 9. 失落之魂
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('失落之魂', 'Lost Soul Aside', '杨冰工作室', '索尼互动娱乐', ARRAY['动作RPG','科幻','奇幻'], ARRAY['PC','PS5','Xbox Series X|S'], '2026-09-12', 'announced',
'一个人的梦想变成3A大作。制作人杨冰独立开发原型，后获索尼中国之星计划支持，团队逐步扩张。高速ACT战斗×电影化叙事，华丽的连招系统和变身机制。最终发售日锁定2026年9月12日，预购特典含"冰魄剑"。3个大型DLC已规划，首个DLC"冰原之境"2027年1月推出。', 85);

-- 10. 雪中悍刀行
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('雪中悍刀行', NULL, '腾讯光子R工作室', '腾讯游戏', ARRAY['动作','武侠','3A'], ARRAY['PC','移动端'], '2026-12-01', 'in-dev',
'腾讯光子首款3A武侠动作游戏，改编自烽火戏诸侯同名小说。创新采用"中式撤离"核心玩法——在开放世界中搜集武功秘籍和神兵利器，击败对手安全撤离。已获得版号，预计2026年Q4开启首次测试。', 76);

-- 11. 源初之结
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('源初之结', 'Primeval Bond', '米哈游', '米哈游', ARRAY['开放世界','奇幻','动作','UE5'], ARRAY['PC','PS5','Xbox Series X|S'], '2027-12-01', 'in-dev',
'米哈游首款UE5写实奇幻开放世界。蔡浩宇亲自带队，完全无二次元元素，主打上古奇幻世界观。巨型BOSS战×4人联机合作，商标已正式通过审查。已进入封闭测试阶段，预计2027年Q4发售。这是米哈游从抽卡向买断制3A的战略转型之作。', 91);

-- 12. 万民长歌：三国
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('万民长歌：三国', NULL, '腾讯', '腾讯游戏', ARRAY['策略','RPG','历史','三国'], ARRAY['PC'], '2026-09-01', 'in-dev',
'腾讯历史策略RPG，以三国为背景，注重历史沉浸感和策略深度。玩家不再扮演名将，而是从普通百姓视角见证三国时代的兴衰变迁。融合角色扮演与策略经营，打造"小人物的大历史"。', 70);

-- 13. 剑来
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('剑来', NULL, '腾讯光子R工作室', '腾讯游戏', ARRAY['开放世界','仙侠','3A','动作'], ARRAY['PC'], '2027-06-01', 'in-dev',
'腾讯光子3A仙侠开放世界。改编自烽火戏诸侯同名网络小说，以剑气长城为核心场景，打造"万剑归宗"式战斗系统。UE5开发，强调东方仙侠美学和自由探索。预计2027年正式公布。', 82);

-- 14. 诡秘之主
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('诡秘之主', 'Lord of Mysteries', '网易', '网易游戏', ARRAY['动作RPG','克苏鲁','奇幻','开放世界'], ARRAY['PC','PS5'], '2027-03-01', 'in-dev',
'网易改编自乌贼同名现象级网络小说。融合蒸汽朋克×克苏鲁神话的独特世界观，22条序列途径自由选择。非线性格局×SAN值系统，UE5呈现维多利亚时代伦敦的诡秘氛围。目前处于预研阶段，概念图已流出。', 89);

-- 15. 锦衣卫2（代号：绣春刀）
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score)
VALUES ('代号：无限大', 'Project: Infinite', '网易', '网易游戏', ARRAY['开放世界','都市','超能力','动作'], ARRAY['PC','PS5','移动端'], '2026-12-01', 'in-dev',
'网易都市超能力开放世界。玩家在近未来都市中觉醒超能力，自由探索、战斗、解谜。高自由度交互系统，城市中几乎所有物体可互动。多人联机合作×单人剧情双模式。PV首曝后被誉为"中国版GTA+控制"。', 80);

-- ============================================
-- 验证
-- ============================================
-- SELECT title, developer, release_date, status, hype_score FROM games ORDER BY hype_score DESC;
