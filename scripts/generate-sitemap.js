/**
 * 生成 sitemap.xml — 扫描 build_out + Supabase 动态内容
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://news.guoyouwenduji.cc";
const OUT_DIR = process.argv[2] || "build_out";

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

// 所有已知静态页面
const PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/games/", priority: "0.9", changefreq: "daily" },
  { url: "/leaks/", priority: "0.9", changefreq: "daily" },
  { url: "/analysis/", priority: "0.8", changefreq: "daily" },
  { url: "/forum/", priority: "0.7", changefreq: "weekly" },
  { url: "/member/", priority: "0.8", changefreq: "weekly" },
  { url: "/submit/", priority: "0.6", changefreq: "weekly" },
  { url: "/claim/", priority: "0.6", changefreq: "weekly" },
  { url: "/auth/", priority: "0.3", changefreq: "monthly" },
  { url: "/about/", priority: "0.4", changefreq: "monthly" },
  { url: "/contact/", priority: "0.3", changefreq: "monthly" },
  { url: "/cj2026/", priority: "0.9", changefreq: "daily" },
  { url: "/privacy/", priority: "0.2", changefreq: "yearly" },
  { url: "/terms/", priority: "0.2", changefreq: "yearly" },
];

// 不应出现在 sitemap 中的路径前缀
const EXCLUDED_PREFIXES = ["/admin/", "/auth/", "/account/", "/member/", "/404", "/_not-found/"];

function isExcluded(url) {
  return EXCLUDED_PREFIXES.some(p => url.startsWith(p));
}

function findPages(dir, base = "") {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    const relative = base + "/" + entry.name;
    if (entry.isDirectory()) {
      results.push(...findPages(fullPath, relative));
    } else if (entry.name === "index.html") {
      // 修复: 不再产生双斜杠 (旧: base + "/" + (base ? "/" : "") 会生成 /about//)
      const url = base ? base + "/" : "/";
      if (isExcluded(url)) continue;
      const exists = PAGES.find(p => p.url === url);
      if (!exists) results.push({ url, priority: "0.5", changefreq: "weekly" });
    }
  }
  return results;
}

async function fetchDynamicUrls() {
  const dynamic = [];
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log("  ⚠️ 无 Supabase 配置，跳过动态内容 URL");
    return dynamic;
  }

  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
  const rest = (table, select) =>
    fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=500`, { headers })
      .then(r => (r.ok ? r.json() : []))
      .catch(() => []);

  try {
    const [articles, games, leaks] = await Promise.all([
      rest("articles", "id,updated_at"),
      rest("games", "id,updated_at"),
      rest("leaks", "id,updated_at"),
    ]);

    articles.forEach(a => {
      dynamic.push({
        url: `/articles/detail/?id=${a.id}`,
        priority: "0.7",
        changefreq: "weekly",
        lastmod: a.updated_at ? a.updated_at.slice(0, 10) : null,
      });
    });
    games.forEach(g => {
      dynamic.push({
        url: `/games/detail/?id=${g.id}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: g.updated_at ? g.updated_at.slice(0, 10) : null,
      });
    });
    leaks.forEach(l => {
      dynamic.push({
        url: `/leaks/detail/?id=${l.id}`,
        priority: "0.7",
        changefreq: "daily",
        lastmod: l.updated_at ? l.updated_at.slice(0, 10) : null,
      });
    });

    console.log(`  📡 Supabase 动态 URL: ${articles.length} 文章 + ${games.length} 游戏 + ${leaks.length} 爆料`);
  } catch (e) {
    console.log(`  ⚠️ Supabase 查询失败: ${e.message}`);
  }

  return dynamic;
}

async function generate() {
  const today = new Date().toISOString().split("T")[0];
  const dynamicUrls = await fetchDynamicUrls();
  const staticUrls = [...PAGES, ...findPages(OUT_DIR)];
  const allPages = [...staticUrls];

  // 合并动态 URL（去重）
  const seen = new Set(staticUrls.map(p => p.url));
  for (const d of dynamicUrls) {
    if (!seen.has(d.url)) {
      allPages.push(d);
      seen.add(d.url);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq || "weekly"}</changefreq>
    <priority>${p.priority || "0.5"}</priority>
  </url>`).join("\n")}
</urlset>`;

  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap);
  console.log(`Sitemap generated with ${allPages.length} URLs`);
}

generate().catch(err => {
  console.error("Sitemap generation failed:", err.message);
  // Fallback: just static pages
  const today = new Date().toISOString().split("T")[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap);
  console.log(`Sitemap generated with ${PAGES.length} URLs (fallback, no dynamic content)`);
});
