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

// ── 百度增量推送：下载线上 sitemap，计算本次新增 URL ──
const BAIDU_DAILY_CAP = 10; // 新站每日配额很低，无法获取线上 sitemap 时降级限量条数

async function fetchLiveSitemapUrls(host) {
  const url = `https://${host}/sitemap.xml`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const xml = await res.text();
    const matches = [...xml.matchAll(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/g)];
    return new Set(matches.map(m => m[1]));
  } catch {
    return null;
  }
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

// 单批推送，返回结构化结果（便于配额感知）
async function pushBaiduBatch(token, site, urls) {
  // 注意: site 参数必须原样传入，不要 encodeURIComponent（百度接口约定）
  const endpoint = `${BAIDU_ZZ_ENDPOINT}?site=${site}&token=${token}`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: urls.join("\n"),
    });
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      if (text.includes("over quota")) return { overQuota: true };
      console.error(`❌ 百度 zz API 返回 ${res.status}: ${text}`);
      return null;
    }
    try {
      const j = JSON.parse(text);
      return { overQuota: false, success: j.success || 0, remain: j.remain ?? 0 };
    } catch {
      console.error(`❌ 百度 zz API 返回非 JSON: ${text}`);
      return null;
    }
  } catch (e) {
    console.error(`❌ 百度 zz API 请求异常: ${e.message}`);
    return null;
  }
}

async function submitBaidu(token, site, urls) {
  // 新站点百度每日配额较小（通常初始 ~10 条/天），随站点质量提升而增长。
  // 策略: 先探测 1 条拿到 remain，再按剩余配额分批推送，避免一次性超额整批失败。
  const probe = await pushBaiduBatch(token, site, urls.slice(0, 1));
  if (!probe) return false;
  if (probe.overQuota) {
    console.log("   ⚠️  今日百度配额已用尽（over quota），明日部署时再推。");
    return false;
  }
  let successTotal = probe.success;
  let idx = 1;
  let remain = probe.remain;
  while (remain > 0 && idx < urls.length) {
    const batchSize = Math.min(remain, urls.length - idx, 1000);
    const r = await pushBaiduBatch(token, site, urls.slice(idx, idx + batchSize));
    if (!r) return false;
    if (r.overQuota) {
      console.log(`   ⚠️  推送至第 ${idx} 条时配额用尽（over quota），今日已成功 ${successTotal} 条。`);
      return false;
    }
    successTotal += r.success;
    idx += batchSize;
    remain = r.remain;
  }
  console.log(`✅ 百度 zz API 今日共推送 ${successTotal} 条（剩余配额 ${remain}）`);
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

  // 2) 百度 zz API（独立通道，增量推送避免每次部署吞掉全部每日配额）
  const baiduToken = getBaiduToken();
  if (baiduToken) {
    console.log("");
    console.log("🔵 推送百度搜索资源平台 zz API ...");
    // 增量：只推 sitemap 中线上尚未收录的 URL，把每日配额留给重要页/手动补推
    const liveSet = await fetchLiveSitemapUrls(host);
    let baiduUrls = urls;
    if (liveSet && liveSet.size > 0) {
      const newUrls = urls.filter(u => !liveSet.has(u));
      console.log(`   线上已收录 ${liveSet.size} 条，本次新增 ${newUrls.length} 条 → 仅推送新增`);
      baiduUrls = newUrls;
    } else {
      console.log(`   ⚠️ 无法获取线上 sitemap，降级为限量推送前 ${BAIDU_DAILY_CAP} 条`);
      baiduUrls = urls.slice(0, BAIDU_DAILY_CAP);
    }
    if (baiduUrls.length === 0) {
      console.log("   ℹ️ 无新增 URL，跳过百度推送（保留今日配额）");
    } else {
      await submitBaidu(baiduToken, host, baiduUrls);
    }
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
