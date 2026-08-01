-- ============================================================
-- 国游爆料论坛种子数据 v4 · 2026-08-01
-- 用 23 个独立 UUID 变量 + RETURNING INTO，彻底解决类型问题
-- ============================================================

TRUNCATE TABLE public.forum_replies;
TRUNCATE TABLE public.forum_posts CASCADE;

DO $$
DECLARE
  p1  uuid;  p2  uuid;  p3  uuid;  p4  uuid;  p5  uuid;
  p6  uuid;  p7  uuid;  p8  uuid;  p9  uuid;  p10 uuid;
  p11 uuid;  p12 uuid;  p13 uuid;  p14 uuid;  p15 uuid;
  p16 uuid;  p17 uuid;  p18 uuid;  p19 uuid;  p20 uuid;
  p21 uuid;  p22 uuid;  p23 uuid;
BEGIN
  -- ============================================================
  -- 第1步：创建23个帖子
  -- ============================================================

  -- [1] games: 黑神话钟馗美术风格预测
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '《黑神话：钟馗》美术风格预测——国风恐怖还是继续写实？',
    '游戏科学刚公布的黑神话续作主角换成钟馗，大家猜猜美术方向会怎么走？

我觉得有两个可能：
1. 延续悟空的写实风格，但色调更阴冷，加入大量民俗鬼怪元素（类似中式恐怖）
2. 完全转向水墨/工笔画风格，钟馗本身就很适合这种表达

另外有没有大佬知道制作组这次有没有加恐怖元素？钟馗捉鬼的设定感觉能挖很多东西。',
    '国风美术爱好者', false, 8, 3420, NOW() - INTERVAL '18 days')
  RETURNING id INTO p1;

  -- [2] games: 影之刃零 PC配置
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '影之刃零 PC版配置要求讨论——1060真的能跑吗？',
    '刚看到官方配置最低是GTX 1060 6GB，心里有点虚啊……

我现在的配置：
- CPU: i5-9400F
- GPU: GTX 1060 6GB
- RAM: 16GB

玩悟空的时候1080p中画质勉强60帧，但影之刃零宣传片里那个雨夜城市场景光影好复杂。有没有内部消息说优化怎么样？

灵游坊之前的作品优化一直挺良心的，希望这次也一样。',
    '等等党永远不亏', false, 12, 5680, NOW() - INTERVAL '14 days')
  RETURNING id INTO p2;

  -- [3] games: 归唐 SGF 实机分析（置顶）
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '【集中讨论】归唐 SGF 实机演示——开放世界到底做了多少？',
    '刚看完 SGF 的归唐实机，简单说几点：

✅ 长安城建模密度真的高，街边小摊、行人、叫卖声都有
✅ 骑马手感看着比悟空流畅，物理碰撞有反馈
⚠️ 战斗系统还是谜，只给了5秒拔刀镜头
❓ 开放世界是无缝大地图还是分区域？

有没有在现场试玩的老哥？能详细说说战斗和任务系统吗？我个人最关心支线设计，不要又是满地图问号。',
    '大唐历史迷', true, 15, 12450, NOW() - INTERVAL '10 days')
  RETURNING id INTO p3;

  -- [4] games: 失落之魂发售日
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '失落之魂到底什么时候发售？从2022等到2026了……',
    '杨冰大佬求你给个准信吧！

最新消息是Q3 2026，但已经跳票多少次了？
我整理了一下时间线：
- 2022：首曝PV
- 2023：宣布PS5限时独占
- 2024：CJ试玩「还在打磨」
- 2025：科隆参展说「下半年」→ 跳票
- 2026：现在又说Q3……

有没有人在索尼内部有关系？到底锁没锁发售日？',
    '等魂等到头发白', false, 6, 2180, NOW() - INTERVAL '7 days')
  RETURNING id INTO p4;

  -- [5] games: 湮灭之潮 美术风格
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '湮灭之潮的美术风格——克苏鲁+国风是不是有点矛盾？',
    '说一下我个人的观感，纯讨论不杠：

湮灭之潮PV里的怪物设计确实有克苏鲁那味儿（触手、不可名状），但世界观设定又是东方海洋神话。两个拼在一起……我觉得有点违和？

好的方面是水面和雾气效果做得真顶，氛围感拉满。

有没有美术行业的老哥分析下，这两种风格融合到底算不算成功？',
    '审美很主观', false, 7, 3890, NOW() - INTERVAL '5 days')
  RETURNING id INTO p5;

  -- [6] games: 古剑四 战斗系统
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '古剑奇谭四战斗系统——能摆脱回合制标签吗？',
    '作为从古剑一玩到三的老粉，最担心的就是战斗。

烛龙之前的作品：
- 古剑1/2：回合制/半回合制（传统日式RPG那套）
- 古剑3：转即时制，有进步但手感还是偏"飘"

古剑四据说请了战神团队的人做动作指导？真的假的？如果能做到悟空80%的打击感我就满足了。

另外问下ARPG老哥们，你们觉得即时制最重要的3点是什么？打击感、闪避反馈、连招？',
    '烛龙老粉', false, 5, 1920, NOW() - INTERVAL '3 days')
  RETURNING id INTO p6;

  -- [7] games: 望月 开放世界
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '开放世界审美疲劳了，《望月》能做出新东西吗？',
    '现在国产3A十个里八个说自己是开放世界，我已经麻木了：
- 满地图问号
- 收集品全是凑数的
- 主线和支线完全割裂
- 随机事件只有两种：强盗打劫和救人

望月的设定是东方奇幻，PV里有月亮潮汐系统。有没有可能潮汐真的能影响探索和战斗？比如涨潮的时候某些路被淹，退潮露出隐藏洞穴；满月的时候怪物变强但掉落更好？

如果真能做到"世界动态变化"而不是一句空话，那才能叫开放世界。',
    '开放世界PTSD', false, 9, 4210, NOW() - INTERVAL '2 days')
  RETURNING id INTO p7;

  -- [8] games: 锦衣卫 Demo体验
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'games',
    '有人玩到《锦衣卫》Demo了吗？CJ现场排队3小时值得吗？',
    'CJ现场排队太长了，想先问问体验过的老哥：

1. 战斗手感怎么样？和悟空比差多少？
2. 画面是宣传PV那个水平还是缩水了？
3. 优化怎么样？我看试玩机是3070，多少帧？
4. 线性关卡还是开放？

如果只能玩一个Demo，优先锦衣卫还是失落之魂？',
    'CJ现场实况', false, 11, 8760, NOW() - INTERVAL '1 day')
  RETURNING id INTO p8;

  -- [9] leaks: 腾讯增持游戏科学（置顶）
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'leaks',
    '【讨论】腾讯增持游戏科学股份——是好事还是坏事？',
    '刚看到消息说腾讯继续增持游戏科学，现在持股比例好像超过30%了？

正反两面说一下我的看法：

✅ 好的方面：
- 资金更充足，钟馗研发不用为钱发愁
- 腾讯的QA和全球化发行资源对产品有帮助
- 之前悟空的成功已经证明，游戏科学有足够的话语权

❌ 担心的方面：
- 腾讯会不会插手内容？比如要求加氪金点、改剧情
- 原创IP的独立性如何保证？
- 续作会不会变成年货流水线？

大家怎么看？',
    '行业观察员', true, 14, 15680, NOW() - INTERVAL '12 days')
  RETURNING id INTO p9;

  -- [10] leaks: 百面千相内部进度
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'leaks',
    '叠纸百面千相内部进度爆料（匿名）',
    '朋友在叠纸，不方便说太细，只能说几条大家自己判断：

1. 美术确实顶级，PV没骗，但代价是开发周期超长
2. 开放世界规模比想象中小，分区加载不是无缝
3. 战斗系统换过一次方向，之前像仁王现在偏向只狼
4. 最早也要2027年Q2，叠纸内部给的deadline是2027年底

真假自辨，杠就是你对。',
    '匿名甲', false, 10, 9870, NOW() - INTERVAL '8 days')
  RETURNING id INTO p10;

  -- [11] leaks: 科隆2026国产阵容
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'leaks',
    '科隆2026国产参展阵容——有没有内部消息？',
    '今年科隆展位据说国产厂商占了3个Hall，创历史新高。
目前确认的：
- 腾讯：王者荣耀世界（提供试玩？）
- 网易：燕云十六声（新实机？）
- 游戏科学：黑神话钟馗（只有视频不试玩）
- 叠纸：百面千相（参展但没试玩）
- 库洛：？？？（据说明日方舟终末地PV+鸣潮DLC）

大家最期待哪个？我个人希望能玩到王者荣耀世界实机，之前看PV战斗系统做得不错。',
    '展会追踪者', false, 6, 4560, NOW() - INTERVAL '6 days')
  RETURNING id INTO p11;

  -- [12] leaks: 7月版号 197款
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'leaks',
    '7月版号197款创年内新高——真的是"放开"了吗？',
    '数据：
- 1月：87款
- 2月：92款
- 3月：101款
- 4月：118款
- 5月：134款
- 6月：156款
- 7月：197款

逐月递增趋势很明显。但仔细看名单，大型国产3A的过审数量其实没怎么涨，大部分还是手游和独立游戏。

个人解读：版号总量放开了，但"高品质"门槛其实没降。大家怎么看？',
    '数据控', false, 7, 3120, NOW() - INTERVAL '4 days')
  RETURNING id INTO p12;

  -- [13] leaks: 匿名开发者真话
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'leaks',
    '匿名开发者说点真话：国产3A的"3A"是怎么定义的？',
    '行业里混了5年，匿名说几句真心话：

现在国内说自己是3A的团队，90%根本达不到AAA标准。区别在于：

海外3A的3A = A lot of time × A lot of money × A lot of resources
国产"3A"的3A = 看起来画面还行 × 宣传PV做得好 × 敢喊高预算

举个例子：某款号称"2亿研发"的国产游戏，真正用到研发上的不到8000万，剩下的全是市场宣发成本按比例折算进去的。

别问哪款，自己猜。',
    '匿名开发者', false, 12, 21340, NOW() - INTERVAL '2 days')
  RETURNING id INTO p13;

  -- [14] general: 显卡选购
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'general',
    '备战下半年国产3A，显卡怎么选？3000元档求推荐',
    '目前配置：i5-10400F / 16GB / GTX 1660 Super

想换显卡，预算3000元左右（最多加500）。需求：
- 1080p高画质 + 60帧稳定
- 2K中画质能跑就行

看了几款：
- RTX 4060 8GB：约2300，DLSS3是加分项
- RX 7600 XT 16GB：约2500，显存大
- RTX 4060 Ti 8GB：约3000，性能强一点但显存还是8G

大家觉得下半年的国产3A，8G显存会不会爆？要不要牺牲性能上16G？',
    '等等党不会输', false, 18, 7890, NOW() - INTERVAL '20 days')
  RETURNING id INTO p14;

  -- [15] general: 国游定价讨论
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'general',
    '国产3A定价该多少？298还是398？聊聊我的看法',
    '悟空卖298创下销量记录后，感觉国产3A定价陷入了一个尴尬：

- 卖298：研发团队难回本，但玩家觉得合理
- 卖398：能回本但被骂"你也配和GTA同价"
- 卖468+：除非品质真的摸到TGA GOTY水平，否则必死

我个人觉得合理定价应该是：
- 基础版 ¥298
- 豪华版 ¥428（含美术集+OST+季票）
- 收藏实体版 ¥688-888（给真正的粉丝）

有没有行业内的说说？298这个价格是真的薄利多销还是亏本赚吆喝？',
    '理性消费者', false, 9, 5430, NOW() - INTERVAL '11 days')
  RETURNING id INTO p15;

  -- [16] general: 国产引擎 vs UE5
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'general',
    '国产自研引擎什么时候能赶上UE5？',
    '看了一下现在国产3A的引擎分布：
- 用UE5的：90%以上（悟空、影之刃、归唐、湮灭之潮…）
- 自研引擎的：只有个别（古剑系列的XEngine，叠纸的？）

自研引擎这条路还值得走吗？

好处：
- 不受Epic授权费和条款限制
- 出了问题自己可控
- 团队技术沉淀

坏处：
- 从零做太费钱，几亿起步
- 招不到人（现在UE人才多）
- 编辑器体验赶不上Epic

大家觉得未来5年内会不会出现国产引擎"破局者"？',
    '技术宅', false, 7, 3670, NOW() - INTERVAL '9 days')
  RETURNING id INTO p16;

  -- [17] general: 2026下半年期待榜
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'general',
    '2026下半年国产3A期待榜投票（仅统计已公布发售窗口的）',
    '我整理了一下下半年确定发售窗口的（只是我的信息，有错请纠正）：

Q3:
- 失落之魂
- 湮灭之潮
- 锦衣卫（？）

Q4:
- 影之刃零
- 古剑奇谭四
- 望月（？）
- 代号：无限大

我的期待排序：
1. 影之刃零（动作+剧情都稳）
2. 失落之魂（等太久了）
3. 古剑四（烛龙老粉）
4. 湮灭之潮（美术独特）

大家来排排？',
    '期待榜制作组', false, 16, 11230, NOW() - INTERVAL '6 days')
  RETURNING id INTO p17;

  -- [18] general: 移动端游玩
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'general',
    '移动端云游戏能不能玩国产3A？实测了3款云游戏平台',
    '最近出差多，台式带不动，测了3个平台玩悟空：

1. 某start云游戏：
   - 延迟：50-80ms（光纤WiFi）
   - 画质：还行，压缩感明显
   - 价格：包月约50元

2. 某tower云游戏：
   - 延迟：40-70ms
   - 画质：比start好一点
   - 价格：按时长算约1元/小时

3. 自建GeForce Now（国外节点）：
   - 延迟：120ms+，玩动作游戏根本不行

结论：云游戏只能"体验剧情"，玩需要操作的游戏真不行。还是老老实实买台游戏本吧。

有没有推荐的便携设备？Win掌机怎么样？',
    '出差玩家', false, 8, 4120, NOW() - INTERVAL '3 days')
  RETURNING id INTO p18;

  -- [19] general: 实体版收藏
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'general',
    '国产3A实体版收藏——大家会买豪华/收藏版吗？',
    '现在数字版越来越方便，但我还是想收几款有纪念意义的实体：

悟空豪华版我收了，那个手办+美术集+OST值回票价。

希望国产厂商多出点"有诚意"的实体内容，而不是：
- 一个铁皮盒子
- 几张明信片
- 下载码
- 卖你498

理想中的收藏版（比如影之刃零）：
- 精致主角雕像 1/6
- 完整美术设定集 200页+
- OST 3CD 或 黑胶
- 游戏铁盒
- 设定原画明信片一套
- 价格：888-1288都能接受

有没有同好？晒晒你们的收藏？',
    '实体党万岁', false, 5, 2340, NOW() - INTERVAL '1 day')
  RETURNING id INTO p19;

  -- [20] off-topic: 晒桌面
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'off-topic',
    '【晒】为了迎接下半年国游潮，刚升级了桌面',
    '刚换的设备，分享一下配置：

- CPU: Intel i7-13700KF
- GPU: RTX 4070 Ti Super
- RAM: 32GB DDR5 6400MHz
- SSD: 2TB 990 Pro + 4TB 机械
- 显示器：27寸 2K 165Hz IPS
- 外设：键盘某轴机械 + 无线鼠标 + 耳机HD660S2
- 椅子：某品牌电竞椅（劝大家别买电竞椅，人体工学椅才是王道）

大家也来晒晒桌面？我看看有没有更发烧的。',
    '设备党', false, 10, 18760, NOW() - INTERVAL '15 days')
  RETURNING id INTO p20;

  -- [21] off-topic: 外卖游戏梗
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'off-topic',
    '你有没有为了玩某款游戏，连续吃了一个月外卖？',
    '说起来丢人，2024年悟空发售那几天：
- 一周吃了5次黄焖鸡
- 3次沙县
- 2次兰州拉面
- 冰箱里的泡面都吃完了

女朋友说我比游戏公司测试组还拼。

有没有同款？最拼的时候是什么状态？',
    '外卖战士', false, 14, 9450, NOW() - INTERVAL '7 days')
  RETURNING id INTO p21;

  -- [22] off-topic: 熬夜等发售
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'off-topic',
    '熬夜等发售日零点解锁的毛病什么时候能改？',
    '又不是没玩过游戏，但每次期待的游戏发售前一晚：

- 晚上9点上床 → 翻来覆去睡不着
- 10点刷论坛看预载情况
- 11点开始刷新Steam商店
- 11:30 已经坐电脑前盯着倒计时
- 0:00 准时开玩 → 肝到凌晨4点 → 第二天上班/上学迟到

有没有过来人？如何优雅地等发售？',
    '夜猫子', false, 12, 6780, NOW() - INTERVAL '3 days')
  RETURNING id INTO p22;

  -- [23] off-topic: BGM推荐
  INSERT INTO forum_posts (id, category, title, content, author_name, is_pinned, reply_count, view_count, created_at)
  VALUES (gen_random_uuid(), 'off-topic',
    '推荐几首国产游戏BGM神级曲目，学习/工作循环播放',
    '纯音乐爱好者分享：

1. 黑神话悟空《云宫迅音》变奏——听着热血沸腾，写代码效率+20%
2. 古剑奇谭三《故园》——加班赶due必备，情绪稳定
3. 归唐长安BGM（PV里的那段）——大气，适合开大会前听
4. 影之刃零战斗BGM（Demo泄露版）——通勤赶时间必听，走路都快了
5. 仙剑奇侠传七主题曲——情怀加成

有没有补充？希望大家多推荐一些纯音乐的，人声容易分神。',
    '音乐品味好', false, 6, 3450, NOW() - INTERVAL '1 day')
  RETURNING id INTO p23;


  -- ============================================================
  -- 第2步：插入回复（直接引用变量 p1..p23）
  -- ============================================================

  -- [1] → p1 × 8
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p1, '我投国风恐怖一票。钟馗的背景太适合了，中式民俗恐怖加动作元素，想想都带感！', '恐惧来自火力不足', NOW() - INTERVAL '17 days 6 hours'),
    (p1, '不同意，水墨风才是钟馗的正确打开方式。工笔画风格画钟馗捉鬼，美术史上绝了。', '传统美术爱好者', NOW() - INTERVAL '17 days 3 hours'),
    (p1, '@传统美术爱好者 水墨风好看是好看，但开放世界用水墨渲染很难做，技术成本会爆炸。', '做游戏的懂点', NOW() - INTERVAL '16 days 20 hours'),
    (p1, '@做游戏的懂点 其实UE5的Watercolor材质已经能做出不错的效果了，关键看艺术指导的水平。', 'UE5小画家', NOW() - INTERVAL '16 days 15 hours'),
    (p1, '别争论风格了，只要冯骥能讲故事，啥风格我都买。', '冯骥铁粉', NOW() - INTERVAL '15 days 8 hours'),
    (p1, '说个细节：PV里钟馗的扇子上有只蝙蝠，"蝠"谐音"福"，这中式细节太对味了。', '考据党', NOW() - INTERVAL '14 days 2 hours'),
    (p1, '有没有可能做成"黑暗中国神话"？就像FromSoftware的黑暗奇幻，但内核是东方的。', '黑魂老玩家', NOW() - INTERVAL '12 days 10 hours'),
    (p1, '@黑魂老玩家 太对了！悟空已经证明这条路走得通，钟馗的世界观比悟空更有"黑暗"潜质。', '魂系国游支持者', NOW() - INTERVAL '10 days 5 hours');

  -- [2] → p2 × 12
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p2, '1060能跑？我怀疑。就算能跑也是30帧幻灯片，不如升级。', '画质党', NOW() - INTERVAL '13 days 22 hours'),
    (p2, '@画质党 那是你没玩过灵游坊的游戏。他们的优化在国产团队里算是第一梯队的。梁其伟亲自抓优化。', '灵游坊老粉', NOW() - INTERVAL '13 days 18 hours'),
    (p2, '同1060 6G + i5-8400，蹲一个实测。发售了麻烦楼主回来更新帧数！', '等更新的楼主', NOW() - INTERVAL '13 days 10 hours'),
    (p2, '我是笔记本 2060，比1060强一点但也没强多少。就怕这个游戏爆显存，1060的6G很悬。', '笔记本玩家', NOW() - INTERVAL '12 days 22 hours'),
    (p2, '优化这个东西，宣传片看不出来。看实机和发售前的Demo更准。', '理性派', NOW() - INTERVAL '11 days 15 hours'),
    (p2, '建议楼主直接换4060，2000块出头，战3年。1060已经是2016年的卡了，9年了兄弟。', '升级党', NOW() - INTERVAL '10 days 20 hours'),
    (p2, '@升级党 有钱换显卡我还来问？', '等等党永远不亏', NOW() - INTERVAL '10 days 10 hours'),
    (p2, '说真的，1080P+FSR3性能模式，1060应该能稳60。画面糊一点总比换不起显卡强。', 'AMD YES', NOW() - INTERVAL '9 days 8 hours'),
    (p2, '我已经做了最坏打算：全最低+FSR超级性能+80%分辨率，只要能玩。', '能跑就行党', NOW() - INTERVAL '8 days 12 hours'),
    (p2, '影之刃零用的是UE 5.4，Nanite和Lumen全开会吃硬件，估计会有性能模式开关。', 'UE5老司机', NOW() - INTERVAL '7 days 5 hours'),
    (p2, '大家别这么焦虑。悟空我GTX 970都跑了，游戏厂商比玩家懂优化。', '乐观派', NOW() - INTERVAL '6 days 3 hours'),
    (p2, '楼主如果真的担心，去Steam加愿望单，发售前有Demo可以测试。', '实用建议', NOW() - INTERVAL '5 days 18 hours');

  -- [3] → p3 × 15
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p3, '在现场！试玩了15分钟：长安城是分区域无缝，骑马从城门到大明宫大概8分钟。任务系统是主线+分支事件，不是问号。', 'SGF现场哥', NOW() - INTERVAL '9 days 22 hours'),
    (p3, '@SGF现场哥 求详细说战斗！', '等不及的楼主', NOW() - INTERVAL '9 days 20 hours'),
    (p3, '@等不及的楼主 战斗是即时制，有"唐刀"特色的收刀拔刀动作，手感偏硬核。闪避有无敌帧。有类似"弹反"的格挡机制。', 'SGF现场哥', NOW() - INTERVAL '9 days 18 hours'),
    (p3, '长安城建模密度我觉得是噱头，你靠近了看NPC全是纸片人，没面部表情。', '冷静派', NOW() - INTERVAL '9 days 10 hours'),
    (p3, '@冷静派 这是开放世界的通病，连GTA6也做不到每个NPC有脸吧？', '合理预期', NOW() - INTERVAL '8 days 22 hours'),
    (p3, '我最满意的是那个雨天效果，雨水落在石板路上的积水，马蹄溅起的水花，太真实了。', '画面党', NOW() - INTERVAL '8 days 18 hours'),
    (p3, '有没有发现PV里有胡商、遣唐使、波斯舞者？历史细节做的真不错。', '唐史爱好者', NOW() - INTERVAL '8 days 10 hours'),
    (p3, '开发团队好像请到了西安博物院的历史顾问，这点很加分。', '考据党二号', NOW() - INTERVAL '7 days 23 hours'),
    (p3, '开放世界最怕"大而空"，希望归唐的任务设计不是跑腿。', '任务设计党', NOW() - INTERVAL '7 days 15 hours'),
    (p3, '现场试玩遇到了随机事件：在西市碰到抓小偷的，帮捕快追能掉装备。这个比固定支线有意思。', 'SGF现场哥', NOW() - INTERVAL '7 days 5 hours'),
    (p3, '说实话我对国产开放世界已经没信心了，之前几款都是吹得震天响，玩了半小时就无聊。等发售后看真实评价再买。', '理性观望', NOW() - INTERVAL '6 days 18 hours'),
    (p3, '@理性观望 同感，但归唐开发团队的核心成员有几个做过巫师3DLC的，这点让我稍微有点信心。', '团队信徒', NOW() - INTERVAL '6 days 8 hours'),
    (p3, '只想问一个问题：PC版有光追吗？', '追光者', NOW() - INTERVAL '5 days 12 hours'),
    (p3, '@追光者 现场演示的是DX12 Ultimate，DXR和DLSS都有。', 'SGF现场哥', NOW() - INTERVAL '5 days 8 hours'),
    (p3, '希望定价别超过300，我已经预购了影之刃零和古剑四，钱包撑不住了。', '月光族', NOW() - INTERVAL '4 days 20 hours');

  -- [4] → p4 × 6
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p4, '别等了，先玩别的。我2022年之后就淡忘了，等真的出了自然会有消息。', '佛系玩家', NOW() - INTERVAL '6 days 18 hours'),
    (p4, '杨冰之前的采访说过：宁可多跳票几次，也不做半成品。这点我是服的。', '品质至上', NOW() - INTERVAL '6 days 12 hours'),
    (p4, '说个消息，索尼内部把失落之魂排到了10月的发售表。别问来源，信就等。', '索尼内部人员', NOW() - INTERVAL '5 days 6 hours'),
    (p4, '最怕的是"打磨了7年，出来是个半成品"。这种事见过太多次了。', '被伤害过的人', NOW() - INTERVAL '5 days 2 hours'),
    (p4, '@被伤害过的人 所以等评分啊，MC低于85分直接不买不就完了。', '先看评分再买', NOW() - INTERVAL '4 days 20 hours'),
    (p4, 'CJ有失落之魂试玩，我去完回来发帖。', 'CJ探路先锋', NOW() - INTERVAL '3 days 10 hours');

  -- [5] → p5 × 7
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p5, '我觉得融合得不错。克苏鲁是"未知的恐惧"，东方海洋神话本身就有很多不可名状的元素（比如深海龙王），内核是通的。', '神话通', NOW() - INTERVAL '4 days 20 hours'),
    (p5, '我觉得美术统一就不违和。PV里那个色调偏青灰，怪物设计也是同一套"扭曲海洋生物"的语言，比乱凑风格强多了。', '学设计的', NOW() - INTERVAL '4 days 12 hours'),
    (p5, '能不能先别讨论风格，有人关心过游戏性吗？宣传到现在全是美术，实机战斗半分钟都没放。', '玩法党', NOW() - INTERVAL '4 days 5 hours'),
    (p5, '@玩法党 这个我同意。现在国产游戏宣传就是堆画面，玩法放最后。', '游戏性优先', NOW() - INTERVAL '3 days 18 hours'),
    (p5, '有一说一，水面效果是真的好。海浪拍打岸边的泡沫、水下折射，看着舒服。', '画面技术控', NOW() - INTERVAL '3 days 10 hours'),
    (p5, '话说制作人之前是不是做过《汐》？那个平台跳跃游戏美术也很独特。', '老玩家认人', NOW() - INTERVAL '2 days 22 hours'),
    (p5, '对，就是做《汐》的那个团队。他们的美术一直是强项，希望这次玩法能跟上。', '认出来了', NOW() - INTERVAL '2 days 14 hours');

  -- [6] → p6 × 5
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p6, '古剑3的即时制我觉得已经够用了，就是打击感反馈不够。听说古剑四换了物理引擎，应该会好。', '烛龙老粉', NOW() - INTERVAL '2 days 20 hours'),
    (p6, '战神团队的人？消息准吗？如果真的有，请过动作指导那打击感不用担心。', '动作游戏爱好者', NOW() - INTERVAL '2 days 14 hours'),
    (p6, '即时制关键三点：1. 输入延迟（必须低于80ms）2. 命中反馈（震屏+音效+特效三件套）3. 受伤硬直（不能轻飘飘）', '资深ARPG', NOW() - INTERVAL '1 day 20 hours'),
    (p6, '我个人不指望古剑四的战斗有多好，烛龙的强项是剧情。把故事讲好就行。', '剧情党', NOW() - INTERVAL '1 day 10 hours'),
    (p6, '@剧情党 战斗是国产3A永远的痛，只能希望每作都有进步。', '不吹不黑', NOW() - INTERVAL '20 hours');

  -- [7] → p7 × 9
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p7, '说的太对了！现在的开放世界就是"大地图上撒问号"，然后告诉你这是开放世界。', '地图问号ptsd', NOW() - INTERVAL '2 days 2 hours'),
    (p7, '潮汐系统真的做好了，是可以改变探索的。比如《塞尔达》的昼夜天气就是榜样——看似小细节，但影响玩法。', '塞尔达老玩家', NOW() - INTERVAL '1 day 22 hours'),
    (p7, '我就要求一点：支线任务的质量。别又是"帮张大妈找猫、帮李大爷砍柴"。', '支线玩家', NOW() - INTERVAL '1 day 18 hours'),
    (p7, '我可能是少数派，我觉得线性剧情游戏比开放世界好玩。把一个故事讲透比做一个空的大地图有价值。', '线性游戏党', NOW() - INTERVAL '1 day 12 hours'),
    (p7, '@线性游戏党 完全同意。黑神话悟空不是开放世界，品质比大多数所谓的开放世界高到不知道哪里去了。', '悟空吹', NOW() - INTERVAL '1 day 6 hours'),
    (p7, '望月的团队好像规模不大，做开放世界我挺担心完成度的。', '担心完成度', NOW() - INTERVAL '20 hours'),
    (p7, '有没有做过游戏的解释下：开放世界到底比线性贵多少？', '不懂就问', NOW() - INTERVAL '14 hours'),
    (p7, '@不懂就问 简单说：同品质开放世界成本是线性的3-5倍。因为地图面积、任务数量、随机事件、AI系统都是数量级增长。', '做游戏的', NOW() - INTERVAL '8 hours'),
    (p7, '所以说，大团队才有资格做开放世界，小团队不如做好一块区域。', '懂了', NOW() - INTERVAL '4 hours');

  -- [8] → p8 × 11
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p8, '现场人。先回答：值得排队。1. 打击感大概是悟空的70%水平，国产里面算上等。2. 画面和PV一致，没缩水。3. 3070试玩机锁60帧，稳。4. 线性关卡，但是有分支路线。', '排了3小时', NOW() - INTERVAL '23 hours'),
    (p8, '@排了3小时 谢谢老哥！打击感70%是什么概念？能举个例子吗？', 'CJ现场实况', NOW() - INTERVAL '22 hours'),
    (p8, '@CJ现场实况 举个例子：悟空的拳拳到肉是100分的话，锦衣卫是刀锋感，更脆。闪避反击、处决动画都有。', '排了3小时', NOW() - INTERVAL '21 hours'),
    (p8, '二选一的话：失落之魂。', '全都玩过', NOW() - INTERVAL '20 hours'),
    (p8, '@全都玩过 理由呢？', '想选一个', NOW() - INTERVAL '19 hours'),
    (p8, '@想选一个 失落之魂完成度更高，战斗系统更有深度。锦衣卫的剧情和氛围更好。看你偏好什么。', '全都玩过', NOW() - INTERVAL '18 hours'),
    (p8, '我刚才排队了2小时才玩到。真的不亏，那个雨夜追杀关卡的氛围……鸡皮疙瘩起来了。', '排到了', NOW() - INTERVAL '16 hours'),
    (p8, '有没有人注意到那个处决镜头？真的太狠了，血溅出来的那一刻全场"哇"了一声。', '重口味', NOW() - INTERVAL '14 hours'),
    (p8, '我是女生玩家，想问一下画面会不会太血腥？', '女生玩家', NOW() - INTERVAL '10 hours'),
    (p8, '@女生玩家 我觉得还好，不是那种恶心的血腥。就是暴力美学那种，和悟空的处决差不多。', '排到了', NOW() - INTERVAL '8 hours'),
    (p8, '已经预购了，希望9月能玩上。', '直接买了', NOW() - INTERVAL '4 hours');

  -- [9] → p9 × 14
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p9, '个人判断：中性偏利好。腾讯出钱但不太管内容，之前投资FromSoftware、Funcom都是这个路子。', '腾讯历史研究者', NOW() - INTERVAL '11 days 20 hours'),
    (p9, '说实话，悟空能成功，腾讯在海外发行渠道上帮了大忙。这一点没法否认。', '实事求是', NOW() - INTERVAL '11 days 15 hours'),
    (p9, '怕的不是腾讯插手内容，怕的是腾讯插手商业化。比如突然要求出个"钟馗皮肤"氪金。', '氪金ptsd', NOW() - INTERVAL '11 days 10 hours'),
    (p9, '@氪金ptsd 单人游戏氪金的概率很低吧？最多出个付费DLC，和悟空一样。', '想多了', NOW() - INTERVAL '10 days 22 hours'),
    (p9, '游戏科学已经不是当年缺钱的小团队了，就算腾讯增持，话语权还是在冯骥手里的。这点我有信心。', '信任冯骥', NOW() - INTERVAL '10 days 18 hours'),
    (p9, '有没有一种可能：腾讯需要游戏科学做"技术名片"，证明中国游戏行，所以宁愿少挣钱也要保口碑。', '高层视角', NOW() - INTERVAL '9 days 18 hours'),
    (p9, '说实话，资本进来对我们普通玩家是好事。有钱才能做更好的内容。就怕资本不懂游戏瞎指挥。', '复杂心态', NOW() - INTERVAL '8 days 18 hours'),
    (p9, '腾讯不是有个"不干涉产品"的原则吗？只要利润率达标，具体怎么做团队说了算。', '研究过合同', NOW() - INTERVAL '7 days 18 hours'),
    (p9, '@研究过合同 你信？', '不信资本', NOW() - INTERVAL '7 days 15 hours'),
    (p9, '不管资本怎么样，先看作品。钟馗出来了自然知道好不好。', '看作品说话', NOW() - INTERVAL '6 days 22 hours'),
    (p9, '最担心的是：资本要求缩短开发周期，导致续作品质下降。千万不要学某些大厂做年货。', '慢工出细活', NOW() - INTERVAL '5 days 18 hours'),
    (p9, '游戏科学现在这个体量，腾讯想买早就买了。不收购只增持，说明冯骥一直有控制权。放心。', '股权懂王', NOW() - INTERVAL '4 days 10 hours'),
    (p9, '突然想起来：当年做《斗战神》的团队和做《黑神话》的团队是一个团队。他们和腾讯的恩怨情仇……不担心才怪。', '老玩家记性好', NOW() - INTERVAL '3 days 18 hours'),
    (p9, '@老玩家记性好 你说的是量子工作室对吧？斗战神确实被腾讯搞死了，但今时不同往日了。', '时代变了', NOW() - INTERVAL '2 days 10 hours');

  -- [10] → p10 × 10
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p10, '开放世界规模比想象中小？这是好消息啊！做一个精细的15平方公里，比做一个空洞的150平方公里强100倍。', '小而美党', NOW() - INTERVAL '7 days 22 hours'),
    (p10, '仁王转向只狼？什么意思？不要忍术阴阳术了？那我仁王老粉有点失落……', '仁王粉丝', NOW() - INTERVAL '7 days 15 hours'),
    (p10, '叠纸做动作游戏？真的假的。之前不都是暖暖那种美少女游戏吗？', '圈外人提问', NOW() - INTERVAL '7 days 8 hours'),
    (p10, '@圈外人提问 百面千相的核心团队是从各个动作游戏公司挖的，不是做暖暖的那帮人。', '懂业内', NOW() - INTERVAL '6 days 23 hours'),
    (p10, '2027年Q2……我已经开始慢慢等了。反正国产3A跳票是常态。', '等得起', NOW() - INTERVAL '6 days 15 hours'),
    (p10, '叠纸最大的优势是美术。百面千相的宣传片我看了几十遍，每一帧都能当壁纸。', '美术无敌党', NOW() - INTERVAL '5 days 22 hours'),
    (p10, '就怕"金玉其外，败絮其中"。美术好看但玩法拉胯。', '玩法人', NOW() - INTERVAL '5 days 10 hours'),
    (p10, '@玩法人 叠纸有百面千相和无限大两个3A项目，两个团队是分开的。我相信他们不会拿公司未来开玩笑。', '叠纸有信心', NOW() - INTERVAL '4 days 18 hours'),
    (p10, '话说回来，百面千相的面具系统到底是个什么玩法？PV里没说清。', '好奇玩法', NOW() - INTERVAL '3 days 10 hours'),
    (p10, '匿名消息听个乐就行，真消息假消息分不清。等官方实机演示。', '不信爆料', NOW() - INTERVAL '2 days 6 hours');

  -- [11] → p11 × 6
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p11, '王者荣耀世界试玩？终于憋不住了吗？！我等这个游戏等了快3年。', '天美老粉', NOW() - INTERVAL '5 days 18 hours'),
    (p11, '腾讯占3个Hall？有必要吗？', '疑问脸', NOW() - INTERVAL '5 days 12 hours'),
    (p11, '@疑问脸 腾讯在海外推PUBG Mobile、王者荣耀海外版，还有三角洲行动，展位大是正常的。', '正常', NOW() - INTERVAL '5 days 6 hours'),
    (p11, '我想看网易的燕云十六声实机。PV好看，但就没放出玩内容。', '燕云观望', NOW() - INTERVAL '4 days 20 hours'),
    (p11, '游戏科学应该会带钟馗的新PV去，虽然不能玩。', '等PV', NOW() - INTERVAL '3 days 10 hours'),
    (p11, '库洛呢？鸣潮DLC和终末地都没有消息吗？', '库洛粉', NOW() - INTERVAL '2 days 18 hours');

  -- [12] → p12 × 7
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p12, '版号多不代表品质高。197款里真正能让我掏钱的可能不到5款。', '质量优先', NOW() - INTERVAL '3 days 22 hours'),
    (p12, '但是版号放开对中小团队太重要了！不然你做出来的游戏卖不了，直接死。', '独立开发者', NOW() - INTERVAL '3 days 15 hours'),
    (p12, '同意楼上。之前"版号寒冬"那几年，多少好团队死在最后一步？游戏做好了发不了。', '寒冬过来人', NOW() - INTERVAL '3 days 8 hours'),
    (p12, '有没有数据：过审的版号里，单机/网游/手游各占多少？我猜90%还是手游。', '好奇比例', NOW() - INTERVAL '2 days 20 hours'),
    (p12, '@好奇比例 官方没给分类，但我手动数了下，大型单机PC/主机游戏大概15款左右。', '手动统计', NOW() - INTERVAL '2 days 12 hours'),
    (p12, '15款！那也比往年多了。之前一年也就5-8款。', '在进步了', NOW() - INTERVAL '1 day 18 hours'),
    (p12, '总量放是好事，接下来要看品质门槛。不能让垃圾游戏占版号。', '反对垃圾', NOW() - INTERVAL '1 day 10 hours');

  -- [13] → p13 × 12
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p13, '大实话。现在"3A"这个词已经被营销用烂了，什么都敢叫3A。', '认同', NOW() - INTERVAL '1 day 22 hours'),
    (p13, '举个实际的：某游戏宣传"研发3亿"，真正落到制作环节的可能1亿都不到。剩下的全是宣发、公关、媒体宣传，折算进"研发成本"里吹。', '会计懂行', NOW() - INTERVAL '1 day 18 hours'),
    (p13, '我觉得"国产3A"不如叫"国产大作"。3A是严格的行业定义（时间金钱资源三个AAA），国内大多数达不到。', '用词严谨', NOW() - INTERVAL '1 day 12 hours'),
    (p13, '那你觉得达到AAA标准的国产游戏有哪些？我觉得只有悟空勉强算。', '来举例子', NOW() - INTERVAL '1 day 8 hours'),
    (p13, '@来举例子 悟空的预算是真的高，而且全用在研发上了。这才是真3A。', '悟空真3A', NOW() - INTERVAL '20 hours'),
    (p13, '玩家也被营销洗脑了，一听到是"3A大作"就掏钱。能不能先玩Demo再买？', '别买预售', NOW() - INTERVAL '16 hours'),
    (p13, '其实3A本来就是营销术语，海外也一样。现在都叫4A、5A了，随便他们叫。', '看穿了', NOW() - INTERVAL '12 hours'),
    (p13, '说句不好听的：国内某些"3A"，放在海外也就是个AA甚至独立游戏的水准。', '对比派', NOW() - INTERVAL '10 hours'),
    (p13, '那怎么办？不支持国产又不进步，支持了又被割韭菜，两难。', '两难', NOW() - INTERVAL '8 hours'),
    (p13, '我的策略：等评分。MC低于80、Steam好评率低于85%的一律不买。等打折。', '评分党策略', NOW() - INTERVAL '6 hours'),
    (p13, '@评分党策略 学聪明了。之前我也是预售党，发现预售的品质往往比不预售的差。', '惨痛教训', NOW() - INTERVAL '4 hours'),
    (p13, '所以还是悟空给了我们信心。至少证明了国产游戏能达到国际水准。', '乐观派', NOW() - INTERVAL '2 hours');

  -- [14] → p14 × 18
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p14, '直接上RTX 4070 Super，战5年不慌。预算不够就先借，或者等双十一。', '预算不够加', NOW() - INTERVAL '19 days 10 hours'),
    (p14, '3000元档我推荐 RX 7600 XT 16GB。下半年国产3A全是UE5，8G显存真的容易爆。', '显存党', NOW() - INTERVAL '19 days 4 hours'),
    (p14, '实际情况：UE5 Nanite + Lumen 开起来，8G显存分分钟100%。你看看悟空的推荐配置就是12G显存。', '过来人', NOW() - INTERVAL '18 days 20 hours'),
    (p14, '我从1060 6G换到4070，感觉是两个世界。1060真的太老了。', '已升级', NOW() - INTERVAL '18 days 12 hours'),
    (p14, '楼主的CPU是10400F，带4060Ti会不会有瓶颈？我查了下大概有15%左右的性能损失。', '性能瓶颈', NOW() - INTERVAL '17 days 18 hours'),
    (p14, '1080P分辨率下CPU瓶颈更明显，2K的话反而显卡是瓶颈。楼主玩2K吗？', '分分辨率说', NOW() - INTERVAL '16 days 22 hours'),
    (p14, '我现在就是1080P。2K的话1060根本跑不动。等换完显卡再考虑升显示器。', '楼主', NOW() - INTERVAL '16 days 15 hours'),
    (p14, '那10400F + 4060 在1080P下基本是均衡的，不会有大瓶颈。', '搭配合理', NOW() - INTERVAL '15 days 18 hours'),
    (p14, '楼主你算一笔账：3000元的显卡用3年，每天2小时，等于每小时1.3元。比你喝一杯咖啡便宜。', '算时间成本', NOW() - INTERVAL '14 days 10 hours'),
    (p14, '我觉得先等等。50系显卡明年3月出，40系肯定降价。', '等50系', NOW() - INTERVAL '13 days 8 hours'),
    (p14, '@等50系 50系出来也是天价，5070至少4000起。等降到3000又要等1年。', '早买早享受', NOW() - INTERVAL '13 days 4 hours'),
    (p14, '说实话，3000元预算就4060没悬念。DLSS3 + 光追 + 驱动稳定，对小白最友好。', '最稳方案', NOW() - INTERVAL '12 days 6 hours'),
    (p14, '我是4060用户，目前玩悟空1080P全高+DLSS平衡，70-90帧稳定。', '真实用户', NOW() - INTERVAL '11 days 18 hours'),
    (p14, '等等党永远不亏这句话，我听了10年，结果1060用到现在……', '等等党觉醒了', NOW() - INTERVAL '10 days 12 hours'),
    (p14, '我建议升级到32G内存。16G玩新游戏现在已经是临界值了，明年可能不够。', '内存也要升', NOW() - INTERVAL '9 days 8 hours'),
    (p14, '@内存也要升 对！我上次玩悟空内存占到了14.5G，再加个后台浏览器直接爆。', '16G不够', NOW() - INTERVAL '8 days 18 hours'),
    (p14, '如果只能花3000，我觉得显卡2000 + 内存400 + SSD600（换个2T的），体验提升比全砸显卡上均衡。', '均衡配置党', NOW() - INTERVAL '7 days 12 hours'),
    (p14, '综合大家意见我决定：先换4060（2200）+ 加条16G内存（280），剩520留着买游戏。谢谢各位！', '做决定了', NOW() - INTERVAL '6 days 8 hours');

  -- [15] → p15 × 9
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p15, '298这个价，是薄利，但不是亏本。悟空销量破2000万的话，利润是百亿级别的。', '算算账', NOW() - INTERVAL '10 days 18 hours'),
    (p15, '298真的不贵。我小时候买正版仙剑都要69，那还是二十年前的69。', '正版老玩家', NOW() - INTERVAL '10 days 10 hours'),
    (p15, '定价其实要看目标市场。想冲全球销量的话，全球统一定价（国内打折）是最好的。', '国际市场', NOW() - INTERVAL '9 days 8 hours'),
    (p15, '我觉得定价不是主要问题，品质才是。值不值398，玩过Demo才知道。', '品质决定', NOW() - INTERVAL '8 days 18 hours'),
    (p15, '豪华版428我可以接受。最怕的是888元的"终极版"一堆没用的东西。', '拒绝虚高', NOW() - INTERVAL '7 days 10 hours'),
    (p15, '我倒觉得可以学Steam：原价398，发售后2周打折298，首周销量+口碑双丰收。', '营销策略', NOW() - INTERVAL '6 days 8 hours'),
    (p15, '国内玩家已经被免费游戏搞坏心态了，觉得"游戏就该免费，皮肤卖钱"。接受付费游戏，是观念进步。', '付费游戏支持者', NOW() - INTERVAL '5 days 18 hours'),
    (p15, '说实话我觉得定价应该分档：独立游戏38-98，AA级128-198，3A级298-468。明码标价，玩家自己选。', '分档定价', NOW() - INTERVAL '4 days 12 hours'),
    (p15, '最可恶的是298但是内容不完整，卖你12个DLC。本体298 + DLC全买 2000+。', 'DLC地狱', NOW() - INTERVAL '3 days 8 hours');

  -- [16] → p16 × 7
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p16, '短期（5年）内不会有。UE太强了，Epic每年烧几十个亿在引擎上，国内任何公司都比不了。', '现实派', NOW() - INTERVAL '8 days 18 hours'),
    (p16, '但是华为不做了鸿蒙系统吗？国产系统+国产引擎，会不会有机会？', '华为有机会', NOW() - INTERVAL '8 days 10 hours'),
    (p16, '@华为有机会 鸿蒙是系统，引擎是另一个赛道。而且做引擎需要内容团队试错，UE有全市场的游戏在帮它踩坑。', '不一样', NOW() - INTERVAL '7 days 22 hours'),
    (p16, '我觉得思路可以变：不必完全自研，基于UE5定制一套"国风管线"。把常用的中式材质、植被、建筑做成标准化资产库。开发效率一样能提高很多。', '定制管线', NOW() - INTERVAL '6 days 18 hours'),
    (p16, 'XEngine（烛龙的）其实不错，用了好几代了。但是不开源，只有烛龙自己用，发展不起来。', 'XEngine关注者', NOW() - INTERVAL '5 days 10 hours'),
    (p16, '等国内哪款自研引擎的游戏拿了TGA提名，再说"赶上UE5"吧。', '作品说话', NOW() - INTERVAL '4 days 6 hours'),
    (p16, '其实自研引擎也有好处：不用给Epic抽成5%。一款游戏卖10亿，5%就是5000万，够养一个引擎团队了。', '算抽成', NOW() - INTERVAL '3 days 18 hours');

  -- [17] → p17 × 16
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p17, '我的排序：1. 影之刃零（动作+美术天花板）2. 失落之魂（等太久了）3. 黑神话钟馗（续作稳定）4. 古剑四（剧情+世界观）', '个人排名', NOW() - INTERVAL '5 days 22 hours'),
    (p17, '我把代号无限大排第一。开放世界二次元，美术太戳我了。', '二次元战士', NOW() - INTERVAL '5 days 15 hours'),
    (p17, '锦衣卫其实可以排前五的，CJ体验过的都说好。楼主是不是漏了？', '锦衣卫支持者', NOW() - INTERVAL '5 days 10 hours'),
    (p17, 'Q4的发售密度太恐怖了：影之刃零+古剑+望月+代号无限大……钱包直接死。', '钱包死了', NOW() - INTERVAL '4 days 22 hours'),
    (p17, '建议大家错开玩。先玩最期待的，通了再玩下一款，不然都玩一半烂尾。', '防止烂尾', NOW() - INTERVAL '4 days 12 hours'),
    (p17, '我个人只买2款：影之刃零和失落之魂。其他等打折。', '只买精品', NOW() - INTERVAL '4 days 6 hours'),
    (p17, '有没有人统计过这些游戏全买要多少钱？按300平均算×7 = 2100元。', '算总账', NOW() - INTERVAL '3 days 20 hours'),
    (p17, '加上DLC和豪华版，3000元打不住。', 'DLC也要买', NOW() - INTERVAL '3 days 10 hours'),
    (p17, '今年真是国产3A大年。去年还在愁没游戏玩，今年玩不过来了。', '幸福的烦恼', NOW() - INTERVAL '3 days 4 hours'),
    (p17, '等这些游戏通了，正好年底《GTA6》……人生啊。', 'GTA6来了', NOW() - INTERVAL '2 days 18 hours'),
    (p17, '我先观望，不预购。哪个评分高买哪个。', '看评分', NOW() - INTERVAL '2 days 12 hours'),
    (p17, '下半年最期待的反而是望月，设定太独特了。东方奇幻+开放世界+潮汐系统，很新鲜。', '望月党', NOW() - INTERVAL '2 days 6 hours'),
    (p17, '湮灭之潮排在哪？美术风格真的太独特了。', '美术独特', NOW() - INTERVAL '1 day 22 hours'),
    (p17, '我现在的策略：先玩试玩版，有一个买一个。反正Steam2小时退款。', '理性消费', NOW() - INTERVAL '1 day 12 hours'),
    (p17, '能不能等这些游戏都卖了1年，在圣诞大促一起买？能省一半钱。', '等促销', NOW() - INTERVAL '1 day 4 hours'),
    (p17, '兄弟你太能等了。我反正是首发党，当天0点解锁那天玩的感觉，比省50块钱值多了。', '首发党', NOW() - INTERVAL '20 hours');

  -- [18] → p18 × 8
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p18, '谢谢楼主测评。我也试过云游戏，那延迟真的玩不了动作游戏。', '试过都懂', NOW() - INTERVAL '2 days 18 hours'),
    (p18, 'ROG掌机用户路过：1080P 30帧玩悟空没问题，功耗30W大概2小时续航。优点是便携，缺点是30帧玩动作游戏确实不如台式。', '掌机用户', NOW() - INTERVAL '2 days 10 hours'),
    (p18, '我现在的组合：台式机（主力在家玩）+ 游戏本（出差玩）。游戏本3060基本够用。', '双机党', NOW() - INTERVAL '2 days 2 hours'),
    (p18, '等Switch 2啊！据说性能接近PS4 Pro，国产3A都能移植。', '等新Switch', NOW() - INTERVAL '1 day 18 hours'),
    (p18, '@等新Switch 先不说国产3A会不会移植，Switch 2的首发价格你能抢到吗？', '抢不到的', NOW() - INTERVAL '1 day 10 hours'),
    (p18, '云游戏最大的问题是画质压缩。你看视频是1080p，但编码后实际画质连720p都不如。', '画质压缩', NOW() - INTERVAL '1 day 2 hours'),
    (p18, '有没有人用Steam Link + 5G？用手机串流台式机，延迟据说能做到30ms以内。', '串流党', NOW() - INTERVAL '20 hours'),
    (p18, '@串流党 本地串流可以，出门5G串流要看你那边的5G覆盖。我在地铁上连过，帧率不稳定。', '实测', NOW() - INTERVAL '12 hours');

  -- [19] → p19 × 5
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p19, '悟空那个手办我也有，质量真的高。希望影之刃零出个主角雨血的手办。', '手办党', NOW() - INTERVAL '20 hours'),
    (p19, '888-1288元的收藏版，你得是真粉才买。我个人只买基础版，298元买游戏本体就够了。', '实在人', NOW() - INTERVAL '16 hours'),
    (p19, '我最期待的是黑胶唱片OST。国产游戏的作曲现在越来越顶了。', 'OST收藏', NOW() - INTERVAL '10 hours'),
    (p19, '我有个想法：大家把喜欢的实体版都拍照发出来，我们整个"国产游戏实体版图鉴"。', '好主意', NOW() - INTERVAL '6 hours'),
    (p19, '实体版现在真的越来越少了，我上次买实体盘还是PS5上的悟空。', '最后一代实体', NOW() - INTERVAL '2 hours');

  -- [20] → p20 × 10
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p20, '兄弟你这套多少钱？我估计2.3万左右。', '算价格', NOW() - INTERVAL '14 days 12 hours'),
    (p20, '4070 Ti Super + 2K 165Hz，玩下半年的国产3A没压力。', '配置没问题', NOW() - INTERVAL '14 days 4 hours'),
    (p20, 'HD660S2好耳机啊！楼主是烧友？', '耳机党', NOW() - INTERVAL '13 days 18 hours'),
    (p20, '劝你换椅子是真的。我之前电竞椅坐了两年腰肌劳损，换人体工学椅后好多了。', '过来人', NOW() - INTERVAL '12 days 12 hours'),
    (p20, '我晒我的：CPU: AMD 7800X3D / GPU: RTX 4080 Super / RAM: 64GB DDR5 / 显示器：42寸 C2 OLED / 体验：玩悟空开4K HDR，跟看电影一样。', 'OLED党', NOW() - INTERVAL '11 days 20 hours'),
    (p20, '@OLED党 豪无人性。我估计这一套要3.5万。', '看看就好', NOW() - INTERVAL '11 days 10 hours'),
    (p20, '我的桌面比较朴素：MacBook接4K显示器。平时写代码，偶尔BootCamp玩老游戏。国游就云游戏凑活。', '朴素党', NOW() - INTERVAL '10 days 12 hours'),
    (p20, '32G内存我觉得下半年可能不够。建议加到64G，以后的游戏越来越吃内存。', '内存要大', NOW() - INTERVAL '8 days 18 hours'),
    (p20, '我桌面最值钱的是那个4K显示器：三星G8 OLED。显示器才是每天看的东西，值得投资。', '显示器优先', NOW() - INTERVAL '6 days 10 hours'),
    (p20, '我桌面小，就一台游戏本+外接显示器。方便搬去女朋友家玩~', '移动优先', NOW() - INTERVAL '4 days 4 hours');

  -- [21] → p21 × 14
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p21, '有过。而且那次吃完外卖我胃不舒服，一边拉肚子一边玩，通关后感觉像打了一场战役。', '比你更拼', NOW() - INTERVAL '6 days 18 hours'),
    (p21, '悟空发售那天我请假了，在家玩了一天，泡面+可乐。人生巅峰。', '请假党', NOW() - INTERVAL '6 days 10 hours'),
    (p21, '连续吃外卖算什么，当年仙剑三发行，我在网吧住了三天，吃喝拉撒都在里面。', '老派硬核', NOW() - INTERVAL '5 days 18 hours'),
    (p21, '你们这样对身体不好。我一般提前准备好水果沙拉、鸡胸肉，玩累了就做拉伸。', '健康党', NOW() - INTERVAL '5 days 10 hours'),
    (p21, '@健康党 玩到兴起谁记得这些啊……', '做不到', NOW() - INTERVAL '4 days 22 hours'),
    (p21, '我女朋友已经跟我约法三章了：1. 发售日当天允许熬夜 2. 一周内必须通关 3. 不许买重复的游戏', '幸福的约法', NOW() - INTERVAL '4 days 14 hours'),
    (p21, '我记得上次GTA5发售，我是从公司直接下班回家，然后玩到凌晨6点去上班，在公司睡了一上午。', '上班摸鱼', NOW() - INTERVAL '3 days 18 hours'),
    (p21, '吃外卖不算啥。有没有人跟我一样，游戏发售前一周，先把所有家务做完，冰箱填满，工作提前做，就是为了那一天什么都不用干只管玩。', '仪式感', NOW() - INTERVAL '3 days 10 hours'),
    (p21, '@仪式感 我！我甚至提前把快递地址都改到楼下驿站，免得有人敲门。', '极致准备', NOW() - INTERVAL '2 days 22 hours'),
    (p21, '去年悟空那波，我甚至买了5箱功能饮料。结果玩到通关都没喝完。', '功能饮料', NOW() - INTERVAL '2 days 10 hours'),
    (p21, '有孩子的人表示羡慕。想痛快玩游戏简直是奢侈。', '当爹的', NOW() - INTERVAL '1 day 22 hours'),
    (p21, '@当爹的 我都是孩子睡着后，10点到凌晨2点玩。玩4小时够了，不会影响第二天。', '当爹的也能玩', NOW() - INTERVAL '1 day 10 hours'),
    (p21, '说起来你们可能不信，我为了玩游戏不被打扰，和老婆分房睡了。', '分房党', NOW() - INTERVAL '20 hours'),
    (p21, '说真的，最怀念的是大学时候和室友一起等游戏发售的日子。现在工作了，那份感觉找不回来了。', '怀旧党', NOW() - INTERVAL '4 hours');

  -- [22] → p22 × 12
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p22, '我每次都是：今晚要早睡，养足精神明天玩。结果躺床上刷手机刷到凌晨1点。', '一样', NOW() - INTERVAL '2 days 20 hours'),
    (p22, '我改不了。每次发售前一晚必失眠。现在我学乖了，直接通宵等，然后第二天回家补觉。', '通宵等', NOW() - INTERVAL '2 days 10 hours'),
    (p22, 'Steam预载好，然后把闹钟调到23:50，起来先开瓶啤酒。', '仪式感满分', NOW() - INTERVAL '1 day 22 hours'),
    (p22, '我30岁之后已经熬不动了。发售日第二天再玩也一样。', '年纪大了', NOW() - INTERVAL '1 day 14 hours'),
    (p22, '优雅：1. 发售日当天请假不上班 2. 早睡早起 3. 早上8点精神饱满地玩 4. 玩到晚上8点', '优雅派', NOW() - INTERVAL '1 day 6 hours'),
    (p22, '优雅的前提是——能请到假。我上次请假，领导说"什么游戏发售比工作重要？"', '假请不到', NOW() - INTERVAL '22 hours'),
    (p22, '我有过一次：发售日凌晨0点解锁，我盯着Steam进度条，就剩1%的时候卡住了。等了2小时。', '最痛', NOW() - INTERVAL '16 hours'),
    (p22, '@最痛 我也有过。最气的是朋友已经在群里剧透BOSS了。', '剧透该死', NOW() - INTERVAL '14 hours'),
    (p22, '现在学聪明了：设0:30的闹钟，起来看看朋友群有没有人说好/不好。好评就玩，差评直接睡觉。', '机智', NOW() - INTERVAL '10 hours'),
    (p22, '我是结婚人士，想熬夜玩游戏先得搞定老婆：提前买好礼物+做一周家务+各种承诺，换得"特许夜"。', '已婚男人', NOW() - INTERVAL '8 hours'),
    (p22, '我发现玩了两个小时后就困了，根本熬不到4点。早睡早起身体好。', '熬不动', NOW() - INTERVAL '6 hours'),
    (p22, '这个话题真的有共鸣。等发售的心情，就像小时候等春游，越等越兴奋。', '春游感', NOW() - INTERVAL '2 hours');

  -- [23] → p23 × 6
  INSERT INTO forum_replies (post_id, content, author_name, created_at) VALUES
    (p23, '补充两首：古剑二《沧海飞尘》+ 仙剑四《回梦游仙》，都是老一代国产的神级BGM。', '经典党', NOW() - INTERVAL '20 hours'),
    (p23, '我学习的时候听《文明6》的BGM，比国产游戏的更让我专注。不过悟空的云宫迅音确实提气。', '各有所爱', NOW() - INTERVAL '14 hours'),
    (p23, '楼主提到的古剑三《故园》，我也在循环。加班到深夜，听着很治愈。', '加班同好', NOW() - INTERVAL '8 hours'),
    (p23, '有没有人知道：影之刃零的音乐是谁做的？之前系列的电子风和古典结合都很赞。', '影之刃音乐', NOW() - INTERVAL '6 hours'),
    (p23, '做BGM推荐不能漏了《风来之国》！像素游戏但是音乐做得比很多3A都好。', '独立游戏音乐', NOW() - INTERVAL '4 hours'),
    (p23, '收藏了。我加班的BGM清单+1。', '加班必备', NOW() - INTERVAL '2 hours');

END $$;

-- ============================================================
-- 验证数据
-- ============================================================
SELECT '===== 数据验证 =====' AS "——";
SELECT COUNT(*) AS "帖子总数（应为23）" FROM forum_posts;
SELECT COUNT(*) AS "回复总数（应为238）" FROM forum_replies;

SELECT '===== 按板块统计 =====' AS "——";
SELECT category AS "板块", COUNT(*) AS "帖子数"
FROM forum_posts GROUP BY category ORDER BY 2 DESC;

SELECT '===== 热门帖子 TOP10 =====' AS "——";
SELECT p.category, p.title,
       (SELECT COUNT(*) FROM forum_replies r WHERE r.post_id = p.id) AS "实际回复数",
       p.view_count AS "浏览量",
       CASE WHEN p.is_pinned THEN '✅置顶' ELSE '' END AS "置顶"
FROM forum_posts p
ORDER BY p.view_count DESC LIMIT 10;
