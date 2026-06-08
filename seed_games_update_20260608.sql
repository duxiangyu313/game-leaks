-- 国产3A游戏数据库更新 — 2026年6月8日
-- 基于：Xbox Games Showcase 2026 + SGF 2026 后续跟踪
-- 执行环境：Supabase SQL Editor

-- 1. 影之刃零：发售日从9月9日延期至10月29日（6月3日 State of Play 官宣）
UPDATE games
SET release_date = '2026-10-29',
    description = '暗黑武侠功夫朋克。主角生命仅剩66天，全人类手工制作拒绝AI。主线20-30小时，愿望单破百万。2026年6月3日State of Play宣布从9月9日延期至10月29日。夏季开启全球预购。PlayStation夏末举办15-20分钟专场深度解析。'
WHERE title = '影之刃零';

-- 2. 归唐：平台从"PC/主机"确认更新为 PC/PS5/Xbox Series X|S（Metacritic页面已上线确认全平台同步）
UPDATE games
SET platforms = ARRAY['PC','PS5','Xbox'],
    description = '网易首款自研买断制3A单机。安史之乱后敦煌信使的归唐之路，写实搏杀，叙事动作冒险。SGF 2026全球首曝19分钟实机+剧情预告《Hold Till Dawn》。Play Days开放全球首次媒体试玩。Metacritic页面上线确认全平台。外媒誉为"盛唐版神秘海域"。'
WHERE title = '归唐';

-- 3. 燕云十六声：Xbox版正式上线 + Game Pass福利，平台补充Xbox
UPDATE games
SET platforms = ARRAY['PC','移动端','Xbox'],
    description = '网易开放世界武侠巨制。五代十国历史背景，单人模式×多人模式双线并行。全球玩家破8000万。2026年6月7日Xbox Showcase影子掉落Xbox版+Game Pass专属福利。新DLC《Hidden Mountain》公开。'
WHERE title = '燕云十六声';
