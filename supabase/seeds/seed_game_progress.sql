-- ============================================================
-- 游戏开发进度数据库 (Game Progress Tracker)
-- 国产3A游戏开发状态追踪 · 付费内容模块
-- ============================================================

-- 1. 建表
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cover_url TEXT,
  developer TEXT,
  publisher TEXT,
  genre TEXT,
  development_stage TEXT NOT NULL DEFAULT '概念阶段'
    CHECK (development_stage IN ('概念阶段', '原型开发', 'Alpha测试', 'Beta测试', '压盘阶段', '已发售')),
  estimated_release_date TEXT,
  team_size INTEGER,
  last_updated TIMESTAMPTZ DEFAULT now(),
  credibility_score INTEGER DEFAULT 5 CHECK (credibility_score >= 1 AND credibility_score <= 10),
  public_info TEXT DEFAULT '',
  silver_info TEXT DEFAULT '',
  gold_info TEXT DEFAULT '',
  risk_assessment TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS 安全策略
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

-- 所有人可读取
CREATE POLICY "Public read game_progress" ON game_progress
  FOR SELECT USING (true);

-- 管理员（diamond）可写入
CREATE POLICY "Admin write game_progress" ON game_progress
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE membership = 'diamond'));

CREATE POLICY "Admin update game_progress" ON game_progress
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE membership = 'diamond'));

CREATE POLICY "Admin delete game_progress" ON game_progress
  FOR DELETE USING (auth.uid() IN (SELECT id FROM profiles WHERE membership = 'diamond'));

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_game_progress_featured ON game_progress(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_game_progress_stage ON game_progress(development_stage);
CREATE INDEX IF NOT EXISTS idx_game_progress_updated ON game_progress(last_updated DESC);

-- ============================================================
-- 4. 种子数据
-- ============================================================

-- 4.1 归唐 (Blood Message) — SGF 2026 全球首曝
INSERT INTO game_progress (name, cover_url, developer, publisher, genre, development_stage, estimated_release_date, team_size, credibility_score, public_info, silver_info, gold_info, risk_assessment, tags, is_featured)
VALUES (
  '归唐',
  'https://picsum.photos/seed/guitang/800/450',
  '网易雷火·临安24',
  '网易游戏',
  '动作冒险',
  '概念阶段',
  '2027',
  150,
  8,
  -- public_info (免费可见)
  '《归唐》（Blood Message）是网易旗下雷火事业群·临安24工作室开发的首款买断制3A单机游戏，于2026年6月6日Summer Game Fest全球首曝。

**首曝反响：**
SGF 2026主秀压轴环节，Geoff Keighley亲自站台介绍，播放了名为"Hold Till Dawn"的3分33秒实机预告片。预告片全程使用Unreal Engine 5渲染，官方确认"100% in-engine footage，无CG镜头"。预告片展示了冷兵器攻城战、1v1处决机制、动态天气系统和大规模战场AI。

**已知信息：**
- 唐朝背景，安史之乱前夕
- 主角为戍边将领，非武侠设定——"是搏杀，不是武侠"
- 开放世界 + 线性关卡混合结构
- 支持PC/PS5/Xbox Series X|S平台
- 网易首次以买断制模式发行主机3A
- 团队核心成员来自育碧、EA、2K等国际3A厂商

**当前状态：**
项目处于概念阶段后期，核心玩法验证已完成。首次公开演示在SGF Play Days提供媒体闭门试玩（6月7-8日）。正式发售日期未公布，业内预计2027年。',
  -- silver_info (白银可见)
  '**内部开发细节（白银会员专属）：**

临安24工作室成立于2023年，由前育碧上海创意总监领衔。团队规模约150人，分为三个核心小组：战斗系统组（40人）、开放世界组（50人）、叙事与美术组（60人）。

**战斗系统：**
- 自研"冷兵器物理引擎"，支持超过200种武器碰撞反馈
- 三种战斗姿态：轻击连斩、重击破甲、防御反击
- 处决系统：非QTE，基于物理判定——武器切入角度、力度、护甲破损程度均影响处决动画
- 攻城战支持最多500个AI单位同屏，采用自研LOD-AI系统

**开发里程碑：**
- 2023 Q2：核心团队组建完成
- 2024 Q1：UE5原型通过网易内部评审
- 2024 Q4：首个可玩Demo（10小时内容）
- 2025 Q3：SGF 2026参展决定
- 2026 Q2：全球首曝

**技术栈：**
UE5.4 + 自研物理中间件 + Havok物理引擎 + Wwise音频中间件。目标是PS5稳定60帧、XSX稳定60帧、PC支持4K/120帧。',
  -- gold_info (黄金可见)
  '**独家内幕与商业分析（黄金会员专属）：**

**投资与预算：**
网易对"临安24"的初始投资为5亿人民币，据内部人士透露，截至2026年Q1实际投入已超8亿。网易CEO丁磊亲自过问项目进展，被视为网易"主机3A转型"的旗舰项目。内部代号"Project 24"取自临安24工作室名。

**发行策略：**
- 全球同步发售，网易自研发行（非代理），避开腾讯/索尼/微软的发行抽成
- 定价策略：标准版 $59.99/¥298，豪华版 $79.99/¥398（含OST+设定集）
- 预购目标：首月100万份
- 长期目标：全生命周期500万份（PC+主机）
- 后续计划：至少2个大型资料片

**团队核心成员：**
- 创意总监：前育碧上海创意总监（曾参与《刺客信条：奥德赛》《渡神纪》）
- 技术总监：前2K Games高级引擎工程师
- 美术总监：前EA Motive Studios主美（参与《死亡空间》重制版）
- 叙事总监：旅美华裔编剧，曾参与《对马岛之鬼》叙事

**合作伙伴：**
- Epic Games：UE5技术联合开发
- NVIDIA：DLSS 3.5 + RTX光追合作
- 英特尔：XeSS超分辨率技术支持',
  -- risk_assessment (黄金可见)
  '**风险评估：**

🟢 **市场风险 — 低**
网易品牌背书 + SGF主舞台首曝保证了首波关注度。国产3A市场正处上升期，《黑神话：悟空》已证明2000万+销量是可达的。唐朝冷兵器题材在全球市场具有差异化优势（区别于日本战国和欧洲中世纪）。

🟡 **技术风险 — 中**
500单位同屏AI是一个极高的技术门槛。即使UE5提供了Mass Entity系统，实际应用中仍有大量优化工作。PS5/XSX目标60帧在当前阶段仍显激进。团队自研的冷兵器物理引擎在复杂场景下的稳定性有待验证。

🟡 **团队风险 — 中**
150人团队中约30%为海外引进人才，国内3A开发经验整体不足。跨文化团队管理、远程协作是持续挑战。核心成员来自多个不同3A厂商，技术栈和工作流程的磨合需要时间。

🟢 **资金风险 — 低**
网易已承诺全额资助至发售，且不设内部截止日期，以品质为第一优先级。网易2025年财报显示游戏业务收入增长12%，资本充足。

🔴 **竞争风险 — 中高**
2027年预计有《失落之魂》《影之刃零》《湮灭之潮》等多款国产3A密集发售，档期竞争激烈。国际上《巫师4》《GTA VI》等超大作可能抢占市场份额。

**综合评级：B+（风险可控，关注执行）**',
  ARRAY['开放世界', '动作冒险', '唐朝', '网易', 'UE5', 'SGF2026'],
  true
);

-- 4.2 失落之魂 (Lost Soul Aside) — 索尼中国之星，即将发售
INSERT INTO game_progress (name, cover_url, developer, publisher, genre, development_stage, estimated_release_date, team_size, credibility_score, public_info, silver_info, gold_info, risk_assessment, tags, is_featured)
VALUES (
  '失落之魂',
  'https://picsum.photos/seed/lostsoul/800/450',
  'Ultizero Games',
  '索尼互动娱乐',
  '动作RPG',
  '压盘阶段',
  '2026 Q3',
  80,
  10,
  -- public_info
  '《失落之魂》（Lost Soul Aside）是国内独立开发者杨冰耗时近10年打造的高速动作游戏，由索尼PlayStation中国之星计划孵化并全球发行。

**开发历程：**
- 2016年：杨冰发布首个UE4个人Demo，YouTube播放量破千万
- 2017年：入选索尼中国之星计划
- 2019年：获得索尼全球发行支持，团队扩充至80人
- 2021年：首个完整实机演示，确认PS5+PC同步发售
- 2024年：宣布已进入压盘阶段
- 2026年Q3：预计正式发售

**游戏特色：**
- 高速爽快的战斗系统，被玩家称为"国产鬼泣"
- 15个大型Boss战，每个Boss有独特的战斗机制
- 30+小时主线剧情 + 丰富的支线内容
- 支持4K/120帧和光线追踪（PC版）
- 后续将推出至少3个大型DLC

**当前状态：**
游戏已进入压盘阶段，所有内容开发完成，正在最终的bug修复和性能优化。索尼全球发行保障了首发覆盖范围。',
  -- silver_info
  '**开发内幕（白银会员专属）：**

杨冰最初在2016年以一人之力完成了首个UE4 Demo，核心战斗系统完全由他独立编程。索尼在看过Demo后迅速将其纳入中国之星计划，并提供了一笔未公开的开发资金。

**战斗系统深度：**
- 6种可切换武器，每种有独立的技能树和连招表
- "魔人化"变身系统，战斗中充能后进入强化状态
- Boss战设计参考了《鬼泣》《猎天使魔女》和《最终幻想XVI》

**内容量：**
- 主线剧情约30-35小时
- 15个大型Boss + 20+个中型精英敌人
- 3个开放区域 + 10个线性关卡
- New Game+模式解锁新难度和新技能',
  -- gold_info
  '**商业合作细节（黄金会员专属）：**

**索尼中国之星协议：**
- 索尼提供开发资金 + 全球发行 + PS5独占优化支持
- PC版由索尼PC发行部门负责
- 销售收入分成：索尼30% / Ultizero 70%（远优于行业标准的50/50）
- 中国之星计划额外提供市场推广预算：约200万美元

**销量预测：**
- 保守估计：首月50万份，全生命周期200万份
- 乐观估计：首月100万份，全生命周期500万份
- 中国区预计贡献40%销量，北美25%，欧洲20%，日本10%，其他5%

**后续计划：**
- 3个大型DLC已列入开发路线图
- 续作概念已在探索阶段
- 可能的手游/动画改编正在洽谈中',
  -- risk_assessment
  '**风险评估：**

🟢 **开发风险 — 极低**
游戏已进入压盘阶段，所有内容开发完成。目前仅有bug修复和性能优化工作，不存在内容延期风险。

🟢 **质量风险 — 低**
多个媒体和KOL已提前试玩，反馈一致积极。战斗系统被赞为"国产动作游戏新标杆"，Boss战设计获得特别好评。

🟡 **市场风险 — 中**
作为新IP，品牌认知度有限。索尼的全球发行能力可以弥补这一短板，但首发销量仍存在不确定性。需关注与同期发售的其他大作的竞争。

🟢 **财务风险 — 低**
索尼的全额资助 + 优厚的分成比例 + 中国之星计划的市场支持，使得Ultizero Games在财务上处于非常安全的位置。

**综合评级：A-（高质量、低风险、确定性高）**',
  ARRAY['动作RPG', '索尼中国之星', '高速战斗', '独立游戏', 'PS5'],
  true
);

-- 4.3 黑神话：悟空 (Black Myth: Wukong) — 国产3A里程碑，持续追踪
INSERT INTO game_progress (name, cover_url, developer, publisher, genre, development_stage, estimated_release_date, team_size, credibility_score, public_info, silver_info, gold_info, risk_assessment, tags, is_featured)
VALUES (
  '黑神话：悟空',
  'https://picsum.photos/seed/blackmyth/800/450',
  '游戏科学',
  '腾讯游戏',
  '动作RPG',
  '已发售',
  '2024-08-20',
  300,
  10,
  -- public_info
  '《黑神话：悟空》是游戏科学开发的国产3A里程碑作品，2024年8月20日全球发售，首月销量突破1000万份，截至2025年底全球销量突破2000万份。

**发售成就：**
- 发售首日Steam同时在线人数突破230万，创单机游戏历史纪录
- 首月销量突破1000万份，销售额超30亿人民币
- 获得TGA 2024年度游戏提名，最终获得最佳动作游戏奖
- Steam好评率96%（超过100万条评价）
- 获得至少3项吉尼斯世界纪录

**DLC开发进展：**
首个大型DLC《黑神话：悟空 大闹天宫》正在开发中，预计2027年发售。新增：
- 2个全新地图：花果山、东海龙宫
- 10个新Boss
- 新武器类型和战斗风格
- 预计售价 ¥99/$19.99

**续作计划：**
游戏科学CEO冯骥确认续作《黑神话：悟空 西天取经》正在概念阶段，预计2028年发售。',
  -- silver_info
  '**DLC开发细节（白银会员专属）：**

《大闹天宫》DLC的开发团队约150人（游戏科学深圳总部），使用了《黑神话：悟空》的完整开发管线。

**新内容亮点：**
- 花果山地图面积约为原版"火焰山"的1.5倍
- 新增"筋斗云"快速移动系统
- 10个新Boss包括：四大天王、哪吒、二郎神（完全体）、托塔天王等
- 新武器"如意金箍棒·真"拥有独特的伸缩攻击机制
- 水下战斗系统首次引入（东海龙宫）

**DLC定价策略：**
- 标准版 ¥99，豪华版 ¥149（含OST+设定集）
- 拥有原版的玩家可享9折预购优惠
- 预计DLC销量500-800万份',
  -- gold_info
  '**商业数据与续作分析（黄金会员专属）：**

**黑神话悟空 销售数据（截至2025年底）：**
- 全球销量：2000万+份
- 中国区占比：55%（1100万份）
- 北美占比：18%（360万份）
- 欧洲占比：15%（300万份）
- 日本占比：5%（100万份）
- 其他地区：7%（140万份）
- 总营收：约60亿人民币（含DLC和周边）
- Steam评价数：100万+条（96%好评）

**续作《西天取经》规划：**
- 预计开发预算：15亿人民币（原作的2.5倍）
- 预计团队规模：300-400人
- 目标平台：PC/PS5/XSX/次世代主机
- 技术目标：UE5 + 全光追 + 120帧
- 预计发售窗口：2028年Q4

**腾讯投资回报：**
腾讯持有游戏科学约5%股份（2021年投资），以当前估值计算，投资回报率超50倍。腾讯游戏发行权确保了PC平台优先发行。',
  -- risk_assessment
  '**续作风险评估：**

🟢 **品牌风险 — 极低**
《黑神话：悟空》已建立强大的品牌认知和粉丝基础。DLC和续作具有天然的销量保障。

🟡 **期望管理风险 — 中**
原作的高度成功带来了极高的期望值。DLC和续作需要在不失原作精髓的基础上实现创新和突破。玩家对"更多内容"的需求可能导致DLC内容量被过度放大。

🟢 **技术风险 — 低**
游戏科学已建立了成熟的UE5开发管线，团队经验丰富。DLC在原作基础上扩展，技术风险可控。

🟢 **资金风险 — 极低**
原作60亿+营收提供了充足的现金流，DLC和续作完全自筹资金，无需外部融资。

**综合评级：A（国产3A标杆，持续成功概率极高）**',
  ARRAY['动作RPG', '西游', '游戏科学', '已发售', 'DLC开发中'],
  true
);
