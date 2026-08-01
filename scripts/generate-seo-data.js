/**
 * SEO 数据预构建脚本
 *
 * 在 prebuild 阶段运行，从 Supabase 拉取文章和游戏数据，
 * 生成 SEO 友好的 JSON 文件，供客户端页面在 hydration 前使用。
 *
 * 功能:
 *  1. 统一文章分类名 (中文分类 → 英文标准分类)
 *  2. 回填 word_count 和 read_time
 *  3. 生成 SEO 数据 (title, description, keywords, JSON-LD)
 *  4. 写入 public/seo-data.json
 *
 * 用法: node scripts/generate-seo-data.js
 */

const fs = require("fs");
const path = require("path");

// 手动读取 .env.local
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
  console.error("❌ 缺少 Supabase 环境变量，跳过 SEO 数据生成");
  process.exit(0);
}

const CATEGORY_MAP = {
  "深度解析": "analysis",
  "分析": "analysis",
  "评测": "review",
  "新闻": "news",
  "爆料": "leak",
  "专访": "interview",
  "前哨": "preview",
  "攻略": "guide",
  "对比": "compare",
};

function normalizeCategory(cat) {
  if (!cat) return "analysis";
  if (CATEGORY_MAP[cat]) return CATEGORY_MAP[cat];
  const valid = ["analysis", "review", "news", "leak", "preview", "interview", "guide", "compare", "video", "forum"];
  if (valid.includes(cat)) return cat;
  return "analysis";
}

function countWords(text) {
  if (!text) return 0;
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  return chinese + english + numbers;
}

function estimateReadTime(wordCount) {
  const WPM = 300;
  const minutes = Math.max(1, Math.round(wordCount / WPM));
  return minutes;
}

function buildArticleDesc(article) {
  if (article.excerpt && article.excerpt.length >= 30) return article.excerpt;
  const title = article.title || "";
  const tags = (article.tags || []).slice(0, 3).join("、");
  const categoryMap = {
    analysis: "深度分析",
    review: "游戏评测",
    news: "游戏资讯",
    leak: "独家爆料",
    preview: "游戏前瞻",
    interview: "独家专访",
    guide: "实用攻略",
  };
  const cat = categoryMap[normalizeCategory(article.category)] || "文章";
  const parts = [`国游爆料${cat}`, title];
  if (tags) parts.push(tags);
  parts.push("更多国产3A游戏内容");
  return parts.join(" — ").slice(0, 160);
}

function buildArticleKeywords(article) {
  const tags = article.tags || [];
  const titleWords = (article.title || "").split(/[，。、：！？\s]+/).filter(w => w.length >= 2);
  const all = [...tags, ...titleWords].filter(Boolean);
  return [...new Set(all)].slice(0, 8).join(",");
}

function buildGameDesc(game) {
  if (game.description && game.description.length >= 30) return game.description;
  const parts = [
    game.title,
    game.developer ? `${game.developer}开发` : null,
    game.status === "released" ? "已发售" : game.release_date ? `预计${game.release_date}发售` : "开发中",
    game.hype_score ? `玩家期待度${game.hype_score}分` : null,
  ].filter(Boolean);
  return parts.join("，").slice(0, 160);
}

async function main() {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const seoData = {
    articles: {},
    games: {},
    generatedAt: new Date().toISOString(),
  };

  try {
    // ── 拉取所有文章 ──
    const { data: articles, error: aErr } = await supabase
      .from("articles")
      .select("id, title, content, excerpt, category, tags, status, word_count, read_time, created_at, cover_image, author_name, game_name")
      .eq("status", "published");

    if (aErr) {
      console.error("❌ 拉取文章失败:", aErr.message);
    } else if (articles?.length) {
      const updates = [];

      for (const a of articles) {
        const normalizedCategory = normalizeCategory(a.category);
        const wordCount = a.word_count || countWords(a.content);
        const readTime = a.read_time || estimateReadTime(wordCount);
        const excerpt = a.excerpt || (a.content ? a.content.slice(0, 120).replace(/[#*>\-!]/g, "").trim() : "");

        // 收集需要更新的字段
        const patches = {};
        if (normalizedCategory !== a.category) patches.category = normalizedCategory;
        if (!a.word_count) patches.word_count = wordCount;
        if (!a.read_time) patches.read_time = readTime;
        if (!a.excerpt && excerpt) patches.excerpt = excerpt;

        if (Object.keys(patches).length > 0) {
          updates.push({ id: a.id, patches });
        }

        seoData.articles[a.id] = {
          id: a.id,
          title: a.title,
          description: buildArticleDesc({ ...a, category: normalizedCategory, excerpt }),
          keywords: buildArticleKeywords({ ...a, category: normalizedCategory }),
          category: normalizedCategory,
          wordCount,
          readTime,
          excerpt,
          coverImage: a.cover_image,
          publishedAt: a.created_at,
          authorName: a.author_name || "国游爆料",
          gameName: a.game_name,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: a.title,
            description: buildArticleDesc({ ...a, category: normalizedCategory, excerpt }),
            datePublished: a.created_at,
            dateModified: a.created_at,
            author: { "@type": "Person", name: a.author_name || "国游爆料" },
            publisher: { "@type": "Organization", name: "国游爆料", url: "https://news.guoyouwenduji.cc" },
            url: `https://news.guoyouwenduji.cc/articles/detail/?id=${a.id}`,
            image: a.cover_image ? [a.cover_image] : undefined,
            articleSection: normalizedCategory,
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://news.guoyouwenduji.cc/articles/detail/?id=${a.id}` },
          },
        };
      }

      // 批量更新数据库
      if (updates.length > 0) {
        console.log(`📝 需要更新 ${updates.length} 篇文章的数据...`);
        for (const u of updates) {
          const { error } = await supabase.from("articles").update(u.patches).eq("id", u.id);
          if (error) console.error(`  ⚠️ 更新文章 ${u.id} 失败:`, error.message);
        }
        console.log(`  ✅ 已回填 word_count, read_time, excerpt, category`);
      }
    }

    // ── 拉取所有游戏 ──
    const { data: games, error: gErr } = await supabase
      .from("games")
      .select("id, title, description, developer, publisher, status, release_date, hype_score, rating, cover, platforms")
      .neq("status", "archived");

    if (gErr) {
      console.error("❌ 拉取游戏失败:", gErr.message);
    } else if (games?.length) {
      for (const g of games) {
        seoData.games[g.id] = {
          id: g.id,
          title: g.title,
          description: buildGameDesc(g),
          keywords: [g.title, g.developer, g.publisher].filter(Boolean).join(","),
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: g.title,
            description: buildGameDesc(g),
            url: `https://news.guoyouwenduji.cc/games/detail/?id=${g.id}`,
            image: g.cover || undefined,
            author: g.developer ? { "@type": "Organization", name: g.developer } : undefined,
            publisher: g.publisher ? { "@type": "Organization", name: g.publisher } : undefined,
            datePublished: g.release_date || undefined,
            aggregateRating: g.rating ? { "@type": "AggregateRating", ratingValue: g.rating, bestRating: 10, ratingCount: 1 } : undefined,
            gamePlatform: g.platforms || undefined,
          },
        };
      }
    }

    // ── 写入 public ──
    const outPath = path.join(__dirname, "..", "public", "seo-data.json");
    fs.writeFileSync(outPath, JSON.stringify(seoData, null, 0), "utf-8");
    console.log(`✅ SEO 数据已生成 → ${outPath}`);
    console.log(`   文章: ${Object.keys(seoData.articles).length} 篇`);
    console.log(`   游戏: ${Object.keys(seoData.games).length} 款`);
  } catch (err) {
    console.error("⚠️ SEO 数据生成失败:", err.message);
    const outPath = path.join(__dirname, "..", "public", "seo-data.json");
    fs.writeFileSync(outPath, JSON.stringify({ articles: {}, games: {}, generatedAt: new Date().toISOString() }, null, 0), "utf-8");
  }
}

main();
