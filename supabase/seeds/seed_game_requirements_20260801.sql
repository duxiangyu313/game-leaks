-- ══════════════════════════════════════════════════════
-- 国游爆料 · game_requirements 全面补全 | 2026-08-01  v3
--
-- 修复 v2:去掉 DO $$ 里的自定义 TYPE cfg_rec IS RECORD
-- (PostgreSQL 不支持 DECLARE 块自定义 RECORD 类型, 会报 42601)
--
-- 现在方案: 纯 SQL + 临时表, 不依赖任何 PL/pgSQL 高级特性
--   1) CREATE TEMP TABLE tmp_cfg 存放 35 条配置 (title 别名拆 3 列)
--   2) INSERT INTO ... SELECT ...
--      FROM tmp_cfg
--      CROSS JOIN LATERAL (
--        SELECT id FROM games
--         WHERE lower(title)=lower(t1) OR lower(title)=lower(t2) OR lower(title)=lower(t3)
--            OR lower(title) LIKE '%'||lower(t1)||'%'
--            OR lower(title) LIKE '%'||lower(t2)||'%'
--            OR lower(title) LIKE '%'||lower(t3)||'%'
--         ORDER BY (lower(title)=lower(t1)) DESC,   -- 精确命中优先
--                  (lower(title)=lower(t2)) DESC
--         LIMIT 1
--      ) g
--      WHERE g.id IS NOT NULL      -- 匹配不到自动跳过, 不会 NULL 报错
--   3) ON CONFLICT (game_id) DO UPDATE
--
-- 结果:
--   - 匹配不到 game_id 的配置 → 安静跳过, 不会报错, 其他条照常写入
--   - 不会因为单条 NULL 而整体回滚 (以前 v1 那坑)
--   - 可反复执行 (开头 TRUNCATE + 中间 ON CONFLICT)
--
-- Messages 面板会给出 INSERT 成功行计数;
-- 如果想看跳过了哪些, 跑完后单独执行下方 "步骤4 诊断查询"
-- ══════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────
-- 步骤 1: 兜底建表
-- ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_requirements (
  game_id        UUID PRIMARY KEY REFERENCES public.games(id) ON DELETE CASCADE,
  os_min         TEXT,
  os_rec         TEXT,
  cpu_min        TEXT,
  cpu_rec        TEXT,
  gpu_min        TEXT,
  gpu_rec        TEXT,
  ram_min        INTEGER,
  ram_rec        INTEGER,
  storage_min    INTEGER,
  storage_rec    INTEGER,
  directx        TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────────────────
-- 步骤 2: 清空 (保证可随时重跑)
-- ──────────────────────────────────────────────────────
TRUNCATE TABLE public.game_requirements RESTART IDENTITY;

-- ──────────────────────────────────────────────────────
-- 步骤 3: 临时表装 35 条配置, 然后一次 SELECT+JOIN 写入
-- ──────────────────────────────────────────────────────
CREATE TEMP TABLE IF NOT EXISTS tmp_cfg (
  t1        TEXT,         -- title 主名
  t2        TEXT,         -- 别名 1
  t3        TEXT,         -- 别名 2
  os_min    TEXT, os_rec    TEXT,
  cpu_min   TEXT, cpu_rec   TEXT,
  gpu_min   TEXT, gpu_rec   TEXT,
  ram_min   INT,  ram_rec   INT,
  st_min    INT,  st_rec    INT,
  directx   TEXT, notes     TEXT
) ON COMMIT DROP;

-- 避免重复跑时临时表有残留
TRUNCATE tmp_cfg;

INSERT INTO tmp_cfg (t1,t2,t3, os_min,os_rec, cpu_min,cpu_rec, gpu_min,gpu_rec, ram_min,ram_rec, st_min,st_rec, directx, notes) VALUES
  --  ── [01] 黑神话悟空 ────────────────────────────
  ('黑神话：悟空','黑神话悟空',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i7-9700 / AMD Ryzen 5 5500',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 4070 / AMD RX 7800 XT',
    16,32,130,130,'DirectX 12',
    '支持 DLSS 4 + FSR 4 + XeSS 2。光线追踪推荐 RTX 5070 或以上。DLC"西天取经"额外需 50GB。'),

  --  ── [02] 燕云十六声 ────────────────────────────
  ('燕云十六声','Where Winds Meet',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-9400F / AMD Ryzen 5 2600','Intel Core i7-10700 / AMD Ryzen 5 5600X',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 3060 Ti / AMD RX 6700 XT',
    16,32,100,100,'DirectX 12',
    'PS5 Pro版支持光线追踪反射 + PSSR超分辨率。多人模式需要 10Mbps+ 带宽。'),

  --  ── [03] 归唐 ────────────────────────────
  ('归唐',NULL,NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-10400F / AMD Ryzen 5 3600','Intel Core i7-12700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 2060 6GB / AMD RX 6600 8GB','NVIDIA RTX 4070 / AMD RX 7800 XT',
    16,32,120,120,'DirectX 12 Ultimate',
    'UE5引擎。预计支持DLSS 4 + FSR 4。冷兵器战斗需60fps稳定。SSD为必需。'),

  --  ── [04] 影之刃零 ────────────────────────────
  ('影之刃零','Phantom Blade Zero','影之刃0',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-11400F / AMD Ryzen 5 5600','Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 2070 8GB / AMD RX 6600 XT','NVIDIA RTX 4070 Ti / AMD RX 7900 XT',
    16,32,100,100,'DirectX 12 Ultimate',
    '灵游坊确认不依赖光线追踪, 优化 Lumen 软光照。高速战斗需稳定 60fps+。PS5 Pro 优先优化。'),

  --  ── [05] 失落之魂 ────────────────────────────
  ('失落之魂','Lost Soul Aside',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-10400F / AMD Ryzen 5 3600','Intel Core i7-12700 / AMD Ryzen 7 5700X',
    'NVIDIA RTX 2060 6GB / AMD RX 6600','NVIDIA RTX 4070 / AMD RX 7800 XT',
    16,32,80,80,'DirectX 12',
    '高速ACT需60fps稳定。PS5首发优化平台, PC版同步发售。'),

  --  ── [06] 湮灭之潮 ────────────────────────────
  ('湮灭之潮','Tide of Oblivion',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-12400F / AMD Ryzen 5 5600','Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 3060 12GB / AMD RX 6700 XT','NVIDIA RTX 4070 Ti / AMD RX 7900 XT',
    16,32,150,150,'DirectX 12 Ultimate',
    '30+ Boss战, 大量粒子特效。骑士协同 AI 对 CPU 有一定要求。'),

  --  ── [07] 黑神话钟馗 ────────────────────────────
  ('黑神话：钟馗','钟馗',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-12400F / AMD Ryzen 5 7600','Intel Core i7-14700K / AMD Ryzen 7 9800X3D',
    'NVIDIA RTX 3060 12GB / AMD RX 7600','NVIDIA RTX 5070 / AMD RX 9070 XT',
    16,32,150,150,'DirectX 12 Ultimate',
    '游戏科学第二款UE5作品, 场景密度目标超黑神话悟空一代。NVMe SSD为必需。预计2027年发售。'),

  --  ── [08] 剑来 ────────────────────────────
  ('剑来','Sword Come',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-12400F / AMD Ryzen 5 7600','Intel Core i7-14700K / AMD Ryzen 7 9800X3D',
    'NVIDIA RTX 3060 Ti / AMD RX 6700 XT','NVIDIA RTX 5070 Ti / AMD RX 9070 XT',
    16,32,120,120,'DirectX 12 Ultimate',
    '四座天下开放世界无缝连接, Nanite + Lumen 全面应用。"万剑归宗"AI 对 CPU 有额外开销。'),

  --  ── [09] 源初之结 ────────────────────────────
  ('源初之结','Origin Prime',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-13400F / AMD Ryzen 5 7600','Intel Core i7-14700K / AMD Ryzen 7 9800X3D',
    'NVIDIA RTX 3070 8GB / AMD RX 6800 16GB','NVIDIA RTX 5080 / AMD RX 9070 XT',
    16,32,180,180,'DirectX 12 Ultimate',
    '米哈游首款UE5写实3A。巨型BOSS战 + 4人联机对配置要求极高。NVMe SSD强制要求。预计2027Q4发售。'),

  --  ── [10] 诡秘之主 ────────────────────────────
  ('诡秘之主','Lord of the Mysteries',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-12400F / AMD Ryzen 5 5600','Intel Core i7-13700 / AMD Ryzen 7 7700X',
    'NVIDIA RTX 3060 12GB / AMD RX 7600','NVIDIA RTX 4070 Ti / AMD RX 7900 XT',
    16,32,100,100,'DirectX 12',
    '维多利亚×克苏鲁, 光影氛围渲染对GPU要求较高。22条序列途径剧情。预研阶段, 配置为UE5标准预估。'),

  --  ── [11] 望月 ────────────────────────────
  ('望月','Mochizuki','Gazing at the Moon',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-9400F / AMD Ryzen 5 2600','Intel Core i5-11400F / AMD Ryzen 5 5600',
    'NVIDIA GTX 1660 SUPER / AMD RX 5600 XT','NVIDIA RTX 3060 12GB / AMD RX 6600 XT',
    16,16,60,60,'DirectX 12',
    '独立团队作品, 配置要求相对友好。广州都市场景 + 月影界双地图。'),

  --  ── [12] 一盏秋声：锦衣卫 / 锦衣卫 ──────────
  ('一盏秋声：锦衣卫','锦衣卫','A Sound of Autumn: Embroidered Uniform Guard',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i5-10400F / AMD Ryzen 5 3600',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 2060 6GB / AMD RX 6600',
    8,16,40,40,'DirectX 11',
    '线性关卡 + 写实战斗。独立团队, 优化良好。CJ 2026 索尼展台可试玩。'),

  --  ── [13] 雪中悍刀行 ────────────────────────────
  ('雪中悍刀行','Sword in the Snow',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-10400F / AMD Ryzen 5 3600','Intel Core i7-12700K / AMD Ryzen 7 7700X',
    'NVIDIA RTX 2060 6GB / AMD RX 6600','NVIDIA RTX 3070 8GB / AMD RX 6750 XT',
    16,32,80,80,'DirectX 12',
    '"中式撤离"玩法, 多人在线部分需 20Mbps+ 稳定网络。免费游玩 + 外观付费。'),

  --  ── [14] 万民长歌三国 ────────────────────────────
  ('万民长歌：三国','万民长歌三国','万民长歌',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i5-11400F / AMD Ryzen 5 5600',
    'NVIDIA GTX 1060 3GB / AMD RX 570','NVIDIA RTX 2060 6GB / AMD RX 6600',
    8,16,50,50,'DirectX 11',
    '策略RPG, 对配置要求友好。偏 CPU (AI 势力模拟)。汉风写实美术。'),

  --  ── [15] 代号无限大 ────────────────────────────
  ('代号：无限大','代号无限大','Code Infinity',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-11400F / AMD Ryzen 5 5600','Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 2060 6GB / AMD RX 6600','NVIDIA RTX 4070 / AMD RX 7800 XT',
    16,32,100,100,'DirectX 12 Ultimate',
    '都市开放世界, 物理引擎极高(几乎所有物体可交互)。CPU 密集型。免费游玩 + 外观付费。'),

  --  ── [16] 古剑四 ────────────────────────────
  ('古剑','古剑奇谭四','古剑4',
    'Windows 10 64-bit 21H2','Windows 11 64-bit 23H2',
    'Intel Core i5-10400F / AMD Ryzen 5 3600','Intel Core i7-12700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 2060 SUPER 8GB / AMD RX 6600 XT','NVIDIA RTX 4070 Ti SUPER / AMD RX 7900 GRE',
    16,32,140,140,'DirectX 12 Ultimate',
    'CJ 2026 开放试玩。虚幻 5.4 + Nanite + Lumen + 全局体积雾。14GB 显存为 4K 光追刚需。'),

  --  ── [17] 猿公剑 ────────────────────────────
  ('猿公剑','Ape Sword','Yuan Gong Jian',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i5-11400F / AMD Ryzen 5 5600',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 3060 12GB / AMD RX 6600 XT',
    8,16,50,50,'DirectX 12',
    '独立团队硬核剑斗。"避青入红"系统对输入延迟敏感, 稳定60fps+为刚需。'),

  --  ── [18] 抵抗者 ────────────────────────────
  ('抵抗者','Resistor','The Resistance',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-9400F / AMD Ryzen 5 2600','Intel Core i5-12400F / AMD Ryzen 5 5600',
    'NVIDIA GTX 1660 Ti / AMD RX 590','NVIDIA RTX 3060 12GB / AMD RX 6650 XT',
    8,16,60,80,'DirectX 12',
    '抗日题材线性 FPS + 谍战解谜。中等场景规模。CJ 首次线下试玩。'),

  --  ── [19] 九阴真经修仙 ────────────────────────────
  ('九阴真经：修仙','九阴真经修仙','九阴修仙',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-10400F / AMD Ryzen 5 3600','Intel Core i7-12700 / AMD Ryzen 7 5700X',
    'NVIDIA RTX 2060 6GB / AMD RX 6600','NVIDIA RTX 4070 / AMD RX 7800 XT',
    16,32,100,100,'DirectX 12 Ultimate',
    'UE5 开放世界修仙。御剑飞行、宗门大战、海量 NPC 同屏。宗门战对 CPU 额外要求高。'),

  --  ── [20] 太吾绘卷 ────────────────────────────
  ('太吾绘卷','The Scroll of Taiwu',NULL,
    'Windows 7 64-bit','Windows 10 64-bit',
    'Intel Core i3-6100 / AMD FX-6300','Intel Core i5-8400 / AMD Ryzen 5 1600',
    'NVIDIA GTX 660 2GB / AMD HD 7850 2GB','NVIDIA GTX 1050 Ti / AMD RX 560',
    4,8,10,10,'DirectX 11',
    '2D 美术为主。复杂性在于策略模拟(大量 NPC 关系/事件), 后期吃 CPU 和内存。'),

  --  ── [21] 修仙模拟器 ────────────────────────────
  ('了不起的修仙模拟器','修仙模拟器','Amazing Cultivation Simulator',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-6500 / AMD FX-8300','Intel Core i5-10400F / AMD Ryzen 5 3600',
    'NVIDIA GTX 960 2GB / AMD R9 380 2GB','NVIDIA GTX 1660 / AMD RX 580 8GB',
    8,16,20,20,'DirectX 11',
    '修仙模拟经营类, 中低配置友好。复杂逻辑后期略吃 CPU。'),

  --  ── [22] 百面千相 ────────────────────────────
  ('百面千相','A Hundred Faces','Project Mugen',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-11400F / AMD Ryzen 5 5600','Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 3050 8GB / AMD RX 6600','NVIDIA RTX 4070 Ti / AMD RX 7900 XT',
    16,32,120,120,'DirectX 12 Ultimate',
    '叠纸首款开放世界。国风 + 戏曲面具美学。画面规格对标国际3A。'),

  --  ── [23] 无限暖暖 ────────────────────────────
  ('无限暖暖','Infinity Nikki',NULL,
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i5-11400F / AMD Ryzen 5 5600',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 3060 12GB / AMD RX 6600 XT',
    8,16,60,60,'DirectX 12',
    '卡通渲染开放世界。服装布料模拟对GPU有一定要求。免费游玩 + 服装抽取。'),

  --  ── [24] 鸣潮 ────────────────────────────
  ('鸣潮','Wuthering Waves','Wu Ming',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i7-10700 / AMD Ryzen 5 5600X',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 3060 12GB / AMD RX 6650 XT',
    8,16,80,80,'DirectX 12',
    '开放世界动作手游/PC同步。UE 4.27 自定义渲染管线。中等配置可跑高画质 60fps。'),

  --  ── [25] 绝区零 ────────────────────────────
  ('绝区零','Zenless Zone Zero','ZZZ',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-6500 / AMD FX-8300','Intel Core i7-7700 / AMD Ryzen 5 2600',
    'NVIDIA GTX 970 4GB / AMD RX 470 4GB','NVIDIA GTX 1060 6GB / AMD RX 580 8GB',
    8,16,80,100,'DirectX 11',
    '卡通渲染都市动作。对CPU单核性能要求较高(同屏大量AI+物理)。'),

  --  ── [26] 原神 ────────────────────────────
  ('原神','Genshin Impact',NULL,
    'Windows 7 SP1 64-bit','Windows 10 64-bit',
    'Intel Core i5 或同等','Intel Core i7 或同等',
    'NVIDIA GT 1030 及以上','NVIDIA GTX 1060 6GB 及以上',
    8,16,120,150,'DirectX 11',
    '卡通渲染开放世界。每版本 ~20GB 增量更新, 所需存储空间持续扩大。'),

  --  ── [27] 崩坏：星穹铁道 ────────────────────────────
  ('崩坏：星穹铁道','崩坏星穹铁道','星穹铁道',
    'Windows 7 SP1 64-bit','Windows 10 64-bit',
    'Intel Core i3-6100 / AMD Athlon 200GE','Intel Core i5-8400 / AMD Ryzen 5 1600',
    'NVIDIA GT 1030','NVIDIA GTX 1060 6GB / AMD RX 570',
    6,8,30,30,'DirectX 11',
    '回合制战斗。配置为米哈游全家桶最低门槛。'),

  --  ── [28] 明日方舟：终末地 ────────────────────────────
  ('明日方舟：终末地','明日方舟终末地','终末地',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-8400 / AMD Ryzen 5 1600','Intel Core i5-11400F / AMD Ryzen 5 5600',
    'NVIDIA GTX 1060 6GB / AMD RX 580 8GB','NVIDIA RTX 3060 12GB / AMD RX 6600 XT',
    8,16,60,60,'DirectX 12',
    '塔防 + RPG 探索。3D 场景 + 卡通渲染。中等规模。'),

  --  ── [29] 解限机 ────────────────────────────
  ('解限机','Mecha BREAK','解限机甲',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-9400F / AMD Ryzen 5 2600','Intel Core i7-10700 / AMD Ryzen 5 5600X',
    'NVIDIA GTX 1660 / AMD RX 590','NVIDIA RTX 3060 Ti / AMD RX 6700 XT',
    8,16,80,100,'DirectX 12',
    '机甲对战。同屏大量粒子特效 + 破坏场景, 对 GPU 有一定要求。免费游玩 + 机甲付费。'),

  --  ── [30] 逆水寒 ────────────────────────────
  ('逆水寒','Justice Online','Ni Shui Han',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-10400F / AMD Ryzen 5 3600','Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
    'NVIDIA RTX 2060 6GB / AMD RX 6600','NVIDIA RTX 4070 Ti SUPER / AMD RX 7900 GRE',
    16,32,150,200,'DirectX 12 Ultimate',
    '开放世界武侠, 超大规模无缝地图, 海量 NPC 同屏。"呼吸江湖"版本持续扩大安装体积。'),

  --  ── [31] 永劫无间 ────────────────────────────
  ('永劫无间','Naraka: Bladepoint',NULL,
    'Windows 10 64-bit','Windows 10 64-bit',
    'Intel Core i5 9400F / AMD Ryzen 5 2600','Intel Core i7 10700 / AMD Ryzen 7 5800X',
    'NVIDIA GTX 1060 6GB','NVIDIA RTX 3060 Ti / AMD RX 6700 XT',
    8,16,50,80,'DirectX 11',
    '多人武侠竞技。稳定 144fps 竞技体验需中高端 CPU。每赛季更新带来增量 5~10GB。'),

  --  ── [32] 幻兽帕鲁 ────────────────────────────
  ('幻兽帕鲁','Palworld','Pal World',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-7500 / AMD Ryzen 5 1600','Intel Core i7-11700K / AMD Ryzen 7 5800X',
    'NVIDIA GTX 1050 Ti 4GB','NVIDIA RTX 2070 Super / AMD RX 5700 XT',
    16,32,40,40,'DirectX 12',
    '开放世界生存 + 抓幻兽。多人服务器对 CPU 压力较大, 单机玩配置友好。'),

  --  ── [33] 古剑三 (古剑基线参考) ──────────────────
  ('古剑奇谭三','古剑3','古剑奇谭3',
    'Windows 7 SP1 64-bit','Windows 10 64-bit',
    'Intel Core i5-4590 / AMD FX-8350','Intel Core i7-6700 / AMD Ryzen 5 1600',
    'NVIDIA GTX 760 / AMD R7 260X','NVIDIA GTX 970 / AMD RX 470',
    8,16,40,40,'DirectX 11',
    '烛龙古剑系列传统优化, 中低配置可玩。可作为古剑系列作品的最低配置基线参考。'),

  --  ── [34] 崩坏3 ────────────────────────────
  ('崩坏3','崩坏三','崩坏3rd',
    'Windows 7 64-bit','Windows 10 64-bit',
    'Intel Core i3 / AMD Athlon','Intel Core i5-6500 或同等',
    'NVIDIA GT 730 或同等集成显卡','NVIDIA GTX 950 或以上',
    4,8,30,30,'DirectX 11',
    '卡通渲染动作手游/PC端。对硬件要求极低, 任何现代 PC 都可流畅运行。'),

  --  ── [35] 王者荣耀世界 ────────────────────────────
  ('王者荣耀·世界','王者荣耀世界','王者世界',
    'Windows 10 64-bit','Windows 11 64-bit',
    'Intel Core i5-9400F / AMD Ryzen 5 2600','Intel Core i7-11700K / AMD Ryzen 7 5800X',
    'NVIDIA GTX 1660 / AMD RX 590','NVIDIA RTX 3070 8GB / AMD RX 6800',
    16,32,150,200,'DirectX 12 Ultimate',
    '腾讯旗舰开放世界。跨平台 + 王者IP世界观。同屏玩家/怪物较多, 对CPU和内存压力大。');

-- ──────────────────────────────────────────────────────
-- 核心写入: LEFT JOIN games (LATERAL 子查询, 精确 > 模糊, 选第一条)
--   - 匹配不到 → g.id 为 NULL → WHERE 自动过滤掉, 不写, 不报错
--   - 匹配到   → ON CONFLICT 正常 upsert
-- ──────────────────────────────────────────────────────
INSERT INTO public.game_requirements (
  game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec,
  ram_min, ram_rec, storage_min, storage_rec, directx, notes,
  created_at, updated_at
)
SELECT
  g.id                            AS game_id,
  c.os_min, c.os_rec,
  c.cpu_min, c.cpu_rec,
  c.gpu_min, c.gpu_rec,
  c.ram_min, c.ram_rec,
  c.st_min, c.st_rec,
  c.directx, c.notes,
  now(), now()
FROM tmp_cfg c
CROSS JOIN LATERAL (
  SELECT gm.id
  FROM games gm
  WHERE -- 精确匹配 (大小写不敏感) + 别名 1/2
        lower(gm.title) = lower(c.t1)
     OR lower(gm.title) = lower(c.t2)
     OR lower(gm.title) = lower(c.t3)
        -- 模糊包含匹配
     OR lower(gm.title) LIKE '%' || lower(c.t1) || '%'
     OR lower(gm.title) LIKE '%' || lower(c.t2) || '%'
     OR lower(gm.title) LIKE '%' || lower(c.t3) || '%'
  ORDER BY -- 精确命中优先于模糊命中
           (lower(gm.title)=lower(c.t1)) DESC,
           (lower(gm.title)=lower(c.t2)) DESC,
           (lower(gm.title)=lower(c.t3)) DESC,
           gm.title ASC
  LIMIT 1
) g
WHERE g.id IS NOT NULL
ON CONFLICT (game_id) DO UPDATE SET
  os_min = EXCLUDED.os_min, os_rec = EXCLUDED.os_rec,
  cpu_min = EXCLUDED.cpu_min, cpu_rec = EXCLUDED.cpu_rec,
  gpu_min = EXCLUDED.gpu_min, gpu_rec = EXCLUDED.gpu_rec,
  ram_min = EXCLUDED.ram_min, ram_rec = EXCLUDED.ram_rec,
  storage_min = EXCLUDED.storage_min, storage_rec = EXCLUDED.storage_rec,
  directx = EXCLUDED.directx, notes = EXCLUDED.notes,
  updated_at = now();

-- ──────────────────────────────────────────────────────
-- 步骤 4: 验证查询 (结果里显示 配置有多少命中 / 多少没匹配上)
--
-- 看哪些配置没匹配到:
--   SELECT c.t1 AS 配置主标题, c.t2 AS 别名1, c.t3 AS 别名2, g.id AS 命中game_id
--   FROM tmp_cfg c LEFT JOIN LATERAL (
--     SELECT gm.id FROM games gm
--      WHERE lower(gm.title)=lower(c.t1) OR lower(gm.title)=lower(c.t2)
--         OR lower(gm.title)=lower(c.t3)
--         OR lower(gm.title) LIKE '%'||lower(c.t1)||'%'
--         OR lower(gm.title) LIKE '%'||lower(c.t2)||'%'
--         OR lower(gm.title) LIKE '%'||lower(c.t3)||'%'
--      ORDER BY (lower(gm.title)=lower(c.t1)) DESC LIMIT 1
--   ) g ON true
--   WHERE g.id IS NULL;
-- ──────────────────────────────────────────────────────

-- 最终汇总 (每个游戏显示是否有配置, 按热度排序)
SELECT
  g.title                                          AS 游戏,
  g.hype_score                                     AS 热度,
  CASE WHEN r.cpu_min IS NOT NULL THEN '✓' END     AS 有配置,
  r.cpu_min                                        AS CPU最低,
  r.gpu_min                                        AS GPU最低,
  r.ram_min || 'GB'                                AS 内存最低,
  r.storage_min || 'GB'                            AS 空间最低
FROM games g
LEFT JOIN game_requirements r ON r.game_id = g.id
ORDER BY g.hype_score DESC NULLS LAST, g.title;
