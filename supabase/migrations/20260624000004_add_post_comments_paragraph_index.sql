-- Migration: post_comments 表补充 paragraph_index 列
-- Date: 2026-06-24
-- Description: 支持行内评论（段落级锚点）

ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS paragraph_index INTEGER;
