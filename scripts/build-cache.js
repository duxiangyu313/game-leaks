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
        gameId: l.id,
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
    const [{ data: hotLeaks }, { data: hotArticles }, { data: events }] =
      await Promise.all([
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
      ...(hotLeaks || []).map((l) => ({
        type: "leak",
        ...l,
        heat: (l.view_count || 0) * 0.7 + 50,
      })),
      ...(hotArticles || []).map((a) => ({
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

    cache["stats"] = {
      games: gamesCount || 0,
      leaks: leaksCount || 0,
      members: membersCount || 0,
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
