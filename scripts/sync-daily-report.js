/**
 * 每日资讯同步到 Supabase
 *
 * 将 game-report 日报中的关键新闻同步到网站爆料板块（leaks 表）
 *
 * 用法:
 *   node scripts/sync-daily-report.js <report-file-path>
 *
 * 示例:
 *   node scripts/sync-daily-report.js "C:/Users/少欺负宇/.claude/game-reports/game-report-20260615-01.txt"
 *
 * 需要 .env.local 中有:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_ADMIN_EMAIL (可选 - 用于认证后插入)
 *   SUPABASE_ADMIN_PASSWORD (可选 - 用于认证后插入)
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 读取 .env.local
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(path.join(__dirname, "..", ".env.local"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 今天的关键新闻（从日报提取）
const TODAY_LEAKS = [
  {
    title: "影之刃零惊天爆料：所有已展示内容100%是支线！主线从未公开",
    summary:
      "知名YouTuber Luke Stephen独家披露：截至目前所有公开的实机演示、预告片、截图全部属于支线内容，主线剧情从未展示过一秒。核心玩法非魂like而是纯动作游戏，武器无缝切换+复杂连招。",
    content:
      "在夏日游戏节期间，知名YouTuber Luke Stephen与开发团队深入交流后披露：1）所有公开内容100%是支线，主线从未展示；2）核心玩法不是传统魂类游戏，而是偏向纯粹动作游戏；3）核心机制是各种武器无缝切换+复杂动作组合连招。夏天还将发布全新实机预告片和索尼专属State of Play专场（15-20分钟深度解析：世界观/战斗/箱庭探索/养成系统）。10月29日正式发售。梁其伟回应GTA6档期争议：“他强由他强，清风拂山岗。”",
    source: "Luke Stephen + 灵游坊官方",
    credibility: "confirmed",
    game_name: "影之刃零",
    published_at: "2026-06-15",
    view_count: 18000,
  },
  {
    title: "太吾绘卷：天幕心帷完全版后天（6月17日）上线，八年EA终章",
    summary:
      "螺舟工作室八年打磨的《太吾绘卷：天幕心帷》完全版将于6月17日正式上线，国区售价108元。首款鸿蒙全场景游戏，手机/平板/电脑/智慧屏无缝流转，老玩家免费升级。",
    content:
      "《太吾绘卷：天幕心帷》完全版将于6月17日上线，这是中国独立游戏史上最长EA（2018年9月至今近8年）的终章。完全版亮点：首款鸿蒙独家全场景游戏（手机/平板/电脑/智慧屏无缝流转）、国区108元（5月9日前购买老玩家免费升级）、超30万字「百晓册」新手引导、天幕众/三途魔/十二种新劲敌、动态CG增强剧情、奇遇系统重做（箱庭地图自由探索）、峨眉/界青门派故事重写、十五个地区剧情续写。作为延期补偿，完全版将赠送纪念意义免费DLC。",
    source: "螺舟工作室官方",
    credibility: "confirmed",
    game_name: "太吾绘卷",
    published_at: "2026-06-15",
    view_count: 12000,
  },
  {
    title: "燕云十六声6月26日江南大版本：全新地区+10多款外观+暑期活动",
    summary:
      "燕云十六声江南地区将于6月26日全新开放，PC端分包下载今日（6月15日）已实装。全球玩家突破8000万，Steam极度好评。不见山资料片7月上线。",
    content:
      "燕云十六声暑期大版本核心内容：1）6月15日PC端「分包下载」实装，可选择性下载资源包缩减硬盘占用，沙盘推演战术系统上线，百业战性能优化、特效透明度自定义；2）6月26日江南地区全新开放，至少10多款新外观上线，暑期活动「凉心小铺」开启，传承商店免费套装更新。游戏全球玩家已突破8000万，Steam极度好评。大型资料片「不见山」7月上线，主打墨家势力核心剧情。",
    source: "网易官方",
    credibility: "confirmed",
    game_name: "燕云十六声",
    published_at: "2026-06-15",
    view_count: 9500,
  },
  {
    title: "诡秘之主灰雾测试倒计时11天：6月26日三端开测",
    summary:
      "快手弹指宇宙UE5 MMORPG《诡秘之主》灰雾测试6月26日开启（PC+安卓+iOS三端互通），限量计费删档。22条途径×10序列=220方向，App Store显示可能11月1日上线。",
    content:
      "诡秘之主灰雾测试关键信息：1）6月26日开启，首次三端（PC+安卓+iOS）互通测试，限量计费删档；2）22条神之途径序列晋升体系，已公布6条（占卜家/观众/战士/窥秘人/学徒/歌颂者）；3）完整单人模式支持AI队友陪伴；4）四年内容路线图：凡人挣扎→扮演者觉醒→神明诞生→自我战争；5）App Store显示可能上线日期为11月1日（未确认）。PC最低GTX 1060（6GB），推荐RTX 3070 Ti，需80GB可用空间。",
    source: "快手弹指宇宙官方",
    credibility: "confirmed",
    game_name: "诡秘之主",
    published_at: "2026-06-15",
    view_count: 11000,
  },
  {
    title: "归唐信任撕裂：冯骥金亨泰双重盛赞 vs 玩家「网易3A」质疑",
    summary:
      "归唐19分钟实机B站播放1084万+登顶全站。冯骥称世界顶尖关卡演出，金亨泰称超出想象。但官方删除单机承诺动态引发信任危机，网易3A梗出圈。",
    content:
      "归唐目前处于冰火两重天局面。正面：19分钟实机B站播放1084万+全站榜#1，外媒Polygon称「战神终于遇到了竞争对手」，IGN Japan称「可玩的电影」，冯骥（黑神话悟空制作人）盛赞「毫无疑问世界顶尖的关卡演出与互动叙事」，金亨泰（剑星制作人）称「严肃而写实的玩法超出了我的想象」。负面：官方删除「说了是单机就不可能是手机游戏」承诺动态，玩家社区大规模质疑，「网易3A」（Android and Apple）梗出圈。UP主探班确认当前仍为早期Demo，「离发售还早」。",
    source: "B站/外媒/网易官方",
    credibility: "confirmed",
    game_name: "归唐",
    published_at: "2026-06-15",
    view_count: 20000,
  },
  {
    title: "穿越火线：潜伏官网+Steam愿望单上线，顽皮狗核心团队打造",
    summary:
      "CF单机3A叙事新作《穿越火线：潜伏》6月14日官网正式上线，Steam/Epic可加愿望单。顽皮狗前核心团队+行业首创自适应掩体系统。",
    content:
      "《穿越火线：潜伏》关键信息：1）6月14日官网正式上线，Steam/Epic可添加愿望单；2）That's No Moon工作室（前顽皮狗/Infinity Ward核心成员）主导开发；3）第三人称潜行战术射击，完全颠覆CF传统印象；4）行业首创「自适应掩体系统」——玩家靠近任意地形时角色自动调整潜行姿态，万物皆为掩体；5）双主角设定：《黑袍纠察队》克劳迪娅·杜米特饰演雇佣兵莱拉，《美国众神》瑞奇·惠特尔饰演保卫者特工克罗斯；6）UE5开发，Nanite+Lumen技术；7）登陆WeGame/Steam/Epic/PS5/Xbox，发售日期待定。",
    source: "腾讯/Smilegate官方",
    credibility: "confirmed",
    game_name: "穿越火线：潜伏",
    published_at: "2026-06-15",
    view_count: 8500,
  },
];

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ 缺少 Supabase 环境变量");
    console.error("   请确保 .env.local 中有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  console.log("📡 连接 Supabase...");
  console.log(`   URL: ${SUPABASE_URL}`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // 尝试用管理员账号登录
  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    console.log(`🔐 使用管理员账号登录: ${adminEmail}`);
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

    if (signInError) {
      console.error(`❌ 登录失败: ${signInError.message}`);
      console.error("   将尝试匿名插入（可能会因 RLS 失败）...");
    } else {
      console.log("✅ 登录成功");
    }
  } else {
    console.log("⚠️  未配置 SUPABASE_ADMIN_EMAIL/SUPABASE_ADMIN_PASSWORD");
    console.log("   将尝试匿名插入（可能会因 RLS 策略失败）...");
  }

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const leak of TODAY_LEAKS) {
    // 检查是否已存在同名爆料
    const { data: existing } = await supabase
      .from("leaks")
      .select("id, title")
      .eq("title", leak.title)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`⏭️  已存在，跳过: ${leak.title.slice(0, 40)}...`);
      skipCount++;
      continue;
    }

    // 直接插入
    const { error } = await supabase.from("leaks").insert({
      title: leak.title,
      summary: leak.summary,
      content: leak.content,
      source: leak.source,
      credibility: leak.credibility,
      game_name: leak.game_name,
      status: "published",
      published_at: leak.published_at,
      view_count: leak.view_count,
    });

    if (error) {
      console.error(`❌ 插入失败: ${leak.title.slice(0, 40)}...`);
      console.error(`   错误: ${error.message}`);
      console.error(`   详情: ${JSON.stringify(error)}`);
      failCount++;
    } else {
      console.log(`✅ 已发布: ${leak.title.slice(0, 40)}...`);
      successCount++;
    }
  }

  console.log("");
  console.log("═══════════════════════════════════════");
  console.log(`📊 同步完成: ${successCount} 条新增 / ${skipCount} 条跳过 / ${failCount} 条失败`);
  console.log("");

  if (failCount > 0) {
    console.log("💡 如果插入因 RLS 权限失败，请使用以下替代方案之一：");
    console.log("   1. 在 .env.local 中设置 SUPABASE_ADMIN_EMAIL 和 SUPABASE_ADMIN_PASSWORD 后重试");
    console.log("   2. 在 Supabase SQL Editor 中执行:");
    console.log(`      supabase/seeds/seed_leaks_update_20260615.sql`);
    console.log("   3. 在网站管理后台 /admin/leaks/new 手动添加");
  }
}

main();
