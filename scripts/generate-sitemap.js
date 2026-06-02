/**
 * 生成 sitemap.xml — 扫描 build_out 目录的所有 HTML 页面
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://news.guoyouwenduji.cc";
const OUT_DIR = process.argv[2] || "build_out";

// 所有已知页面路径
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
  { url: "/privacy/", priority: "0.2", changefreq: "yearly" },
  { url: "/terms/", priority: "0.2", changefreq: "yearly" },
];

// 扫描实际存在的 HTML 文件
function findPages(dir, base = "") {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    const relative = base + "/" + entry.name;
    if (entry.isDirectory()) {
      results.push(...findPages(fullPath, relative));
    } else if (entry.name === "index.html") {
      const url = base + "/" + (base ? "/" : "");
      const exists = PAGES.find(p => p.url === url.replace(/\/\//g, "/") + "/");
      results.push(exists || { url: url.replace(/\/\//g, "/") + "/", priority: "0.5", changefreq: "weekly" });
    }
  }
  return results;
}

const allPages = [...PAGES, ...findPages(OUT_DIR)];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${p.changefreq || "weekly"}</changefreq>
    <priority>${p.priority || "0.5"}</priority>
  </url>`).join("\n")}
</urlset>`;

fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap);
console.log(`Sitemap generated with ${allPages.length} URLs`);
