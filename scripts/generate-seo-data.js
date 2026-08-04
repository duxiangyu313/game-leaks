/**
 * SEO 数据生成器 — 构建时预生成所有详情页的 SEO 元数据
 *
 * 在 prebuild 阶段运行，从 Supabase 拉取所有文章/游戏/爆料，
 * 为每条记录生成 title/description/keywords/jsonLd，
 * 写入 public/seo-data.json，供 generateStaticParams + generateMetadata 使用。
 *
 * 用法: node scripts/generate-seo-data.js
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://news.guoyouwenduji.cc";

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
  console.error("❌ 缺少 Supabase 环境变量，跳过 SEO 数据生成");
  process.exit(0);
}

async function main() {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("📡 从 Supabase 拉取 SEO 数据...");

  const seo = {
    articles: {},
    games: {},
    leaks: {},
    generatedAt: new Date().toISOString(),
  };

  try {
    // ── 文章: 拉取全部 published ──
    const { data: articles, error: artErr } = await supabase
      .from("articles")
      .select("id, title, excerpt, content, category, tags, author_name, cover_image, published_at, created_at, updated_at, required_tier, game_name, game_id")
      .eq("status", "published");

    if (artErr) throw artErr;

    for (const a of articles || []) {
      const id = a.id;
      const title = a.title || "国游爆料";
      const desc = (a.excerpt || "").slice(0, 160) || title;
      const url = `${BASE_URL}/articles/${id}/`;
      const datePublished = a.published_at || a.created_at || "";
      const keywords = [
        ...(a.tags || []),
        a.category,
        a.game_name,
        "国产3A", "游戏爆料", "国游爆料",
      ].filter(Boolean).slice(0, 10).join(",");

      seo.articles[id] = {
        id,
        title: `${title} · 国游爆料`,
        description: desc,
        keywords,
        url,
        category: a.category || "analysis",
        publishedAt: datePublished,
        authorName: a.author_name || "国游爆料",
        coverImage: a.cover_image || null,
        gameName: a.game_name || null,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          description: desc,
          datePublished,
          dateModified: a.updated_at || datePublished,
          author: { "@type": "Person", name: a.author_name || "国游爆料" },
          publisher: { "@type": "Organization", name: "国游爆料", url: BASE_URL },
          url,
          image: a.cover_image ? [a.cover_image] : undefined,
          articleSection: a.category || "游戏资讯",
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        },
      };
    }
    console.log(`  ✅ 文章: ${Object.keys(seo.articles).length} 条`);

    // ── 游戏: 拉取全部 ──
    const { data: games, error: gameErr } = await supabase
      .from("games")
      .select("id, title, description, developer, publisher, release_date, rating, hype_score, platform, status, updated_at");

    if (gameErr) throw gameErr;

    for (const g of games || []) {
      const id = g.id;
      const title = g.title || "国产游戏";
      const desc = (g.description || `${title} — ${g.developer || "国产游戏"}，最新动态、评测、攻略`).slice(0, 160);
      const url = `${BASE_URL}/games/${id}/`;
      const keywords = [
        title,
        g.developer,
        g.publisher,
        g.platform,
        "国产3A", "游戏", "国游爆料",
      ].filter(Boolean).slice(0, 8).join(",");

      seo.games[id] = {
        id,
        title: `${title} · 国游爆料`,
        description: desc,
        keywords,
        url,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: title,
          url,
          description: desc,
          author: g.developer ? { "@type": "Organization", name: g.developer } : undefined,
          publisher: g.publisher ? { "@type": "Organization", name: g.publisher } : undefined,
          datePublished: g.release_date || undefined,
          aggregateRating: g.rating ? { "@type": "AggregateRating", ratingValue: g.rating, bestRating: 10, ratingCount: 1 } : undefined,
          positiveNotes: g.hype_score ? { "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, name: `期待度 ${g.hype_score}%` }] } : undefined,
          gamePlatform: g.platform ? g.platform.split(",").map(p => p.trim()) : undefined,
        },
      };
    }
    console.log(`  ✅ 游戏: ${Object.keys(seo.games).length} 条`);

    // ── 爆料: 拉取全部 published ──
    const { data: leaks, error: leakErr } = await supabase
      .from("leaks")
      .select("id, title, summary, content, game_name, game_id, credibility, source, published_at, created_at, updated_at")
      .eq("status", "published");

    if (leakErr) throw leakErr;

    for (const l of leaks || []) {
      const id = l.id;
      const title = l.title || "游戏爆料";
      const desc = (l.summary || "").slice(0, 160) || title;
      const url = `${BASE_URL}/leaks/${id}/`;
      const datePublished = l.published_at || l.created_at || "";
      const keywords = [
        title,
        l.game_name,
        l.credibility === "confirmed" ? "已确认" : l.credibility === "likely" ? "高可信" : "传闻",
        "游戏爆料", "国产3A", "国游爆料",
      ].filter(Boolean).slice(0, 8).join(",");

      seo.leaks[id] = {
        id,
        title: `${title} · 国游爆料`,
        description: desc,
        keywords,
        url,
        gameName: l.game_name || null,
        credibility: l.credibility || "rumor",
        publishedAt: datePublished,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          description: desc,
          datePublished,
          dateModified: l.updated_at || datePublished,
          author: { "@type": "Organization", name: l.source || "国游爆料" },
          publisher: { "@type": "Organization", name: "国游爆料", url: BASE_URL },
          url,
          articleSection: l.game_name || "游戏资讯",
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        },
      };
    }
    console.log(`  ✅ 爆料: ${Object.keys(seo.leaks).length} 条`);

    // ── 写入 public ──
    const outPath = path.join(__dirname, "..", "public", "seo-data.json");
    fs.writeFileSync(outPath, JSON.stringify(seo), "utf-8");
    console.log(`✅ SEO 数据已生成 → ${outPath}`);
    console.log(`   ${JSON.stringify(seo).length.toLocaleString()} bytes`);
    console.log(`   总计: ${Object.keys(seo.articles).length} 文章 + ${Object.keys(seo.games).length} 游戏 + ${Object.keys(seo.leaks).length} 爆料`);
  } catch (err) {
    console.error("⚠️  SEO 数据生成失败:", err.message);
    const outPath = path.join(__dirname, "..", "public", "seo-data.json");
    fs.writeFileSync(outPath, JSON.stringify(seo), "utf-8");
  }
}

main();