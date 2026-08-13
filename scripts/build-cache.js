/**
 * 构建时首页数据缓存生成器
 *
 * 在 npm run build 之后运行，从 Supabase 拉取首页所需数据，
 * 写入 public/homepage-cache.json，让首访用户也能秒开首页。
 *
 * 用法: node scripts/build-cache.js
 * 需要 .env.local 中有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const fs = require("fs");
const path = require("path");

// 手动读取 .env.local（避免依赖 dotenv）
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
loadEnv(path.join(__dirname, "..", ".env.production"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ 缺少 Supabase 环境变量，跳过缓存生成");
  process.exit(0);
}

// 动态导入 supabase-js（CommonJS 兼容）
async function main() {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("📡 从 Supabase 拉取首页数据...");

  const cache = {};

  try {
    // ── Hero 走马灯: 最新4条爆料 ──
    const { data: heroLeaks } = await supabase
      .from("leaks")
      .select("id, title, summary, game_name, credibility, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4);
    if (heroLeaks?.length) {
      cache["hero"] = heroLeaks.map((l) => ({
        id: l.id,
        title: l.title,
        subtitle:
          (l.summary || "").slice(0, 80) +
          ((l.summary || "").length > 80 ? "..." : ""),
        link: "/leaks/",
        tag:
          l.credibility === "confirmed"
            ? "✅ 已确认"
            : l.credibility === "likely"
            ? "🔍 高可信"
            : "📢 传闻",
      }));
    }

    // ── 最新爆料: 最新4条 ──
    const { data: leaks } = await supabase
      .from("leaks")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4);
    if (leaks?.length) {
      cache["leaks"] = leaks.map((l) => ({
        ...l,
        gameId: l.game_id,
        publishedAt: l.published_at,
        viewCount: l.view_count,
        commentCount: l.comment_count || 0,
        gameName: l.game_name,
      }));
    }

    // ── 热门游戏: hype_score 排序 ──
    const { data: hotGames } = await supabase
      .from("games")
      .select("*")
      .neq("status", "delayed")
      .order("hype_score", { ascending: false })
      .limit(4);
    if (hotGames?.length) {
      cache["hotGames"] = hotGames.map((g, i) => ({
        ...g,
        rank: i + 1,
        hypeScore: g.hype_score,
        releaseDate: g.release_date,
      }));
    }

    // ── 即将发售: 按发售日排序 ──
    const { data: upcoming } = await supabase
      .from("games")
      .select("*")
      .in("status", ["announced", "in-dev", "beta"])
      .order("release_date", { ascending: true })
      .limit(4);
    if (upcoming?.length) {
      cache["upcoming"] = upcoming.map((g) => ({
        ...g,
        releaseDate: g.release_date,
        hypeScore: g.hype_score,
      }));
    }

    // ── 视频: category=video ──
    const { data: videos } = await supabase
      .from("articles")
      .select("*")
      .eq("category", "video")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (videos?.length) cache["videos"] = videos;

    // ── 今日热点: 综合查询 ──
    // 编辑精选置顶（高热度爆料/文章），与前端 HotTopics 保持一致
    // 8-8 新增：近两日高热度内容（5爆料+3文章）置顶前排
    // 8-6：CJ2026 三篇首发 + 其他高热度保留为次级置顶
    const EDITOR_PICKS = [
      // ── 8-13 新增：当日热点（最前排） ──
      { id: "94798a7e-54f7-4eb4-b82a-0d3a28f1a384", type: "leak" },     // 影之刃零8/18索尼专属State of Play(国产首获非第一方专场)
      { id: "11c566ae-bbf2-4c68-87ef-52e6462642a3", type: "article" },  // 影之刃零SOP深度解析（深度解析）
      { id: "5ddb2daa-ed5e-4244-81bb-a7ca9a75bb54", type: "leak" },     // 黑神话悟空Xbox国行版上线
      { id: "bab79c30-dd48-4565-bd73-0b1aaebf7a5d", type: "leak" },     // 莉莉丝生存日志Steam发售(部分AI美术)
      { id: "312157f0-1912-48c7-8b9e-5e203726d4a7", type: "article" },  // AI落地与试错双轨（行业观察）
      { id: "0086141f-7e83-46d0-a788-f756a09eb66c", type: "leak" },     // 诡秘之主8/21全平台公测(4年10亿624人)
      { id: "a2594ba5-f3fa-4ba7-96b5-1461d27e302f", type: "article" },  // 诡秘之主公测深度解析（深度解析）
      { id: "dc5430dc-bef4-434f-a7f1-ab90e3052eb2", type: "leak" },     // 王者荣耀匹配新增负面信誉维度
      { id: "17f72534-a9ae-4462-a5c6-8eb12db52aef", type: "leak" },     // 三国观沧海8/13公测(弹指宇宙水墨战棋)
      // ── 8-12 新增：当日热点（最前排） ──
      { id: "df57a51a-f6bb-4306-9bfc-058713a5baf7", type: "leak" },     // 影之刃零预售登顶Steam全球榜(268/328元+甄子丹)
      { id: "bb93bd00-cffd-4b31-a760-d53139d8d5a7", type: "article" },  // 影之刃零新实机全解析（深度解析）
      { id: "75249379-cdfc-4830-87ce-2e8286337d50", type: "leak" },     // 米哈游BSide AI陪伴28天关停
      { id: "a350f213-d5f1-42b0-a29e-f28f98ccba62", type: "article" },  // 米哈游BSide关停·AI试错税（深度解析）
      { id: "e51dee12-8a8f-4577-b466-1852e7d18e06", type: "leak" },     // 盗墓笔记：启程全平台公测(预约破500万)
      { id: "dd506525-621f-4593-8ac0-a01f5411f5c4", type: "leak" },     // 王者荣耀世界S1延长优化
      { id: "59ce61cf-4c4b-4585-a876-ff81428fe6d5", type: "leak" },     // 鸣潮3.6·御剑飞行+七弦琴(8/20)
      { id: "2261e211-00f4-436e-bd94-50690bf0cc94", type: "article" },  // 盗墓笔记公测×鸣潮3.6双轨（行业观察）
      { id: "a612073b-c375-4a63-9526-6eba0396e9e8", type: "leak" },     // 黑神话悟空两周年·全平台七折
      // ── 8-11 新增：当日热点（最前排） ──
      { id: "de65f118-54b9-4254-acd9-2f08c0f0c25f", type: "leak" },     // 杨奇：钟馗远离AIGC
      { id: "9b284e29-d74a-4010-85da-4a75ac3fe9a8", type: "article" },  // 杨奇AIGC宣言（深度解析）
      { id: "b16c1931-9c33-4f63-8f0f-313530eb0bfc", type: "leak" },     // 影之刃零8/12预售+WeGame 20万
      { id: "e7f8b0dc-41d3-4495-acee-cd8e83281302", type: "article" },  // 国产单机冰火两极（行业观察）
      { id: "e59635fb-f9ac-4bd6-a10c-2b6f083c50cb", type: "leak" },     // 工长君确认剑心雕龙被砍
      { id: "ae6c0801-acff-4d07-983c-82d3cd4df2c0", type: "article" },  // 86%企业用AI（市场观察）
      { id: "f30444b1-f2fc-4a07-93b8-ad73b06acf31", type: "leak" },     // 前王者主创魏嘉离职做声探疑云
      { id: "2f848e2a-baf3-4913-a9e5-20a263540d15", type: "leak" },     // 索尼PS5 2028终止实体光盘
      // ── 8-9 晚间补充批次：最新热点（最前排） ──
      { id: "07444018-a08d-4514-bc75-e7201ed341b5", type: "leak" },     // 原神7.0至冬国定档8/12
      { id: "03a74890-ea12-4761-ac67-cd93c91315cd", type: "article" },  // 至冬国叙事收束（行业观察）
      { id: "9e8c41e7-f143-4444-a348-58c3b91969e7", type: "leak" },     // 沙特PIF 550亿收购EA
      { id: "a68b5c93-b21a-47b4-aee4-bde3a651a0bf", type: "article" },  // 沙特EA并购（深度解析）
      { id: "e73e2496-54f9-4a6d-bd22-c3f89296c6c3", type: "leak" },     // 黑神话登CCTV9纪录片
      { id: "42453bca-445f-48f3-981a-c495298a68e9", type: "article" },  // 国产游戏出海科隆（市场观察）
      { id: "4473a95a-78d8-4e95-98d4-7152c0995aea", type: "leak" },     // 影之刃零×堡垒之夜孤狼
      { id: "dbc898fd-643e-434f-9a2d-ff03a9be853b", type: "leak" },     // 金山系变局·尘白禁区制作人离职
      // ── 8-9 新增：本周热点（最前排，优先占据今日热点前6） ──
      { id: "544e77b4-8dad-4de8-b77f-b361d7c1b10a", type: "leak" },     // 影之刃零·预售前夜+沐小葵建模
      { id: "263c5fa9-2230-4c3a-8866-7d0869bf8a3f", type: "article" },  // 8月下旬三连发（行业观察）
      { id: "50304a85-3dd0-4b44-8d4e-38fb2397ac44", type: "leak" },     // 黑神话钟馗·只是片花+音乐转向
      { id: "96eccb61-61ee-4e41-924c-9eb5068ed35f", type: "article" },  // 影之刃零·好饭不怕晚（深度解析）
      { id: "8b7c3c9d-3cc0-43bf-904c-eca73234df5a", type: "leak" },     // 腾讯×米哈游首度联动
      { id: "4bf6ddf6-e635-4a96-b5c3-7cc609f88a99", type: "article" },  // 垂类精品破圈（市场观察）
      { id: "fb60dcdf-1c08-458b-b11f-42e80af79420", type: "leak" },     // 米哈游泄密刑案
      { id: "7804aed1-4f7a-447c-8376-0b353788bb48", type: "leak" },     // 星砂岛8/18上线
      // ── 8-8 新增：近两日高热度内容 ──
      { id: "7cdfcb52-dd4c-4a77-9697-60e385eab085", type: "leak" },     // 黑神话：悟空 全平台七折
      { id: "9427ca1e-877d-40f2-8ac2-144ef88798e1", type: "leak" },     // 腾讯天美《怪物猎人：旅人》启明测试
      { id: "5e19d288-8a1f-4aa9-a633-6a33e5eb9a73", type: "leak" },     // 网易《诡影藏锋》开测预约破200万
      { id: "693a9a36-918e-427b-bbda-1903e65bb9ac", type: "article" },  // 国产单机拐点（行业观察）
      { id: "8f7cc49f-a493-4731-8d54-7c9eb31acc1d", type: "article" },  // 游戏科学"宇宙"野心（深度解析）
      { id: "ae909cf5-a272-4273-8805-700044513a85", type: "leak" },     // 索尼PS5仅数字发行
      { id: "3b1c1cff-efde-4e5e-be74-d103bcbc2804", type: "article" },  // 搜打撤VS IP怪兽（行业观察）
      { id: "78fe26e2-37de-41b8-8522-0e8a2ef983f6", type: "leak" },     // 凉屋《魂坠深境》上线
      // ── 8-6 精选：CJ2026 三篇首发 + 其他高热度（保留为次级置顶） ──
      { id: "1fa6e3be-3a45-4a24-a5bd-633e051f9d8f", type: "article" }, // CJ2026·参展阵容全收录
      { id: "801c3cb5-10d9-4841-b232-704fa82cf911", type: "article" }, // CJ2026·锦衣卫首曝
      { id: "b94a7786-d652-4d57-9098-87ded67782da", type: "article" }, // CJ2026·国产3A试玩指南
      { id: "4d79b868-4c95-4530-b430-74812c01423a", type: "leak" },
      { id: "70a0e44c-1970-4602-bb75-6e68f5916dff", type: "article" },
      { id: "d911c992-a68e-4120-8ace-7bec59fbac04", type: "leak" },
      { id: "922b88b0-34ab-4e56-a941-882fa963f3e9", type: "article" },
      { id: "74674e5a-a432-41ce-ba30-bc9065b1ad02", type: "leak" },
      { id: "5a63e2fe-ca8e-46dc-b90a-dab109d13169", type: "article" },
      { id: "15186f18-f2a0-4349-9bbb-bf8b93d200fa", type: "leak" },
    ];
    const pickLeakIds = EDITOR_PICKS.filter((p) => p.type === "leak").map((p) => p.id);
    const pickArticleIds = EDITOR_PICKS.filter((p) => p.type === "article").map((p) => p.id);
    const rank = new Map(EDITOR_PICKS.map((p, i) => [p.id, 1000000 - i]));

    const [{ data: pLeaks }, { data: pArticles }, { data: hotLeaks }, { data: hotArticles }, { data: events }] =
      await Promise.all([
        supabase.from("leaks").select("*").in("id", pickLeakIds).eq("status", "published"),
        supabase.from("articles").select("*").in("id", pickArticleIds).eq("status", "published"),
        supabase
          .from("leaks")
          .select("*")
          .eq("status", "published")
          .order("view_count", { ascending: false })
          .limit(3),
        supabase
          .from("articles")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("game_events")
          .select("*, games(title)")
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date")
          .limit(3),
      ]);

    const topics = [
      ...(pLeaks || []).map((l) => ({ type: "leak", ...l, heat: rank.get(l.id) ?? 50 })),
      ...(pArticles || []).map((a) => ({ type: "article", ...a, heat: rank.get(a.id) ?? 80 })),
      ...(hotLeaks || []).filter((l) => !rank.has(l.id)).map((l) => ({
        type: "leak",
        ...l,
        heat: (l.view_count || 0) * 0.7 + 50,
      })),
      ...(hotArticles || []).filter((a) => !rank.has(a.id)).map((a) => ({
        type: "article",
        ...a,
        heat: 80,
      })),
      ...(events || []).map((e) => ({
        type: "event",
        ...e,
        heat: 60,
        title: e.title,
        game_name: e.games?.title,
      })),
    ]
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 6);
    if (topics.length) cache["topics"] = topics;

    // ── 数据看板 ──
    const [
      { count: gamesCount },
      { count: leaksCount },
      { count: membersCount },
      siteStats,
      { data: hypeData },
      { data: ratedData },
    ] = await Promise.all([
      supabase.from("games").select("id", { count: "exact", head: true }),
      supabase
        .from("leaks")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      // Fallback: 尝试 site_stats VIEW 获取 member count
      supabase
        .from("site_stats")
        .select("total_users")
        .single(),
      supabase
        .from("games")
        .select("title,hype_score")
        .order("hype_score", { ascending: false })
        .limit(3),
      supabase
        .from("games")
        .select("title,rating")
        .not("rating", "is", null)
        .order("rating", { ascending: false })
        .limit(3),
    ]);
    // ── 玩家热议: 论坛热帖 ──
    const { data: hotPosts } = await supabase
      .from("forum_posts")
      .select("*")
      .order("reply_count", { ascending: false })
      .limit(5);
    if (hotPosts?.length) cache["hotDiscussions"] = hotPosts;

    // ── 精选评测: 已发售游戏的推荐评测 ──
    const { data: featuredReviews } = await supabase
      .from("game_reviews")
      .select("*")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(3);
    if (featuredReviews?.length) cache["featuredReviews"] = featuredReviews;

    const memberCount = membersCount || (siteStats?.total_users ?? 0);
    cache["stats"] = {
      games: gamesCount || 0,
      leaks: leaksCount || 0,
      members: memberCount,
      topHype: hypeData || [],
      topRated: ratedData || [],
    };

    // ── 写入 public ──
    const outPath = path.join(__dirname, "..", "public", "homepage-cache.json");
    fs.writeFileSync(outPath, JSON.stringify(cache), "utf-8");
    console.log(
      `✅ 首页缓存已生成 (${Object.keys(cache).length} 个键) → ${outPath}`
    );
    console.log(
      `   ${JSON.stringify(cache).length.toLocaleString()} bytes, 首访秒开`
    );
  } catch (err) {
    console.error("⚠️  部分查询失败，跳过缓存生成:", err.message);
    // 不阻塞构建 — 生成空缓存让页面 fallback 到 MOCK
    const outPath = path.join(__dirname, "..", "public", "homepage-cache.json");
    fs.writeFileSync(outPath, "{}", "utf-8");
  }
}

main();
