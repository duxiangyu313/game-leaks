-- 文章分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('爆料专区', 'leaks', '国产3A游戏最新内幕爆料与信息交叉验证', 'flame', 1),
('深度解析', 'analysis', '游戏评测、前瞻分析、开发者访谈与行业观察', 'book', 2),
('行业资讯', 'industry', '游戏行业动态、政策变化、公司财报与市场数据', 'trending', 3),
('视频', 'video', '国游温度计与国游爆料视频内容', 'play', 4)
ON CONFLICT (slug) DO NOTHING;

-- 文章评论表
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users insert comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_article ON post_comments(article_id);

-- 给 articles 表加 excerpt 列
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;

-- 更新现有文章的 excerpt（取 content 前150字）
UPDATE articles SET excerpt = substring(content from 1 for 150) WHERE excerpt IS NULL;
