-- 先删旧测试文章，再插新
DELETE FROM articles WHERE title = '【图表测试】2026国产3A数据一览';

INSERT INTO articles (title, content, category, required_tier, tags, status)
VALUES (
  '【图表测试】2026国产3A数据一览',
  '# 图表功能测试

三种内联图表示例。

## 热度指数柱状图

:::chart bar title: 2026国产3A热度指数 | 归唐: 94 | 影之刃零: 95 | 黑神话悟空: 98 | 失落之魂: 85 | 湮灭之潮: 88 | 燕云十六声: 72 | 望月: 78 :::

## 归唐 vs 影之刃零 对比表

:::chart comparison title: 核心参数 | 归唐;94;200 | 影之刃零;95;150 :::

## 国产3A发售时间轴

:::chart timeline 2024.08: 黑神话悟空发售 | 2025.12: 燕云十六声上线 | 2026.09: 失落之魂发售 | 2026.10: 归唐发售 | 2026.10: 影之刃零发售 | 2027.Q4: 源初之结发售 :::

## 定价对比

:::chart bar title: 国产3A定价对比 (元) | 黑神话悟空: 268 | 归唐: 298 | 影之刃零: 298 | 失落之魂: 298 | 艾尔登法环: 298 :::

三种图表渲染效果。',
  'analysis', 'free', ARRAY['图表','测试','国产3A'], 'published'
);
