/**
 * B站动态直接抓取器
 * 绕过 RSSHub，直接调用 B站内部 API 获取用户动态
 *
 * API: https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid={UID}
 * 参考: B站空间动态页使用的接口，返回 JSON
 */
const https = require("https");
const http = require("http");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * 简单 HTTP GET（不用额外依赖）
 * @param {string} url
 * @returns {Promise<string>} 响应体
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      {
        timeout: 15000,
        headers: {
          "User-Agent": USER_AGENT,
          Referer: "https://www.bilibili.com/",
          Accept: "application/json, text/plain, */*",
        },
      },
      (res) => {
        // 处理重定向
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          httpGet(res.headers.location).then(resolve).catch(reject);
          return;
        }
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      }
    );
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("请求超时"));
    });
    req.on("error", reject);
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
  const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${uid}&offset=`;
  const body = await httpGet(url);
  const data = JSON.parse(body);

  if (data.code !== 0) {
    console.error(`  [${label}] B站API返回错误: code=${data.code} message=${data.message}`);
    return [];
  }

  const items = (data.data?.items || []).map((item) => {
    // 提取文本内容
    const modules = item.modules || {};
    const desc = modules.module_dynamic?.desc;
    const major = modules.module_dynamic?.major;

    // 标题：取动态文本前60字
    let title = "";
    if (desc?.text) {
      title = desc.text.replace(/\n/g, " ").trim().slice(0, 60);
    } else if (major?.archive?.title) {
      title = `[视频] ${major.archive.title}`;
    } else if (major?.article?.title) {
      title = `[专栏] ${major.article.title}`;
    } else {
      title = `[动态] ${item.id_str}`;
    }

    // 正文：完整动态文本
    let content = desc?.text || "";
    if (major?.archive?.desc) {
      content += "\n\n" + major.archive.desc;
    }

    // 提取图片描述
    if (major?.draw?.items) {
      content += "\n[包含图片]";
    }

    // 链接：动态详情页
    const link = `https://t.bilibili.com/${item.id_str}`;

    // 发布时间
    const pubDate = new Date(item.modules?.module_author?.pub_ts * 1000 || Date.now()).toISOString();

    return { title, link, content, pubDate, sourceLabel: label };
  });

  // 关键词过滤
  const filtered = items.filter((item) => {
    if (!item.title) return false;
    return keywords.some((kw) => item.title.includes(kw) || (item.content || "").includes(kw));
  });

  console.log(`  [${label}] 抓取 ${items.length} 条动态 → 关键词匹配 ${filtered.length} 条`);
  return filtered;
}

module.exports = { fetchBilibiliDynamic, httpGet };
