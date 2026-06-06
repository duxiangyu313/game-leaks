-- v2：直接 SET content，不用 || 拼接
UPDATE articles SET content = content || CHR(10) || CHR(10) || ':::chart bar
title: 2026国产3A热度指数
归唐: 94
影之刃零: 95
黑神话悟空: 98
失落之魂: 85
湮灭之潮: 88
燕云十六声: 72
:::' WHERE title LIKE '%10款国产3A%' AND content NOT LIKE '%:::chart%';

UPDATE articles SET content = content || CHR(10) || CHR(10) || ':::chart comparison
title: 归唐 vs 影之刃零 核心参数
归唐;94;200
影之刃零;95;150
:::' WHERE title LIKE '%归唐VS影之刃零%' AND content NOT LIKE '%:::chart%';

UPDATE articles SET content = content || CHR(10) || CHR(10) || ':::chart bar
title: 国产3A定价对比 (元)
黑神话悟空: 268
归唐: 298
影之刃零: 298
失落之魂: 298
艾尔登法环: 298
战神诸神黄昏: 398
:::' WHERE title LIKE '%定价分析%' AND content NOT LIKE '%:::chart%';

UPDATE articles SET content = content || CHR(10) || CHR(10) || ':::chart timeline
2024.08: 黑神话悟空发售 (2000万份)
2025.12: 燕云十六声上线
2026.09: 失落之魂发售
2026.10: 归唐发售
2026.10: 影之刃零发售
2027.Q4: 源初之结发售
:::' WHERE title LIKE '%国产3A的未来%' AND content NOT LIKE '%:::chart%';

-- 验证
SELECT title, CASE WHEN content LIKE '%:::chart%' THEN 'YES' ELSE 'NO' END AS has_chart FROM articles WHERE status = 'published';
