/**
 * IndexNow 批量推送 — 解析 sitemap.xml 中的 URL，提交给 Bing/Yandex 等搜索引擎
 *
 * 用法:
 *   node scripts/submit-indexnow.js [live目录]      # 默认 live/
 *   node scripts/submit-indexnow.js live --dry      # 只打印不推送
 *
 * 原理:
 *   - key 从 public/ 目录下的 <key>.txt 自动读取（IndexNow 规范要求的验证文件）
 *   - 读取 sitemap.xml 里全部 <loc> URL，分批（每批 ≤ 10000 条）POST 到 api.indexnow.org
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://news.guoyouwenduji.cc";
const OUT_DIR = process.argv[2] || "live";
const DRY_RUN = process.argv.includes("--dry");
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

// 从 public/ 目录寻找 IndexNow key 文件
// IndexNow 规范: 文件名 <key>.txt，文件内容必须与文件名一致
function findKey(publicDir) {
  if (!fs.existsSync(publicDir)) return null;
  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".txt")) continue;
    const stem = entry.name.slice(0, -4); // 去掉 .txt 后缀
    // key 为 8-128 位字母数字/十六进制，且文件名 == 内容（规范要求）
    if (!/^[A-Za-z0-9-]{8,128}$/.test(stem)) continue;
    const content = fs.readFileSync(path.join(publicDir, entry.name), "utf-8").trim();
    if (content === stem) {
      return { key: stem, file: entry.name };
    }
  }
  return null;
}

function extractUrls(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`❌ sitemap 不存在: ${sitemapPath}`);
    return [];
  }
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const matches = [...xml.matchAll(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/g)];
  return matches.map(m => m[1]);
}

async function submit(key, host, urls) {
  const body = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls };
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`❌ IndexNow 返回 ${res.status}: ${text}`);
    return false;
  }
  console.log(`✅ IndexNow 200 OK — 推送 ${urls.length} 条 URL`);
  return true;
}

async function main() {
  const keyInfo = findKey(path.join(__dirname, "..", "public"));
  if (!keyInfo) {
    console.error("❌ 未找到 IndexNow key 文件（public/<key>.txt）");
    process.exit(1);
  }

  const urls = extractUrls(path.join(__dirname, "..", OUT_DIR, "sitemap.xml"));
  if (urls.length === 0) {
    console.error("❌ sitemap 中未解析到 URL");
    process.exit(1);
  }

  const host = new URL(urls[0]).host;
  console.log(`🔑 IndexNow key: ${keyInfo.file}  |  host: ${host}  |  URL 总数: ${urls.length}`);

  if (DRY_RUN) {
    console.log(`🔍 DRY RUN — 将推送以下 ${urls.length} 条 URL:`);
    urls.slice(0, 10).forEach(u => console.log(`   ${u}`));
    if (urls.length > 10) console.log(`   ... 其余 ${urls.length - 10} 条省略`);
    return;
  }

  // 分批推送（IndexNow 单次上限 10000 条）
  const batchSize = 10000;
  let ok = true;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    ok = (await submit(keyInfo.key, host, batch)) && ok;
  }
  if (!ok) process.exit(1);
}

main().catch(err => {
  console.error("❌ IndexNow 推送失败:", err.message);
  process.exit(1);
});
