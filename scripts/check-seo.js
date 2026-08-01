const fs = require("fs");
const path = require("path");

const files = [
  { name: "文章详情页", file: "live/articles/detail/index.html" },
  { name: "游戏详情页", file: "live/games/detail/index.html" },
  { name: "首页", file: "live/index.html" },
];

for (const f of files) {
  const filePath = path.join(__dirname, "..", f.file);
  if (!fs.existsSync(filePath)) {
    console.log(`${f.name}: 文件不存在 → ${f.file}`);
    continue;
  }
  const html = fs.readFileSync(filePath, "utf8");

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
  const descMatch = html.match(/name="description"[^>]*content="([^"]+)"/);
  const ogTitleMatch = html.match(/property="og:title"[^>]*content="([^"]+)"/);
  const ogDescMatch = html.match(/property="og:description"[^>]*content="([^"]+)"/);
  const canonicalMatch = html.match(/rel="canonical"[^>]*href="([^"]+)"/);
  const jsonLdCount = (html.match(/application\/ld\+json/g) || []).length;

  console.log(`\n=== ${f.name} ===`);
  console.log(`  title: ${titleMatch ? titleMatch[1] : "❌ 未找到"}`);
  console.log(`  description: ${descMatch ? descMatch[1].substring(0, 80) : "❌ 未找到"}`);
  console.log(`  og:title: ${ogTitleMatch ? ogTitleMatch[1].substring(0, 80) : "❌ 未找到"}`);
  console.log(`  og:description: ${ogDescMatch ? ogDescMatch[1].substring(0, 80) : "❌ 未找到"}`);
  console.log(`  canonical: ${canonicalMatch ? canonicalMatch[1] : "未找到"}`);
  console.log(`  JSON-LD 脚本: ${jsonLdCount} 个`);
}
