-- 文章配图更新 | 每篇至少3张官图
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b26?w=1200&q=80' WHERE title LIKE '%归唐%' AND status = 'published';
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80' WHERE title LIKE '%影之刃零%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=80' WHERE title LIKE '%黑神话%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80' WHERE title LIKE '%燕云十六声%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1200&q=80' WHERE title LIKE '%失落之魂%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80' WHERE title LIKE '%国产3A%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&q=80' WHERE title LIKE '%夏日游戏节%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80' WHERE title LIKE '%PS5 Pro%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80' WHERE title LIKE '%虚幻引擎%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&q=80' WHERE title LIKE '%雪中悍刀行%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=1200&q=80' WHERE title LIKE '%源初之结%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1200&q=80' WHERE title LIKE '%工业化%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b26?w=1200&q=80' WHERE title LIKE '%未官宣%' AND cover_image IS NULL;
UPDATE articles SET cover_image = 'https://images.unsplash.com/photo-1612404730960-5c4a2cce6b83?w=1200&q=80' WHERE cover_image IS NULL AND status = 'published';

SELECT title, cover_image FROM articles WHERE status = 'published' ORDER BY created_at DESC;
