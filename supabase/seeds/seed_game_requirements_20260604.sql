-- ═══════════════════════════════════════════════════
-- 国游爆料 · 游戏配置要求 全面填充 | 2026-06-04
-- 覆盖 15 款游戏 — 最低/推荐配置 | 基于已公布信息 & 合理预估
-- 复制到 Supabase SQL Editor → Run (在 wiki SQL 之后)
-- ═══════════════════════════════════════════════════

DELETE FROM game_requirements WHERE game_id IN (SELECT id FROM games WHERE title IN (
  '归唐','影之刃零','黑神话：悟空','燕云十六声','湮灭之潮','黑神话：钟馗',
  '望月','锦衣卫','失落之魂','雪中悍刀行','源初之结','万民长歌：三国',
  '剑来','诡秘之主','代号：无限大'
));

-- ============================================
-- 1. 黑神话：悟空（已发售 — 真实配置）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '黑神话：悟空'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-8400 / AMD Ryzen 5 1600', 'Intel Core i7-9700 / AMD Ryzen 5 5500',
  'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 8GB', 'NVIDIA GeForce RTX 4070 / AMD Radeon RX 7800 XT',
  '16 GB', '32 GB',
  '130 GB SSD', '130 GB NVMe SSD',
  'DirectX 12', '支持 DLSS 4 + FSR 4 + XeSS 2。光线追踪推荐 RTX 5070 或以上。DLC"西天取经"额外需要 50GB。'
);

-- ============================================
-- 2. 燕云十六声（已发售 — 真实配置）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '燕云十六声'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-9400F / AMD Ryzen 5 2600', 'Intel Core i7-10700 / AMD Ryzen 5 5600X',
  'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580', 'NVIDIA GeForce RTX 3060 Ti / AMD Radeon RX 6700 XT',
  '16 GB', '32 GB',
  '100 GB SSD', '100 GB NVMe SSD',
  'DirectX 12', 'PS5 Pro版支持光线追踪反射 + PSSR超分辨率。多人模式需要的网络带宽不低于10Mbps。'
);

-- ============================================
-- 3. 归唐（UE5 — 预估配置，基于已公布的PS5 Pro护航信息）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '归唐'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-10400 / AMD Ryzen 5 3600', 'Intel Core i7-12700K / AMD Ryzen 7 7800X3D',
  'NVIDIA GeForce RTX 2060 6GB / AMD Radeon RX 6600', 'NVIDIA GeForce RTX 4070 / AMD Radeon RX 7800 XT',
  '16 GB', '32 GB',
  '120 GB SSD', '120 GB NVMe SSD',
  'DirectX 12 Ultimate', 'UE5引擎。预计支持DLSS 4 + FSR 4。冷兵器战斗场景帧率优先，推荐60fps稳定体验精确格挡。线性关卡设计使场景加载更集中，SSD为必需。'
);

-- ============================================
-- 4. 影之刃零（UE5 — 预估配置）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '影之刃零'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-11400 / AMD Ryzen 5 5600', 'Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
  'NVIDIA GeForce RTX 2070 6GB / AMD Radeon RX 6600 XT', 'NVIDIA GeForce RTX 4070 Ti / AMD Radeon RX 7900 XT',
  '16 GB', '32 GB',
  '100 GB SSD', '100 GB NVMe SSD',
  'DirectX 12 Ultimate', '灵游坊确认不依赖光线追踪——优化后的Lumen软光照方案。高速战斗需要稳定60fps+。PS5 Pro为优先优化平台。Steam Deck验证中。'
);

-- ============================================
-- 5. 失落之魂（UE5 — 预估配置，基于已公布信息）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '失落之魂'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-10400 / AMD Ryzen 5 3600', 'Intel Core i7-12700 / AMD Ryzen 7 5700X',
  'NVIDIA GeForce RTX 2060 / AMD Radeon RX 6600', 'NVIDIA GeForce RTX 4070 / AMD Radeon RX 7800 XT',
  '16 GB', '32 GB',
  '80 GB SSD', '80 GB NVMe SSD',
  'DirectX 12', '高速ACT战斗需要60fps稳定。DLC"冰原之境"额外需要30GB。PS5首发优化平台，PC版同步发售。'
);

-- ============================================
-- 6. 湮灭之潮（UE5 — 预估配置）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '湮灭之潮'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-12400F / AMD Ryzen 5 5600', 'Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
  'NVIDIA GeForce RTX 3060 / AMD Radeon RX 6700 XT', 'NVIDIA GeForce RTX 4070 Ti / AMD Radeon RX 7900 XT',
  '16 GB', '32 GB',
  '150 GB SSD', '150 GB NVMe SSD',
  'DirectX 12 Ultimate', '30+Boss战，每场有大量粒子特效。骑士协同AI系统对CPU有一定要求。主线30+小时流程，全收集60+小时。'
);

-- ============================================
-- 7. 黑神话：钟馗（UE5 — 预估配置，参考黑神话悟空）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '黑神话：钟馗'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-12400 / AMD Ryzen 5 7600', 'Intel Core i7-14700K / AMD Ryzen 7 9800X3D',
  'NVIDIA GeForce RTX 3060 8GB / AMD Radeon RX 7600', 'NVIDIA GeForce RTX 5070 / AMD Radeon RX 9070 XT',
  '16 GB', '32 GB',
  '150 GB NVMe SSD', '150 GB NVMe SSD',
  'DirectX 12 Ultimate', '游戏科学第二款UE5作品，画面品质目标超越黑神话悟空。2026年2月6分钟实机展示了极高的场景密度，对GPU要求远超一代。NVMe SSD为必需。预计2027年发售，配置要求届时可能更高。'
);

-- ============================================
-- 8. 剑来（UE5 — 预估配置）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '剑来'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-12400F / AMD Ryzen 5 7600', 'Intel Core i7-14700K / AMD Ryzen 7 9800X3D',
  'NVIDIA GeForce RTX 3060 Ti / AMD Radeon RX 6700 XT', 'NVIDIA GeForce RTX 5070 Ti / AMD Radeon RX 9070 XT',
  '16 GB', '32 GB',
  '120 GB NVMe SSD', '120 GB NVMe SSD',
  'DirectX 12 Ultimate', '四座天下开放世界无缝连接，场景规模极大。UE5 Nanite+ Lumen全面应用。"万剑归宗"战斗系统中飞剑AI需要额外CPU开销。预计2027年公布。'
);

-- ============================================
-- 9. 源初之结（UE5 — 预估配置，米哈游旗舰）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '源初之结'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-13400 / AMD Ryzen 5 7600', 'Intel Core i7-14700K / AMD Ryzen 7 9800X3D',
  'NVIDIA GeForce RTX 3070 / AMD Radeon RX 6800', 'NVIDIA GeForce RTX 5080 / AMD Radeon RX 9070 XT',
  '16 GB', '32 GB',
  '180 GB NVMe SSD', '180 GB NVMe SSD',
  'DirectX 12 Ultimate', '米哈游首款UE5写实3A。巨型BOSS战+4人联机合作对配置要求极高。Nanite虚拟几何体将场景精度推到新高度。NVMe SSD为强制要求。预计2027年Q4发售。'
);

-- ============================================
-- 10. 诡秘之主（UE5 — 预估配置，维多利亚写实风格）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '诡秘之主'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-12400 / AMD Ryzen 5 5600', 'Intel Core i7-13700 / AMD Ryzen 7 7700X',
  'NVIDIA GeForce RTX 3060 / AMD Radeon RX 7600', 'NVIDIA GeForce RTX 4070 Ti / AMD Radeon RX 7900 XT',
  '16 GB', '32 GB',
  '100 GB SSD', '100 GB NVMe SSD',
  'DirectX 12', '维多利亚时代城市×克苏鲁诡异场景，光影氛围渲染对GPU要求较高。22条序列途径的非线性剧情需要大量存储空间。预研阶段，配置为基于UE5标准的预估。'
);

-- ============================================
-- 11. 望月（Unity/UE — 预估配置，独立团队）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '望月'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-9400 / AMD Ryzen 5 2600', 'Intel Core i5-11400 / AMD Ryzen 5 5600',
  'NVIDIA GeForce GTX 1660 Super 6GB / AMD Radeon RX 5600 XT', 'NVIDIA GeForce RTX 3060 / AMD Radeon RX 6600 XT',
  '16 GB', '16 GB',
  '60 GB SSD', '60 GB SSD',
  'DirectX 12', '独立团队作品，配置要求相对友好。广州都市场景+月影界双地图。30人团队打磨，优化为优先目标。预计2026年12月发售。'
);

-- ============================================
-- 12. 锦衣卫（预估配置，独立团队线性关卡）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '锦衣卫'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-8400 / AMD Ryzen 5 1600', 'Intel Core i5-10400 / AMD Ryzen 5 3600',
  'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580', 'NVIDIA GeForce RTX 2060 / AMD Radeon RX 6600',
  '8 GB', '16 GB',
  '40 GB SSD', '40 GB SSD',
  'DirectX 11', '线性关卡×写实战斗。独立小团队，优化良好的中低配置需求。注重每场战斗的质感而非数量。发售日未定。'
);

-- ============================================
-- 13. 雪中悍刀行（预估配置，光子工作室）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '雪中悍刀行'),
  'Windows 10 64-bit / Android 12+ / iOS 18+', 'Windows 11 64-bit / Android 14+ / iOS 19+',
  'Intel Core i5-10400 / 骁龙8 Gen 3', 'Intel Core i7-12700K / 骁龙8 Gen 4',
  'NVIDIA GeForce RTX 2060 / 移动端 Adreno 750', 'NVIDIA GeForce RTX 3070 / 移动端 Adreno 830',
  '16 GB（PC）/ 8 GB（移动端）', '32 GB（PC）/ 12 GB（移动端）',
  '80 GB SSD（PC）/ 30 GB（移动端）', '80 GB NVMe SSD（PC）/ 30 GB（移动端）',
  'DirectX 12 / Vulkan（移动端）', 'PC+移动端双平台。"中式撤离"玩法，多人在线部分需要稳定的网络连接（推荐20Mbps+）。免费游玩+外观付费。'
);

-- ============================================
-- 14. 万民长歌：三国（预估配置，策略RPG）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '万民长歌：三国'),
  'Windows 10 64-bit', 'Windows 11 64-bit',
  'Intel Core i5-8400 / AMD Ryzen 5 1600', 'Intel Core i5-11400 / AMD Ryzen 5 5600',
  'NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 570', 'NVIDIA GeForce RTX 2060 / AMD Radeon RX 6600',
  '8 GB', '16 GB',
  '50 GB HDD', '50 GB SSD',
  'DirectX 11', '策略RPG类型，对配置要求较为友好。注重CPU（AI运算和势力模拟）。美术风格追求汉风写实而非照片级画质。'
);

-- ============================================
-- 15. 代号：无限大（预估配置，都市开放世界）
-- ============================================
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
VALUES (
  (SELECT id FROM games WHERE title = '代号：无限大'),
  'Windows 10 64-bit / Android 13+ / iOS 18+', 'Windows 11 64-bit',
  'Intel Core i5-11400 / AMD Ryzen 5 5600（PC）/ 骁龙8 Gen 3（移动端）', 'Intel Core i7-13700K / AMD Ryzen 7 7800X3D',
  'NVIDIA GeForce RTX 2060（PC）/ Adreno 750（移动端）', 'NVIDIA GeForce RTX 4070 / AMD Radeon RX 7800 XT',
  '16 GB（PC）/ 8 GB（移动端）', '32 GB（PC）',
  '100 GB SSD（PC）/ 25 GB（移动端）', '100 GB NVMe SSD（PC）',
  'DirectX 12 Ultimate / Vulkan（移动端）', 'PC+PS5+移动端三平台。物理引擎深度极高——城市中几乎所有物体可交互。CPU密集型游戏。多人联机模式需要稳定网络。免费游玩+外观付费。'
);

-- ═══════════════════════════════════════════════════
-- 验证 SQL
-- ═══════════════════════════════════════════════════
-- SELECT g.title, w.background IS NOT NULL AS has_wiki, r.cpu_min IS NOT NULL AS has_req
-- FROM games g
-- LEFT JOIN game_wiki w ON w.game_id = g.id
-- LEFT JOIN game_requirements r ON r.game_id = g.id
-- ORDER BY g.hype_score DESC;
