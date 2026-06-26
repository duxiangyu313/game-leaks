/**
 * B站动态直接抓取器 v3
 *
 * 策略（按优先级尝试）:
 *   1. 带 Cookie 的 API 抓取 (需在 .env.local 配置 BILIBILI_COOKIE)
 *   2. 无 Cookie API 抓取 (大概率 412)
 *
 * 获取 Cookie: 浏览器登录 B站 → F12 → Application → Cookies →
 *   复制全部 cookie 字符串 → 填入 .env.local:
 *   BILIBILI_COOKIE=buvid3=xxx; b_nut=xxx; SESSDATA=xxx; ...
 */
const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** 加载 cookie（从 .env.local） */
let _cachedCookie = null;
function getCookie() {
  if (_cachedCookie !== null) return _cachedCookie;
  const envPath = path.join(__dirname, "..", "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    _cachedCookie = "";
    return "";
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("BILIBILI_COOKIE=")) {
      _cachedCookie = trimmed.slice("BILIBILI_COOKIE=".length).trim();
      return _cachedCookie;
    }
  }
  _cachedCookie = "";
  return "";
}

/**
 * 简单 HTTP GET
 */
function httpGet(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const headers = {
      "User-Agent": USER_AGENT,
      Referer: "https://www.bilibili.com/",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9",
      ...extraHeaders,
    };

    // 注入 Cookie
    const cookie = getCookie();
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const req = mod.get(url, { timeout: 15000, headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpGet(res.headers.location, extraHeaders).then(resolve).catch(reject);
        return;
      }
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ body, statusCode: res.statusCode }));
    });
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("请求超时"));
    });
    req.on("error", reject);
  });
}

/**
 * 从 API 抓取 B站用户动态
 * URL: api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid={UID}
 */
async function fetchFromApi(uid, label) {
  const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${uid}&offset=`;
  const { body } = await httpGet(url);
  const data = JSON.parse(body);

  if (data.code !== 0) {
    throw new Error(`code=${data.code} message=${data.message}`);
  }

  return (data.data?.items || []).map((item) => {
    const modules = item.modules || {};
    const desc = modules.module_dynamic?.desc;
    const major = modules.module_dynamic?.major;

    let title = "";
    if (desc?.text) {
      title = desc.text.replace(/\n/g, " ").trim().slice(0, 60);
    } else if (major?.archive?.title) {
      title = `[视频] ${major.archive.title}`;
    } else if (major?.article?.title) {
      title = `[专栏] ${major.article.title}`;
    } else if (major?.live_rcmd?.content) {
      title = `[直播] ${major.live_rcmd.content}`;
    } else {
      title = `[动态] ${item.id_str}`;
    }

    let content = desc?.text || "";
    if (major?.archive?.desc) content += "\n\n" + major.archive.desc;
    if (major?.draw?.items) content += "\n[包含图片]";

    const pubTs = item.modules?.module_author?.pub_ts || 0;

    return {
      title,
      link: `https://t.bilibili.com/${item.id_str}`,
      content,
      pubDate: pubTs ? new Date(pubTs * 1000).toISOString() : "",
      sourceLabel: label,
      credibility: "confirmed", // B站官方号动态默认认证
    };
  });
}

/**
 * 从 B站用户空间抓取动态
 * @param {string} uid - B站用户 UID
 * @param {string} label - 源标签
 * @param {string[]} keywords - 关键词过滤
 * @returns {Promise<Array<{title, link, content, pubDate, sourceLabel}>>}
 */
async function fetchBilibiliDynamic(uid, label, keywords) {
  const cookie = getCookie();
  if (!cookie) {
    console.error(`  [${label}] ⚠️  未配置 BILIBILI_COOKIE，B站API大概率返回412`);
    console.error(`  [${label}] 💡 获取Cookie: 浏览器登录B站→F12→Application→Cookies→复制全部`);
    console.error(`  [${label}] 💡 然后添加到 next-game-site/.env.local: BILIBILI_COOKIE=xxx`);
  }

  let items = [];
  try {
    items = await fetchFromApi(uid, label);
    console.log(`  [${label}] API抓取 ${items.length} 条动态`);
  } catch (err) {
    console.error(`  [${label}] API失败: ${err.message}`);
    return [];
  }

  // 关键词过滤
  const filtered = items.filter((item) => {
    if (!item.title && !item.content) return false;
    const text = (item.title || "") + " " + (item.content || "");
    return keywords.some((kw) => text.includes(kw));
  });

  console.log(`  [${label}] 关键词匹配 ${filtered.length}/${items.length} 条`);
  return filtered;
}

module.exports = { fetchBilibiliDynamic, httpGet, getCookie };
