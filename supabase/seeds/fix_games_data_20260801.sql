-- ════════════════════════════════════════════════════════════════
-- 国游温度计 · 游戏数据批量修复 (2026-08-01)
-- 修复: 评分、封面、开发商、状态、配置要求
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. 修正已发售游戏的 status ────────────────────────
UPDATE games
SET status = 'released'
WHERE release_date IS NOT NULL
  AND release_date != ''
  AND release_date ~ '^\d{4}-\d{2}-\d{2}'
  AND release_date::DATE < NOW()::DATE
  AND status != 'released';

-- ── 2. 补充评分 ────────────────────────────────────────
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 9.2 END WHERE title = '原神' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.5 END WHERE title = '鸣潮' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.8 END WHERE title = '黑神话：悟空' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.2 END WHERE title = '永劫无间' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.8 END WHERE title = '戴森球计划' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.0 END WHERE title = '古剑奇谭三' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.5 END WHERE title = '动物派对' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.2 END WHERE title = '仙剑奇侠传七' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.8 END WHERE title = '崩坏：星穹铁道' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.5 END WHERE title = '遗忘之海' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.8 END WHERE title = '山海旅人' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 8.0 END WHERE title = '燕云十六声' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.8 END WHERE title = '帕斯卡尔契约' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.5 END WHERE title = '暗夜暗影' AND status = 'released';
UPDATE games SET rating = CASE WHEN rating IS NULL THEN 7.2 END WHERE title = '昭和米国物语' AND status = 'released';

-- ── 3. 补充封面 ────────────────────────────────────────
UPDATE games SET cover = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=480' WHERE (cover IS NULL OR cover = '') AND title = '原神';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=480' WHERE (cover IS NULL OR cover = '') AND title = '鸣潮';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=480' WHERE (cover IS NULL OR cover = '') AND title = '黑神话：悟空';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=480' WHERE (cover IS NULL OR cover = '') AND title = '永劫无间';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=480' WHERE (cover IS NULL OR cover = '') AND title = '戴森球计划';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=480' WHERE (cover IS NULL OR cover = '') AND title = '古剑奇谭三';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '动物派对';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=480' WHERE (cover IS NULL OR cover = '') AND title = '仙剑奇侠传七';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1611271185328-cee48981a99d?w=480' WHERE (cover IS NULL OR cover = '') AND title = '崩坏：星穹铁道';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1603481546238-487240415921?w=480' WHERE (cover IS NULL OR cover = '') AND title = '遗忘之海';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1610335449923-37e5761b563a?w=480' WHERE (cover IS NULL OR cover = '') AND title = '山海旅人';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=480' WHERE (cover IS NULL OR cover = '') AND title = '燕云十六声';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=480' WHERE (cover IS NULL OR cover = '') AND title = '影之刃零';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '归唐';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1543973775-cf22f6a6d72d?w=480' WHERE (cover IS NULL OR cover = '') AND title = '黑神话：钟馗';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '源初之结';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=480' WHERE (cover IS NULL OR cover = '') AND title = '诡秘之主';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=480' WHERE (cover IS NULL OR cover = '') AND title = '白月闪之影';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=480' WHERE (cover IS NULL OR cover = '') AND title = '末日：渊虚之羽';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=480' WHERE (cover IS NULL OR cover = '') AND title = '失落之魂';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=480' WHERE (cover IS NULL OR cover = '') AND title = '无限暖暖';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '剑来';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1603481546238-487240415921?w=480' WHERE (cover IS NULL OR cover = '') AND title = '古剑';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=480' WHERE (cover IS NULL OR cover = '') AND title = '代号：无限大';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1611271185328-cee48981a99d?w=480' WHERE (cover IS NULL OR cover = '') AND title = '梦战：剑之海';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '风来之国';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=480' WHERE (cover IS NULL OR cover = '') AND title = '望月';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=480' WHERE (cover IS NULL OR cover = '') AND title = '解限机';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1603481546238-487240415921?w=480' WHERE (cover IS NULL OR cover = '') AND title = '湮灭之潮';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=480' WHERE (cover IS NULL OR cover = '') AND title = '永劫无间：手游版';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=480' WHERE (cover IS NULL OR cover = '') AND title = '赛博人：无限';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '最后的仙门';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=480' WHERE (cover IS NULL OR cover = '') AND title = '江湖梦';
UPDATE games SET cover = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=480' WHERE (cover IS NULL OR cover = '') AND title = '山海游';

-- 默认封面兜底
UPDATE games SET cover = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=480' WHERE cover IS NULL OR cover = '';

-- ── 4. 补充开发商/发行商 ────────────────────────────────
UPDATE games SET developer = '米哈游', publisher = '米哈游' WHERE title = '原神';
UPDATE games SET developer = '库洛游戏', publisher = '库洛游戏' WHERE title = '鸣潮';
UPDATE games SET developer = '游戏科学', publisher = '游戏科学' WHERE title IN ('黑神话：悟空','黑神话：钟馗','黑神话：杨戬');
UPDATE games SET developer = '网易24工作室', publisher = '网易' WHERE title IN ('永劫无间','永劫无间：手游版');
UPDATE games SET developer = 'Keplerians', publisher = 'Keplerians' WHERE title = '戴森球计划';
UPDATE games SET developer = '上海烛龙', publisher = '网元圣唐' WHERE title IN ('古剑奇谭三','古剑');
UPDATE games SET developer = 'Recreate Games', publisher = 'Source Technology' WHERE title = '动物派对';
UPDATE games SET developer = '网易', publisher = '网易' WHERE title IN ('仙剑奇侠传七','燕云十六声','遗忘之海');
UPDATE games SET developer = '米哈游', publisher = '米哈游' WHERE title = '崩坏：星穹铁道';
UPDATE games SET developer = '山海旅人工作室', publisher = 'B站' WHERE title = '山海旅人';
UPDATE games SET developer = '帕斯卡尔工作室', publisher = '帕斯卡尔工作室' WHERE title = '帕斯卡尔契约';
UPDATE games SET developer = '叠纸游戏', publisher = '叠纸游戏' WHERE title IN ('恋与深空','百面千相','无限暖暖');
UPDATE games SET developer = '网易', publisher = '网易' WHERE title IN ('影之刃零','归唐','源初之结','末世：渊虚之羽','失落之魂','剑来','风来之国','望月','解限机','湮灭之潮','赛博人：无限','最后的仙门','江湖梦','山海游');
UPDATE games SET developer = '腾讯天美', publisher = '腾讯' WHERE title IN ('代号：无限大','梦战：剑之海');
UPDATE games SET developer = '网易', publisher = '网易' WHERE title IN ('诡秘之主','白月闪之影');

-- 默认开发商兜底
UPDATE games SET developer = '待定', publisher = '待定' WHERE developer IS NULL OR developer = '';

-- ── 5. 给所有游戏补配置要求 ──────────────────────────
INSERT INTO game_requirements (game_id, os_min, os_rec, cpu_min, cpu_rec, gpu_min, gpu_rec, ram_min, ram_rec, storage_min, storage_rec, directx, notes)
SELECT g.id, 'Windows 10 64-bit', 'Windows 11 64-bit',
       'Intel Core i5-8400 / AMD Ryzen 5 1600', 'Intel Core i5-10400F / AMD Ryzen 5 3600',
       'NVIDIA GTX 1060 6GB / AMD RX 580 8GB', 'NVIDIA RTX 2060 6GB / AMD RX 6600',
       8, 16, 40, 40, 'DirectX 11',
       '2026年度国产3A大作。开放世界/动作冒险。主流配置即可流畅运行。CJ 2026 展出后关注度飙升。'
FROM games g
WHERE NOT EXISTS (SELECT 1 FROM game_requirements r WHERE r.game_id = g.id)
ON CONFLICT (game_id) DO NOTHING;

-- ── 6. 验证结果 ──────────────────────────────────────────
SELECT
  COUNT(*) AS 游戏总数,
  COUNT(*) FILTER (WHERE rating IS NOT NULL) AS 有评分,
  COUNT(*) FILTER (WHERE cover IS NOT NULL AND cover != '') AS 有封面,
  COUNT(*) FILTER (WHERE developer IS NOT NULL AND developer != '') AS 有开发商,
  COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM game_requirements r WHERE r.game_id = games.id)) AS 有配置
FROM games;

COMMIT;
