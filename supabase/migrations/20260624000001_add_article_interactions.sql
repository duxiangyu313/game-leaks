-- Migration: 创建文章互动表 (点赞/收藏/分享/可信度投票)
-- Date: 2026-06-24
-- Description: 为文章详情页提供用户互动功能的数据存储

CREATE TABLE IF NOT EXISTS article_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'like', 'bookmark', 'share',
    'credibility_believe', 'credibility_skeptical'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, user_id, interaction_type)
);

-- 索引：按文章查询互动
CREATE INDEX IF NOT EXISTS idx_ai_article ON article_interactions(article_id, interaction_type);
-- 索引：按用户查询互动
CREATE INDEX IF NOT EXISTS idx_ai_user ON article_interactions(user_id);
-- 索引：防止重复互动
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_unique ON article_interactions(article_id, user_id, interaction_type);

-- RLS：任何人可读
ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read article_interactions"
  ON article_interactions FOR SELECT
  USING (true);
-- 仅登录用户可创建自己的互动
CREATE POLICY "Users can create own interactions"
  ON article_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- 仅本人可删除
CREATE POLICY "Users can delete own interactions"
  ON article_interactions FOR DELETE
  USING (auth.uid() = user_id);
