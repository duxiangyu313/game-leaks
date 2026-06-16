-- ═══════════════════════════════════════════
-- 国游爆料 · 每日资讯同步 | 2026-06-15
-- 来源: 国产3A游戏资讯日报 game-report-20260615-01
-- ═══════════════════════════════════════════

-- ============================================
-- 一、免费爆料（6条）
-- ============================================

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '影之刃零惊天爆料：所有已展示内容100%是支线！主线从未公开',
       '知名YouTuber Luke Stephen独家披露：截至目前所有公开的实机演示、预告片、截图全部属于支线内容，主线剧情从未展示过一秒。核心玩法非魂like而是纯动作游戏。',
       '在夏日游戏节期间，知名YouTuber Luke Stephen与开发团队深入交流后披露：1）所有公开内容100%是支线，主线从未展示；2）核心玩法不是传统魂类游戏，而是偏向纯粹动作游戏；3）核心机制是各种武器无缝切换+复杂动作组合连招。夏天还将发布全新实机预告片和索尼专属State of Play专场（15-20分钟深度解析）。10月29日正式发售。',
       'Luke Stephen + 灵游坊', 'confirmed', '影之刃零', 'published', '2026-06-15', 18000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%支线%主线%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '太吾绘卷：天幕心帷完全版后天（6月17日）上线，八年EA终章',
       '螺舟工作室八年打磨的《太吾绘卷：天幕心帷》完全版将于6月17日正式上线，国区售价108元。首款鸿蒙全场景游戏，老玩家免费升级。',
       '《太吾绘卷：天幕心帷》完全版将于6月17日上线，这是中国独立游戏史上最长EA（2018年9月至今近8年）的终章。完全版亮点：首款鸿蒙独家全场景游戏（手机/平板/电脑/智慧屏无缝流转）、国区108元（5月9日前购买老玩家免费升级）、超30万字"百晓册"新手引导、天幕众/三途魔/十二种新劲敌、动态CG增强剧情、奇遇系统重做（箱庭地图自由探索）、峨眉/界青门派故事重写、十五个地区剧情续写。作为补偿，完全版将赠送纪念意义免费DLC。',
       '螺舟工作室官方', 'confirmed', '太吾绘卷', 'published', '2026-06-15', 12000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%太吾绘卷%完全版%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '燕云十六声6月26日江南大版本：全新地区+10多款外观+暑期活动',
       '燕云十六声江南地区将于6月26日全新开放，PC端分包下载今日（6月15日）已实装。全球玩家突破8000万。',
       '燕云十六声暑期大版本核心内容：1）6月15日PC端「分包下载」实装，可选择性下载资源包缩减硬盘占用，沙盘推演战术系统上线，百业战性能优化、特效透明度自定义；2）6月26日江南地区全新开放，至少10多款新外观上线，暑期活动「凉心小铺」开启，传承商店免费套装更新。游戏全球玩家已突破8000万，Steam极度好评。大型资料片「不见山」7月上线，主打墨家势力核心剧情。',
       '网易官方', 'confirmed', '燕云十六声', 'published', '2026-06-15', 9500
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%燕云十六声%江南%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '诡秘之主灰雾测试倒计时11天：6月26日三端开测',
       '快手弹指宇宙UE5 MMORPG《诡秘之主》灰雾测试6月26日开启（PC+安卓+iOS三端互通），限量计费删档。App Store显示可能11月1日正式上线。',
       '诡秘之主灰雾测试关键信息：1）6月26日开启，首次三端（PC+安卓+iOS）互通测试，限量计费删档；2）22条神之途径序列晋升体系，已公布6条（占卜家/观众/战士/窥秘人/学徒/歌颂者）；3）完整单人模式支持AI队友陪伴；4）四年内容路线图：凡人挣扎→扮演者觉醒→神明诞生→自我战争；5）App Store显示可能上线日期为11月1日（未确认）。PC最低GTX 1060，推荐RTX 3070 Ti，需80GB可用空间。',
       '快手弹指宇宙官方', 'confirmed', '诡秘之主', 'published', '2026-06-15', 11000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%诡秘之主%灰雾测试%倒计时%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '归唐信任撕裂：冯骥金亨泰双重盛赞 vs 玩家"网易3A"质疑',
       '归唐19分钟实机B站播放1084万+登顶全站。冯骥称"世界顶尖关卡演出"，金亨泰称"超出想象"。但官方删除单机承诺动态引发信任危机。',
       '归唐目前处于"冰火两重天"局面。正面：19分钟实机B站播放1084万+全站榜#1，外媒Polygon称"战神遇到了竞争对手"，IGN Japan称"可玩的电影"，冯骥（黑神话制作人）盛赞"毫无疑问世界顶尖的关卡演出与互动叙事"，金亨泰（剑星制作人）称"严肃写实的玩法超出想象"。负面：官方删除"说了是单机就不可能是手机游戏"承诺动态，玩家社区大规模质疑，"网易3A"（Android and Apple）梗出圈。UP主探班确认当前仍为早期Demo，"离发售还早"。',
       'B站/外媒/网易官方', 'confirmed', '归唐', 'published', '2026-06-15', 20000
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%归唐%信任%');

INSERT INTO leaks (title, summary, content, source, credibility, game_name, status, published_at, view_count)
SELECT '穿越火线：潜伏官网+Steam愿望单上线，顽皮狗核心团队打造',
       'CF单机3A叙事新作《穿越火线：潜伏》6月14日官网正式上线，Steam/Epic可加愿望单。顽皮狗前核心团队+Smilegate+腾讯K1联合开发。',
       '《穿越火线：潜伏》关键信息：1）6月14日官网正式上线，Steam/Epic可添加愿望单；2）That''s No Moon工作室（前顽皮狗/Infinity Ward核心成员）主导开发；3）第三人称潜行战术射击，完全颠覆CF传统印象；4）行业首创"自适应掩体系统"——玩家靠近任意地形时角色自动调整潜行姿态；5）双主角设定：《黑袍纠察队》克劳迪娅·杜米特饰演雇佣兵莱拉，《美国众神》瑞奇·惠特尔饰演保卫者特工克罗斯；6）UE5开发，Nanite+Lumen技术；7）登陆WeGame/Steam/Epic/PS5/Xbox，发售日期待定。',
       '腾讯/Smilegate官方', 'confirmed', '穿越火线：潜伏', 'published', '2026-06-15', 8500
WHERE NOT EXISTS (SELECT 1 FROM leaks WHERE title LIKE '%穿越火线%潜伏%官网%');

-- ============================================
-- 二、每日资讯汇总（深度文章形式，供首页展示）
-- ============================================

-- 如 articles 表有 daily-report 类别，可添加日报汇总
-- INSERT INTO articles (title, summary, content, category, tier, status, published_at)
-- VALUES (...);

-- ============================================
-- 验证
-- ============================================
-- SELECT id, title, credibility, game_name, published_at FROM leaks WHERE published_at = '2026-06-15' ORDER BY id DESC;
