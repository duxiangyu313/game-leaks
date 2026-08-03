-- 国产3A游戏数据库更新 — 2026年8月2日
-- 基于：CJ Day 3 国风单机霸屏 + 时空低语20亿官宣 + 雾影猎人销量口碑 + 明末无常夏思源专访
-- 执行环境：Supabase SQL Editor

-- ═══════════════════════════════════════════
-- 🔴 一、数据错误修复
-- ═══════════════════════════════════════════

-- 1. 昭和米国物语：状态修正（误标为 released，实际未发售）
UPDATE games
SET status = 'in-dev',
    description = '铃空游戏开发。80年代日本被美国文化殖民的架空世界，丧尸题材开放世界ARPG。中/日/英三语配音。确认参展2026年8月26-30日科隆游戏展，将公开全新预告片并首次提供线下实机试玩。预计2026年内发售，目前处于最后打磨阶段。'
WHERE title = '昭和米国物语';

-- 2. 明末：渊虚之羽 — 修正标题错字（末→明）+ 更新IP转移/递归海豚信息
UPDATE games
SET title = '明末：渊虚之羽',
    developer = '递归海豚',
    publisher = '505 Games',
    status = 'announced',
    description = '黑暗奇幻ARPG。前作全球玩家突破500万，Steam首周峰值13.1万，收入超3000万欧元。2026年7月，505 Games以约400万欧元从灵泽科技购得IP完整版权，与制作人夏思源新工作室"递归海豚"签署续作开发协议。续作首期投资2150万欧元（约1.66亿人民币），延续ARPG方向，无常继续担任主角。目前处于早期筹备阶段，发售日期未公布。'
WHERE title = '末日：渊虚之羽';

-- 3. 修正早期 leak 中影之刃零的过期发售日期
UPDATE leaks
SET content = replace(content, '10月27日', '10月29日')
WHERE title LIKE '%影之刃零%' AND content LIKE '%10月27日%';


-- ═══════════════════════════════════════════
-- 🟡 二、新增游戏（games 表）
-- ═══════════════════════════════════════════

-- 4. 时空低语 — 国产首款科幻3A
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score, rating)
VALUES ('时空低语', 'The Temporal Whisper', '北京星辰无双', '星辰无双', ARRAY['动作ACT','科幻','冒险'], ARRAY['PC','PS5','Xbox'], NULL, 'in-dev',
  '国产首款科幻3A动作冒险单机游戏，虚幻引擎开发。创始人兼CEO濮冠楠历时20年写成22万字同名小说（2026年底作家出版社出版）。四个线性章节+一个半开放章节，低学习成本快节奏体验。科幻框架下融入敦煌等中华文化符号。计划四年内投入20亿元人民币以上，核心团队平均十余年研发经验。2026年8月1日CDEC全球游戏产业大会正式披露。',
  85, NULL)
ON CONFLICT DO NOTHING;

-- 5. 雾影猎人 — 补入 games 主表（game_progress 已存在但 games 缺失）
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score, rating)
VALUES ('雾影猎人', 'Mist Hunter', 'Bellring Games（朝夕光年）', '字节跳动', ARRAY['动作ACT','黑暗奇幻','搜打撤','PvPvE'], ARRAY['PC'], '2026-07-30', 'released',
  '字节跳动旗下虚幻5黑暗奇幻动作搜打撤游戏。7月30日Steam全球发售，标准版88元/豪华版138元。首发登顶Steam国区畅销榜冠军、全球畅销榜TOP 2，峰值在线2.4万人。六种职业（佣兵/影枭/黑箭/巫师/先知/凋零骑士），冷兵器+魔法战斗。国区好评率仅37%（多半差评），槽点集中在优化闪退、强制PvPvE、商业化定价。官方已发布修复规划，纯PvE模式列入后续。',
  78, 5.9)
ON CONFLICT DO NOTHING;

-- 6. 潜阈限界 — 中国之星计划，开发进入最终阶段
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score, rating)
VALUES ('潜阈限界', 'EXILEDGE', '苏州谜匣数娱', '待公布', ARRAY['射击','动作','科幻','Roguelike'], ARRAY['PC','PS5'], NULL, 'in-dev',
  '索尼中国之星计划第三期入选作品。次世代第三人称高速动作射击游戏，设定在被海洋与构造体覆盖的末世星球，玩家扮演"潜塔者"在巨型构造体中冒险。独特机制：摩托车可召唤/突击/自爆，鼓励近战与射击无缝衔接，融入肉鸽元素与技能树系统。开发已进入最终阶段，距离正式发售不远。日媒automaton给予好评。2026 ChinaJoy PlayStation展台提供全新试玩关卡。',
  72, NULL)
ON CONFLICT DO NOTHING;

-- 7. 达巴：水痕之地 — 中国之星计划，东方奇幻类魂
INSERT INTO games (title, english_title, developer, publisher, genre, platforms, release_date, status, description, hype_score, rating)
VALUES ('达巴：水痕之地', 'Daba: Land of Water Scar', '上海暗星科技', '待公布', ARRAY['动作RPG','奇幻','类魂'], ARRAY['PC','PS5'], NULL, 'in-dev',
  '索尼中国之星计划第三期入选作品。东方奇幻题材动作RPG，玩家扮演人形泥偶在古格群城中追寻水之残片。主打弹反流战斗（R2键反击），高风险高回报，区别于传统翻滚闪避。场景覆盖废墟/雪原/裂谷/漂浮鸦骸城，非线性关卡相互关联。2026 ChinaJoy PlayStation展台提供试玩。',
  70, NULL)
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════
-- 🔵 三、更新已有游戏描述
-- ═══════════════════════════════════════════

-- 8. 影之刃零 — 补CJ缺席+科隆参展+State of Play
UPDATE games
SET description = '暗黑武侠功夫朋克。主角生命仅剩66天，全人类手工制作拒绝AI。主线接近50小时，30余种中式传统兵器，研发成本3-4亿元。7月23日版号获批（PC+PS5双端），7月24日登陆WeGame开启预约（已破11万），Steam愿望单破百万半数来自海外。原定9月9日发售，为升级角色模型精度和重制核心场景延期至10月29日全球同步发售。本届ChinaJoy不设官方展台，重心放在8月26-30日科隆游戏展。PlayStation夏季State of Play专属深度解析节目（15-20分钟）。夏季开启全球预购。Gamescom LATAM 2026获"最佳PC游戏"+"最佳展台"双料大奖。'
WHERE title = '影之刃零';

-- 9. 猿公剑 — 补CJ试玩细节
UPDATE games
SET description = '国产单机动作RPG，由成都剑猫熊开发。独创"拦截"防御系统，区别于传统魂系翻滚/格挡，要求根据敌人攻击方向精准操作。"避青入红"剑斗系统，高速拼刀+精准弹反，硬核动作。女主裴三娘设定引发海外热议，东方美学出圈。2026 ChinaJoy顺网科技展台开放试玩，设有"15分钟限时BOSS挑战赛"，击败BOSS"猿公"可获限量礼品。IGN等海外媒体已进行实机试玩报道。具体发售日期未公布。'
WHERE title = '猿公剑';

-- 10. 抵抗者 — 补CJ试玩信息
UPDATE games
SET description = '国产抗日题材FPS，UE5打造。融合谍战解谜与动作射击，被称为"中国版使命召唤式线性叙事体验"。2026 ChinaJoy首次对外开放线下试玩，口碑超预期。预计2026年Q4发售。'
WHERE title = '抵抗者';


-- ═══════════════════════════════════════════
-- 🟢 四、game_progress 同步更新
-- ═══════════════════════════════════════════

-- 11. 新增 game_progress 条目
INSERT INTO game_progress (name, development_stage, estimated_release_date, credibility_score, last_updated)
VALUES
  ('时空低语', '原型开发', '2029-12-01', 8, NOW()),
  ('潜阈限界', '压盘阶段', '2026 Q4', 7, NOW()),
  ('达巴：水痕之地', 'Alpha测试', '2027-12-01', 6, NOW())
ON CONFLICT DO NOTHING;

-- 12. 更新雾影猎人 game_progress（补发行后数据）
UPDATE game_progress
SET development_stage = '已发售',
    estimated_release_date = '2026-07-30',
    credibility_score = 10,
    gold_info = '【最新进展】雾影猎人已于7月30日正式发售，登顶Steam国区畅销榜冠军。国区好评率37%，玩家反馈集中在优化和平衡性。官方已发布修复路线图。国游温度计持续追踪后续更新。',
    diamond_info = '【Diamond独家】雾影猎人首发深度数据：Steam国区销冠+全球TOP 2，峰值2.4万在线。商业化分析：买断制88元+内购时装（全服可见时装成本约1200元）。六职业强度排行：影枭/黑箭远程压制过强。官方承诺纯PvE模式列入后续规划。',
    last_updated = NOW()
WHERE name = '雾影猎人';

-- 13. 影之刃零 game_progress — 补延期+CJ缺席信息
UPDATE game_progress
SET gold_info = '【最新进展】影之刃零延期至10月29日全球发售。原定9月9日为升级角色模型和场景品质而主动延期。缺席本届ChinaJoy，全力备战8月26-30日科隆游戏展。PlayStation夏季State of Play将播出15-20分钟深度解析。WeGame预约已破11万，夏季开启全球预购。',
    diamond_info = '【Diamond独家】影之刃零延期内幕：角色模型精度全面升级+核心场景完全重制。科隆展将展出全新Boss战实机。State of Play录制已完成，将独家展示此前从未公开的支线区域。预购奖励为限定皮肤+原声带数字版。Gamescom LATAM双料大奖得主。',
    last_updated = NOW()
WHERE name = '影之刃零';

-- 14. 昭和米国物语 game_progress — 补科隆确认
UPDATE game_progress
SET development_stage = 'Alpha测试',
    estimated_release_date = '2026 Q4',
    credibility_score = 8,
    gold_info = '【最新进展】昭和米国物语确认参展2026年8月26-30日科隆游戏展，将公开全新预告片并首次提供线下实机试玩。中/日/英三语配音，2026年内发售。目前进入最后打磨阶段。',
    diamond_info = '【Diamond独家】昭和米国物语科隆展出内容：全新预告片将揭示此前未公开的东京地图区域。线下试玩版包含约30分钟流程，覆盖探索+战斗+叙事三个维度。团队规模约60人，开发周期已超4年。2026年Q4发售窗口锁定。',
    last_updated = NOW()
WHERE name = '昭和米国物语';

-- 15. 明末：渊虚之羽 game_progress — 递归海豚续作
UPDATE game_progress
SET development_stage = '原型开发',
    estimated_release_date = '2028-12-01',
    credibility_score = 9,
    gold_info = '【最新进展】明末IP已由505 Games以400万欧元（约3200万人民币）从灵泽科技购得完整版权。制作人夏思源成立新工作室"递归海豚"，与505 Games签署续作开发协议。续作首期投资2150万欧元（约1.66亿人民币），无常继续担任主角。目前处于早期筹备阶段，各团队逐步运转。',
    diamond_info = '【Diamond独家】明末IP交易细节：Digital Bros 2026年4月完成IP收购。夏思源"递归海豚"工作室已初具规模，部分原团队成员加入。505 Games负责全部资金+全球发行，递归海豚主导创意。续作延续ARPG方向，玩法细节待公布。夏思源CJ专访："把该做的事做好"。',
    last_updated = NOW()
WHERE name = '明末：渊虚之羽';

-- 如果 game_progress 里不存在明末条目则新增
INSERT INTO game_progress (name, development_stage, estimated_release_date, credibility_score, last_updated, gold_info, diamond_info)
SELECT '明末：渊虚之羽', '原型开发', '2028-12-01', 9, NOW(),
  '【最新进展】明末IP已由505 Games以400万欧元从灵泽科技购得完整版权。夏思源成立新工作室"递归海豚"，续作首期投资2150万欧元（约1.66亿人民币），无常继续担任主角。早期筹备阶段。',
  '【Diamond独家】明末IP交易细节：Digital Bros 2026年4月完成收购。递归海豚已初具规模。505 Games全资+全球发行。续作ARPG方向不变，具体玩法和发售日待公布。'
WHERE NOT EXISTS (SELECT 1 FROM game_progress WHERE name = '明末：渊虚之羽');


-- ═══════════════════════════════════════════
-- ⚠️ 变更摘要
-- ═══════════════════════════════════════════
-- 修复：昭和米国物语状态(released→in-dev)、明末标题错字(末日→明末)、影之刃零leak过期日期
-- 新增 games：时空低语、雾影猎人、潜阈限界、达巴：水痕之地
-- 更新 games：影之刃零(CJ缺席+科隆)、猿公剑(CJ试玩)、抵抗者(CJ试玩)
-- 新增 game_progress：时空低语、潜阈限界、达巴：水痕之地、明末：渊虚之羽
-- 更新 game_progress：雾影猎人(已发售+数据)、影之刃零(延期+科隆)、昭和米国(科隆)、明末(递归海豚)
-- 发布时间：2026-08-02 20:00
