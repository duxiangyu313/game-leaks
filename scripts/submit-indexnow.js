/**
 * 搜索引擎主动推送 — 解析 sitemap.xml，主动通知 Bing(IndexNow) 与 百度(zz API)
 *
 * 用法:
 *   node scripts/submit-indexnow.js [live目录]        # 默认 live/
 *   node scripts/submit-indexnow.js live --dry        # 只打印不推送
 *
 * 支持引擎:
 *   - Bing / Yandex / Naver / Seznam.cz / Yep （via IndexNow, key 文件 public/<key>.txt）
 *   - 百度 （via 百度搜索资源平台 zz API, 需要 BAIDU_ZZ_TOKEN）
 *       token 获取: https://ziyuan.baidu.com/ → 普通收录/快速收录 → API提交 → 复制接口调用地址里的 token
 *       也可写入 scripts/.baidu-zz-token 文件（已被 .gitignore 忽略，不入库）
 *
 * 注意: 百度并非 IndexNow 参与方，必须走独立的 zz API。
 */
const fs = require("fs");
const path = require("path");

const OUT_DIR = process.argv[2] || "live";
const DRY_RUN = process.argv.includes("--dry");
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const BAIDU_ZZ_ENDPOINT = "http://data.zz.baidu.com/urls";

// ── IndexNow key 文件（public/<key>.txt，内容须等于文件名）──
function findKey(publicDir) {
  if (!fs.existsSync(publicDir)) return null;
  const entries = fs.readdirSync(publicDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".txt")) continue;
    const stem = entry.name.slice(0, -4);
    if (!/^[A-Za-z0-9-]{8,128}$/.test(stem)) continue;
    const content = fs.readFileSync(path.join(publicDir, entry.name), "utf-8").trim();
    if (content === stem) return { key: stem, file: entry.name };
  }
  return null;
}

// ── 解析 sitemap 全部 <loc> ──
function extractUrls(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`❌ sitemap 不存在: ${sitemapPath}`);
    return [];
  }
  const xml = fs.readFileSync(sitemapPath, "utf-8");
  const matches = [...xml.matchAll(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/g)];
  return matches.map(m => m[1]);
}

// ── IndexNow 推送（Bing 等）──
async function submitIndexNow(key, host, urls) {
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
  console.log(`✅ IndexNow 200 OK — 推送 ${urls.length} 条 URL（Bing/Yandex/Naver/Seznam）`);
  return true;
}

// ── 百度 zz API 推送 ──
function getBaiduToken() {
  if (process.env.BAIDU_ZZ_TOKEN && process.env.BAIDU_ZZ_TOKEN.trim()) {
    return process.env.BAIDU_ZZ_TOKEN.trim();
  }
  const f = path.join(__dirname, ".baidu-zz-token");
  if (fs.existsSync(f)) return fs.readFileSync(f, "utf-8").trim();
  return null;
}

async function submitBaidu(token, site, urls) {
  // 注意: site 参数必须原样传入，不要 encodeURIComponent（百度接口约定）
  const endpoint = `${BAIDU_ZZ_ENDPOINT}?site=${site}&token=${token}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: urls.join("\n"),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error(`❌ 百度 zz API 返回 ${res.status}: ${text}`);
    return false;
  }
  // 百度返回 JSON: {"success":N,"remain":M,"not_same_site":[],"not_valid":[]}
  console.log(`✅ 百度 zz API 响应: ${text.trim()}`);
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
  console.log(`🔑 IndexNow key: ${keyInfo.file}  |  host: ${host}  |  URL 总数: ${urls.length}\n`);

  if (DRY_RUN) {
    console.log(`🔍 DRY RUN — 将推送以下 ${urls.length} 条 URL:`);
    urls.slice(0, 10).forEach(u => console.log(`   ${u}`));
    if (urls.length > 10) console.log(`   ... 其余 ${urls.length - 10} 条省略`);
    return;
  }

  // 1) IndexNow（Bing 等参与引擎）
  const batchSize = 10000;
  let ok = true;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    ok = (await submitIndexNow(keyInfo.key, host, batch)) && ok;
  }

  // 2) 百度 zz API（独立通道）
  const baiduToken = getBaiduToken();
  if (baiduToken) {
    console.log("");
    console.log("🔵 推送百度搜索资源平台 zz API ...");
    await submitBaidu(baiduToken, host, urls);
  } else {
    console.log("");
    console.log("⚠️  未配置百度 token，跳过百度推送。");
    console.log("    获取: 登录 https://ziyuan.baidu.com/ → 普通收录 → API提交 → 复制 token");
    console.log("    配置: 设环境变量 BAIDU_ZZ_TOKEN，或写入 scripts/.baidu-zz-token 文件");
  }

  if (!ok) process.exit(1);
}

main().catch(err => {
  console.error("❌ 推送失败:", err.message);
  process.exit(1);
});
