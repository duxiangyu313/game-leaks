-- ===================================================
-- 国游温度计 · Top 10 热门游戏 price 填充
-- 执行：复制到 Supabase SQL Editor → Run
-- 生成：2026-08-04
-- ===================================================

-- 1. 创建 game_prices 表（如未存在）
CREATE TABLE IF NOT EXISTS game_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  currency TEXT DEFAULT 'CNY',
  original_price NUMERIC(10,2),
  current_price NUMERIC(10,2),
  discount_percent INTEGER DEFAULT 0,
  lowest_price NUMERIC(10,2),
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_prices ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read prices' AND tablename = 'game_prices') THEN
    CREATE POLICY "Public read prices" ON game_prices FOR SELECT USING (true);
  END IF;
END
$$;
CREATE INDEX IF NOT EXISTS idx_prices_game_date ON game_prices(game_id, recorded_at);

-- 2. 插入价格数据（仅已发售/已公布预购价的游戏）
-- 未发售且无预购价的游戏跳过：归唐/遗忘之海/黑神话钟馗/源初之结/诡秘之主

-- ① 黑神话：悟空 — PC 标准版 ¥268
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('4ce2362e-c71b-47dc-97f8-86f63dafc45b', 'Steam', 'Steam 标准版', 'CNY', 268, 268, CURRENT_DATE);

-- ① 黑神话：悟空 — PC 数字豪华版 ¥328
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('4ce2362e-c71b-47dc-97f8-86f63dafc45b', 'Steam', 'Steam 数字豪华版', 'CNY', 328, 328, CURRENT_DATE);

-- ① 黑神话：悟空 — WeGame 标准版
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('4ce2362e-c71b-47dc-97f8-86f63dafc45b', 'WeGame', 'WeGame 标准版', 'CNY', 268, 268, CURRENT_DATE);

-- ① 黑神话：悟空 — PS5 标准版
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('4ce2362e-c71b-47dc-97f8-86f63dafc45b', 'PSN', 'PSN 标准版', 'CNY', 298, 298, CURRENT_DATE);

-- ② 影之刃零 — Steam 标准版 ¥298
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('aca30815-9fde-4c86-b2d9-bd65f1876add', 'Steam', 'Steam 标准版', 'CNY', 298, 298, CURRENT_DATE);

-- ② 影之刃零 — PS5 标准版
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('aca30815-9fde-4c86-b2d9-bd65f1876add', 'PSN', 'PSN 标准版', 'CNY', 348, 348, CURRENT_DATE);

-- ⑦ 原神 — 免费游玩（全平台）
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('c55fad9b-c811-4acd-866c-11c956ef1e0f', 'App Store', 'App Store', 'CNY', 0, 0, CURRENT_DATE);
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('c55fad9b-c811-4acd-866c-11c956ef1e0f', 'PSN', 'PSN', 'CNY', 0, 0, CURRENT_DATE);

-- ⑧ 永劫无间 — 原买断制 ¥98（2023.7转免费）
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, discount_percent, lowest_price, recorded_at)
VALUES ('cd3c9c66-ff7a-481a-9461-3cc70912afe9', 'Steam', 'Steam 标准版（已转免费）', 'CNY', 98, 0, 100, 49, CURRENT_DATE);

-- ⑨ 崩坏：星穹铁道 — 免费游玩（全平台）
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('fcb9c838-1ed4-4d40-b32e-94e698a31497', 'App Store', 'App Store', 'CNY', 0, 0, CURRENT_DATE);
INSERT INTO game_prices (game_id, platform, store, currency, original_price, current_price, recorded_at)
VALUES ('fcb9c838-1ed4-4d40-b32e-94e698a31497', 'PSN', 'PSN', 'CNY', 0, 0, CURRENT_DATE);

-- ===================================================
-- 执行完毕 · 共 5 款游戏 11 条价格记录
-- 跳过的 5 款（未发售+无预购价）：
--   归唐 / 遗忘之海 / 黑神话：钟馗 / 源初之结 / 诡秘之主
-- ===================================================
-- 验证：
-- SELECT g.title, p.platform, p.store, p.current_price, p.currency
-- FROM games g JOIN game_prices p ON p.game_id = g.id
-- ORDER BY g.hype_score DESC, p.current_price;
