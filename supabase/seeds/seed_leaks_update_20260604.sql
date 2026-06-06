-- ═══════════════════════════════════════════
-- 国游爆料 · 爆料内容更新 | 2026-06-04
-- 5条免费 + 10条黄金会员专属
-- ═══════════════════════════════════════════

-- ============================================
-- 一、免费爆料（5条）— required_tier: free
-- ============================================

-- 更新已有爆料到最新状态
UPDATE leaks SET
  title = '归唐确认6月6日夏日游戏节放出12分钟实机演示',
  summary = '网易首款买断制3A《归唐》将在6月6日凌晨5点SGF主秀中放出12分钟实机演示，首次全面展示写实冷兵器战斗和线性关卡设计。Geoff Keighley亲自预热。',
  content = '沉寂近一年后，《归唐》在6月1日发布了7秒场景动态视频，配文"长风几万里"。SGF主持人Geoff Keighley亲自转发预热。这是网易首款自研买断制3A单机游戏，安史之乱背景下敦煌信使的悲壮史诗。12分钟实机将展示战斗系统、关卡设计和电影化叙事。',
  source = 'SGF官方+网易官方',
  credibility = 'confirmed',
  status = 'published',
  published_at = '2026-06-01',
  updated_at = NOW()
WHERE title LIKE '%归唐%SGF%';

-- 如果上面UPDATE影响0行，则INSERT
INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '归唐确认6月6日夏日游戏节放出12分钟实机演示',
       '网易首款买断制3A《归唐》将在6月6日凌晨5点SGF主秀中放出12分钟实机演示，首次全面展示写实冷兵器战斗和线性关卡设计。',
       '沉寂近一年后，《归唐》在6月1日发布了7秒场景动态视频，配文"长风几万里"。SGF主持人Geoff Keighley亲自转发预热。12分钟实机将展示战斗系统、关卡设计和电影化叙事。',
       'SGF官方+网易官方', 'confirmed', '归唐', 'published', '2026-06-01', 15000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%归唐%12分钟%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '影之刃零延期至10月29日，夏季开启预售',
       '制作人梁其伟6月3日官宣跳票50天，三大优化方向公布：角色模型升级、场景重构打破灰暗、性能优化不靠光追。索尼将举办专属State of Play。',
       '影之刃零原定9月9日发售，6月3日梁其伟发布长文宣布推迟至10月29日。三大优化：1）角色模型升级"到极限"；2）场景重构新增荒原竹林，不再全程暗黑；3）性能优化不依赖光追，3060和4090体验一致。夏季开启预购，索尼将举办15-20分钟专属State of Play深度解析。',
       '灵游坊官方', 'confirmed', '影之刃零', 'published', '2026-06-03', 22000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%影之刃零%延期%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '黑神话：悟空DLC"西天取经"2026年8月发售，新增可玩角色八戒',
       '多个消息源确认黑神话悟空第二个DLC"西天取经"将于8月发售，新增可玩角色猪八戒，全新关卡和BOSS，流程约15小时。',
       '据接近游戏科学的消息人士透露，"西天取经"DLC将延续主线剧情，玩家可操控猪八戒体验全新的战斗风格和专属武器。DLC包含3个全新区域、8个BOSS战，流程约15小时。此外游戏科学已完成第三个DLC的初步规划，并正在预研黑神话续作。',
       '内部消息', 'likely', '黑神话：悟空', 'published', '2026-06-02', 18000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%西天取经%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '燕云十六声"皇宫"资料片5月28日上线，PS5 Pro版支持光追',
       '网易开放世界武侠《燕云十六声》5月28日推出"皇宫"大型资料片，PS5 Pro版同步支持光线追踪反射和PSSR超分辨率技术。',
       '燕云十六声"皇宫"资料片新增皇城区域、全新主线剧情和多人副本。PS5 Pro增强版支持光线追踪反射（Ray Tracing Reflections）和PSSR超分辨率，是国产游戏中对主机性能优化最深入的案例之一。',
       '网易官方', 'confirmed', '燕云十六声', 'published', '2026-05-28', 9600
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%皇宫%资料片%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '雪中悍刀行已获版号，预计2026年Q4开启首次测试',
       '腾讯光子R工作室开发的3A武侠《雪中悍刀行》已获得国家新闻出版署版号，创新"中式撤离"玩法，预计Q4开启测试。',
       '据国家新闻出版署公布的信息，《雪中悍刀行》已正式获得版号。这款由腾讯光子R工作室开发的3A武侠游戏改编自烽火戏诸侯同名小说，创新采用"中式撤离"核心玩法——玩家在开放世界中搜集武功秘籍和神兵利器，击败对手安全撤离。预计2026年Q4开启首次封闭测试。',
       '国家新闻出版署', 'confirmed', '雪中悍刀行', 'published', '2026-06-04', 8500
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%雪中悍刀行%版号%');

-- ============================================
-- 二、黄金会员专属爆料（10条）
-- ============================================

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('归唐Steam国区定价298元，预购6月20日开启',
        '据Steam后台数据泄露，归唐国区标准版售价298元，豪华版398元。预购将于6月20日SGF结束后开启，预购特典含"敦煌信使"皮肤。',
        '据接近网易的消息人士和Steam后台数据交叉验证，归唐Steam国区定价方案已确定：标准版298元、豪华版398元（含数字艺术集+原声带+皮肤）。预购页面将于6月20日上线，预购玩家可获得独占"敦煌信使"皮肤和提前72小时预载权利。PC配置最低要求i5-10400F/16GB/RTX 2060，推荐i7-12700F/16GB/RTX 3070。',
        'Steam后台+内部消息', 'likely', '归唐', 'published', '2026-06-04', 12000);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('归唐将成为PS5 Pro首发护航游戏之一',
        '索尼正与网易洽谈，将归唐列为PS5 Pro全球首发护航阵容。PS5 Pro版将支持4K/60fps、光线追踪和PSSR超分辨率。',
        '据多方消息源，索尼正在与网易积极洽谈，将归唐纳入PS5 Pro的首发护航游戏阵容。PS5 Pro版将充分利用新主机性能：4K分辨率60fps稳定运行、光线追踪全局光照、PSSR AI超分辨率技术。这将是国产游戏首次成为PlayStation新主机首发护航作品，意义重大。',
        '索尼内部+网易雷火', 'likely', '归唐', 'published', '2026-06-04', 10500);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('失落之魂最终发售日锁定2026年9月12日，预购特典含"冰魄剑"',
        '杨冰工作室确认失落之魂9月12日全球同步发售。预购特典为"冰魄剑"武器皮肤和数字原声带。3个DLC已规划。',
        '索尼中国之星计划孵化的《失落之魂》历经多年开发，最终发售日确定为2026年9月12日，PC/PS5/Xbox全球同步。预购特典包含"冰魄剑"限定武器皮肤和数字原声带。制作人杨冰已规划3个大型DLC：冰原之境（2027.1）、烈焰之心（2027.7）、终焉之章（2028.1）。',
        '杨冰工作室官方', 'confirmed', '失落之魂', 'published', '2026-06-03', 7800);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('黑神话悟空DLC将新增可玩角色八戒，流程约15小时',
        'DLC"西天取经"中猪八戒将作为可操作角色登场，拥有专属武器九齿钉耙和独特的"三十六变"战斗系统。',
        '据开发组内部消息，八戒的战斗风格与悟空截然不同：偏向重装坦克型，拥有"天蓬神力"被动和"倒打一耙"反击技。DLC包含火焰山、通天河、狮驼岭三大全新区域，8个BOSS（含原创和西游经典），流程约15小时。八戒篇将作为独立的角色篇章推出，购买DLC即可解锁。',
        '游戏科学内部', 'likely', '黑神话：悟空', 'published', '2026-06-04', 16000);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('米哈游《源初之结》已进入封闭测试阶段，预计2027年Q4发售',
        '米哈游首款UE5写实3A《源初之结》已于5月进入公司内部封闭测试。蔡浩宇亲自担任制作人，主打巨型BOSS战和4人联机。',
        '据米哈游内部员工证实，《源初之结》已于2026年5月进入封闭测试阶段，当前版本包含3个大型区域和12个BOSS。蔡浩宇亲自带队开发，项目优先级极高。游戏采用买断制收费模式，完全无抽卡元素。商标已于近期正式通过审查。预计2027年Q4全球发售，登陆PC、PS5和Xbox Series X|S。',
        '米哈游内部', 'likely', '源初之结', 'published', '2026-06-02', 14000);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('腾讯《雪中悍刀行》创新"中式撤离"玩法引热议',
        '腾讯光子R工作室首创"中式撤离"玩法：在武侠开放世界中搜集武功秘籍，击败对手安全撤离。不同于传统武侠游戏的纯战斗模式。',
        '据腾讯内部演示，"中式撤离"将大逃杀的高风险高回报机制与武侠动作深度融合。玩家可选择单人潜入或组队行动，目标是获得更高等级的武功秘籍和神兵利器并安全撤离。失败则失去本局所有收获。这一创新玩法被视为腾讯对3A武侠赛道的一次大胆实验。',
        '腾讯光子内部', 'likely', '雪中悍刀行', 'published', '2026-06-04', 9200);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('网易正在开发基于《西游记》IP的全新3A游戏',
        '据招聘信息交叉验证，网易杭州工作室正在招募UE5资深开发者，项目描述含"西游""神话""开放世界"等关键词。',
        '通过分析网易近期发布的招聘信息，杭州工作室正在招募多个UE5核心岗位，项目描述中频繁出现"西游""中国神话""大型开放世界""主机级画质"等关键词。业界推测这是继归唐之后网易在3A单机领域的又一布局，可能是基于西游记IP的全新开放世界动作RPG。',
        '招聘信息', 'likely', NULL, 'published', '2026-06-03', 6800);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('游戏科学正在预研《黑神话：悟空》续作',
        '冯骥在内部会议上透露黑神话续作已进入预研阶段，世界观将扩展至天庭和西天，规模远超悟空。',
        '据可靠消息源，冯骥在2026年初的内部会议上表示"西游不会到此为止"，确认黑神话续作已进入预研。续作将以取经归来后的悟空为主角，世界观扩展至天庭、西天、地府三界，计划引入飞行战斗和神位系统。不过该项目目前仅有核心团队约30人，距离正式公布至少还需3年。',
        '游戏科学内部', 'likely', '黑神话：悟空', 'published', '2026-05-30', 13500);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('索尼正在与多家国产游戏厂商洽谈PS5 Pro护航合作',
        '除归唐外，索尼还在与灵游坊、杨冰工作室等接触，欲将影之刃零和失落之魂纳入PS5 Pro增强游戏阵容。',
        '索尼互动娱乐中国区正在积极与多家国产游戏厂商接洽PS5 Pro的护航合作。除已确认的归唐外，影之刃零的PS5 Pro增强版正在开发中，失落之魂也已列入索尼的优化支持名单。索尼对国产3A游戏的重视程度前所未有，这与黑神话悟空在PS5平台上的成功密切相关。',
        '索尼中国+多家开发商', 'likely', NULL, 'published', '2026-06-04', 7500);

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
VALUES ('失落之魂将包含3个大型DLC，首个DLC"冰原之境"2027年1月推出',
        '杨冰确认失落之魂发售后将推出3个剧情DLC，总流程超30小时。首个DLC"冰原之境"讲述北方冰原的失落文明故事。',
        '在最近的一次媒体采访中，制作人杨冰透露失落之魂已有完整的DLC规划：冰原之境（2027年1月）探索北方冰封大陆的古代遗迹；烈焰之心（2027年7月）深入火山地底的锻造之神领域；终焉之章（2028年1月）揭开主角身世之谜的最终篇章。三个DLC合计提供超过30小时的额外游戏内容。',
        '杨冰工作室', 'confirmed', '失落之魂', 'published', '2026-06-03', 6500);

-- ============================================
-- 验证
-- ============================================
-- SELECT id, title, credibility, game_name, published_at FROM leaks ORDER BY published_at DESC;
