-- 把所有付费文章的 required_tier 改为 free
-- 保留原值在 required_tier_backup 列，方便未来恢复
ALTER TABLE articles ADD COLUMN IF NOT EXISTS required_tier_backup TEXT;

UPDATE articles
SET required_tier_backup = required_tier,
    required_tier = 'free'
WHERE required_tier IS NOT NULL AND required_tier != 'free';

-- 验证：确认没有 gold/diamond 的文章了
SELECT required_tier, COUNT(*) FROM articles GROUP BY required_tier;
