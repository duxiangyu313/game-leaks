-- 为已有文章追加内联图表示例
-- 在 Supabase SQL Editor 执行

-- 1. 国产3A热度对比文章 — 加柱状图
UPDATE articles SET content = content || E'\n\n:::chart bar\ntitle: 2026国产3A热度指数\n归唐: 94\n影之刃零: 95\n黑神话悟空: 98\n失落之魂: 85\n湮灭之潮: 88\n燕云十六声: 72\n:::\n'
WHERE title LIKE '%10款国产3A游戏全盘点%' AND content NOT LIKE '%chart%';

-- 2. 归唐VS影之刃零 — 加对比表
UPDATE articles SET content = content || E'\n\n:::chart comparison\ntitle: 归唐 vs 影之刃零 核心参数\n归唐;94;200\n影之刃零;95;150\n:::\n'
WHERE title LIKE '%归唐VS影之刃零%' AND content NOT LIKE '%chart%';

-- 3. 定价分析文章 — 加柱状图
UPDATE articles SET content = content || E'\n\n:::chart bar\ntitle: 国产3A定价对比 (元)\n黑神话悟空: 268\n归唐: 298\n影之刃零: 298\n失落之魂: 298\n艾尔登法环: 298\n战神诸神黄昏: 398\n:::\n'
WHERE title LIKE '%定价分析%' AND content NOT LIKE '%chart%';

-- 4. 国产3A未来 — 加时间轴
UPDATE articles SET content = content || E'\n\n:::chart timeline\n2024.08: 黑神话悟空发售(2000万份)\n2025.12: 燕云十六声上线\n2026.09: 失落之魂发售\n2026.10: 归唐发售\n2026.10: 影之刃零发售\n2027.Q4: 源初之结发售\n:::\n'
WHERE title LIKE '%国产3A的未来%' AND content NOT LIKE '%chart%';

SELECT title, length(content) as content_length FROM articles WHERE content LIKE '%chart%';
