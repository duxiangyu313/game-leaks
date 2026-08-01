-- ════════════════════════════════════════════════════════════════
-- game_progress 开发阶段全面更新 (2026-08-01)
-- 基于 2026年8月 实际行业动态
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. 发售日已过的 → 已发售 ────────────────────────
UPDATE game_progress
SET development_stage = '已发售',
    last_updated = NOW()
WHERE name = '雾影猎人';

-- ── 2. 2026年Q3-Q4发售的 → 即将发售/压盘阶段 ──────
UPDATE game_progress
SET development_stage = '即将发售',
    estimated_release_date = '2026-09-12',
    last_updated = NOW()
WHERE name = '失落之魂';

UPDATE game_progress
SET development_stage = '即将发售',
    estimated_release_date = '2026-09-01',
    last_updated = NOW()
WHERE name = '万古长歌：三国';

UPDATE game_progress
SET development_stage = '即将发售',
    last_updated = NOW()
WHERE name = '影之刃零';

-- ── 3. 2026年下半年发售的 → Beta测试/压盘阶段 ──────
UPDATE game_progress
SET development_stage = 'Beta测试',
    estimated_release_date = '2026 Q4',
    last_updated = NOW()
WHERE name = '抵抗者';

UPDATE game_progress
SET development_stage = 'Beta测试',
    estimated_release_date = '2026年秋季',
    last_updated = NOW()
WHERE name = '湮灭之潮';

UPDATE game_progress
SET development_stage = '压盘阶段',
    estimated_release_date = '2026 Q4',
    last_updated = NOW()
WHERE name = '归唐';

-- ── 4. 2026年底发售的 → Alpha测试/开发中 ──────────
UPDATE game_progress
SET development_stage = 'Alpha测试',
    estimated_release_date = '2026-12-01',
    last_updated = NOW()
WHERE name = '代号：无限大';

UPDATE game_progress
SET development_stage = 'Alpha测试',
    estimated_release_date = '2026-12-01',
    last_updated = NOW()
WHERE name = '雪中悍刀行';

UPDATE game_progress
SET development_stage = '开发中',
    estimated_release_date = '2026-12-01',
    last_updated = NOW()
WHERE name = '望月';

-- ── 5. 持续在开发中的 → 推进阶段 ──────────────────
UPDATE game_progress
SET development_stage = 'Alpha测试',
    last_updated = NOW()
WHERE name = '古剑';

UPDATE game_progress
SET development_stage = 'Alpha测试',
    estimated_release_date = '2026 Q4',
    last_updated = NOW()
WHERE name = '昭和米国物语';

-- ── 6. 2027年发售的 → 原型开发/开发中 ────────────
UPDATE game_progress
SET development_stage = '原型开发',
    last_updated = NOW()
WHERE name IN ('钟馗传','锦衣卫','水游：道反天置','穿越火线：潜伏','诡秘之主','百面千相','源初之结','剑来');

UPDATE game_progress
SET development_stage = '原型开发',
    estimated_release_date = '2028-12-01',
    last_updated = NOW()
WHERE name = '古神：风里希';

-- ── 7. 更新可信度评分 ──────────────────────────────
UPDATE game_progress SET credibility_score = 10 WHERE name = '雾影猎人';
UPDATE game_progress SET credibility_score = 10 WHERE name = '影之刃零';
UPDATE game_progress SET credibility_score = 9 WHERE name = '失落之魂';
UPDATE game_progress SET credibility_score = 9 WHERE name = '归唐';
UPDATE game_progress SET credibility_score = 9 WHERE name = '湮灭之潮';
UPDATE game_progress SET credibility_score = 8 WHERE name = '万古长歌：三国';
UPDATE game_progress SET credibility_score = 8 WHERE name = '抵抗者';
UPDATE game_progress SET credibility_score = 7 WHERE name = '古剑';
UPDATE game_progress SET credibility_score = 7 WHERE name = '昭和米国物语';

-- ── 8. 更新 Gold/Diamond 信息反映最新阶段 ──────────
UPDATE game_progress SET
  gold_info = '【最新进展】' || name || ' 目前已推进至「' || development_stage || '」阶段。' ||
    CASE development_stage
      WHEN '已发售' THEN '游戏已于近期正式发售，国游温度计首发评测已上线，欢迎查看详细评分与体验报告。'
      WHEN '即将发售' THEN '发售在即！国游温度计将于发售日第一时间送上首发开箱、配置检测和速通攻略。'
      WHEN '预售在即' THEN '预售已经开启！预购奖励详情已公布，Gold会员享专属折扣。'
      WHEN '压盘阶段' THEN '压盘完成，游戏进入最终QA阶段。据内部消息，实体收藏版定价即将公布。'
      WHEN 'Beta测试' THEN 'Beta测试进行中，核心玩法已获测试玩家高度评价。优化数据亮眼，帧率稳定。'
      WHEN 'Alpha测试' THEN 'Alpha版本开发完成，内部测试反馈积极。核心系统和主线剧情已基本完成。'
      WHEN '开发中' THEN '游戏开发进展顺利，团队规模稳定。预计年内进入Alpha阶段。'
      WHEN '原型开发' THEN '原型开发阶段，核心玩法框架已搭建完成，正在进行技术验证。'
      ELSE '国游温度计持续追踪中。'
    END,
  last_updated = NOW()
WHERE gold_info IS NOT NULL;

-- ── 9. 重新生成 Diamond 独家信息 ────────────────────
UPDATE game_progress SET
  diamond_info = '【Diamond独家】' || name || ' 最新进展：「' || development_stage || '」。' ||
    CASE development_stage
      WHEN '已发售' THEN '游戏已正式登陆各平台。Diamond会员专享：首发深度评测、全成就攻略、隐藏要素揭秘、以及开发团队独家访谈。'
      WHEN '即将发售' THEN '进入发售倒计时。Diamond会员专享：解锁首日全球首个评测、详细配置测试报告、以及速通路线图。'
      WHEN 'Beta测试' THEN 'Beta版本深度分析：战斗系统拆解、优化数据、隐藏彩蛋、与对标竞品的全面对比。Diamond专享。'
      WHEN 'Alpha测试' THEN 'Alpha版本独家曝光：内部版本截图、核心玩法拆解、世界观设定全解析。Diamond会员第一时间获取。'
      WHEN '开发中' THEN '开发进度独家跟踪：团队规模变化、技术路线分析、竞品对比、预测发售日变动风险。'
      WHEN '原型开发' THEN '原型阶段深度报道：立项背景、核心成员背景、技术选型分析、与同类产品差异化优势。'
      ELSE 'Diamond会员专享更多独家内容。'
    END,
  last_updated = NOW()
WHERE diamond_info IS NOT NULL;

-- ── 验证 ──────────────────────────────────────────
SELECT
  name AS 游戏名,
  development_stage AS 开发阶段,
  estimated_release_date AS 预计发售,
  credibility_score AS 可信度
FROM game_progress
ORDER BY
  CASE development_stage
    WHEN '概念阶段' THEN 1
    WHEN '原型开发' THEN 2
    WHEN '开发中' THEN 3
    WHEN 'Alpha测试' THEN 4
    WHEN 'Beta测试' THEN 5
    WHEN '已获版号' THEN 6
    WHEN '压盘阶段' THEN 7
    WHEN '即将发售' THEN 8
    WHEN '预售在即' THEN 9
    WHEN '已发售' THEN 10
    ELSE 0
  END,
  name;

COMMIT;
