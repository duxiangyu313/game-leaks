/**
 * 抓取调度模块
 * 根据信源类型自动选择抓取方式：
 *   - B站 /bilibili/user/dynamic/{UID} → 直接调 B站 API（无需 RSSHub）
 *   - 其他 URL → RSS 解析器
 */
const RssParser = require("rss-parser");
const { dedupByTitle } = require("./utils");
const { fetchBilibiliDynamic } = require("./fetch-bilibili");

const parser = new RssParser({
  timeout: 15000,
  headers: {
    "User-Agent": "QQ-Feed-Bot/1.0 (news.guoyouwenduji.cc)",
  },
});

/** 匹配 B站用户动态路径: /bilibili/user/dynamic/{UID} */
const BILIBILI_DYNAMIC_RE = /\/bilibili\/user\/dynamic\/(\d+)/;

/**
 * 从单项信源抓取并过滤
 * @param {string} sourceUrl - 完整 URL 或 RSSHub 相对路径
 * @param {string} label - 源标签（用于日志）
 * @param {string[]} keywords - 关键词列表
 * @returns {Promise<Array<{title, link, content, pubDate, sourceLabel}>>}
 */
async function fetchOneSource(sourceUrl, label, keywords) {
  // 检测 B站动态模式 → 走直接 API
  const biliMatch = sourceUrl.match(BILIBILI_DYNAMIC_RE);
  if (biliMatch) {
    try {
      return await fetchBilibiliDynamic(biliMatch[1], label, keywords);
    } catch (err) {
      console.error(`  [${label}] B站抓取失败: ${err.message}`);
      return [];
    }
  }

  // 其他源 → RSS 解析器
  try {
    const feed = await parser.parseURL(sourceUrl);
    const items = (feed.items || [])
      .filter((item) => {
        const title = item.title || "";
        return keywords.some((kw) => title.includes(kw));
      })
      .map((item) => ({
        title: item.title || "",
        link: item.link || "",
        content: item.contentSnippet || item.content || "",
        pubDate: item.pubDate || "",
        sourceLabel: label,
      }));
    console.log(
      `  [${label}] 抓取 ${feed.items?.length || 0} 条 → 关键词匹配 ${items.length} 条`
    );
    return items;
  } catch (err) {
    console.error(`  [${label}] RSS抓取失败: ${err.message}`);
    return [];
  }
}

/**
 * 抓取所有已启用的信源
 * @param {object} config - sources.json 解析后的对象
 * @returns {Promise<{items: Array, byGame: object}>}
 */
/** 简单延迟 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAll(config) {
  const { rsshubBase, games } = config;
  const allItems = [];
  const byGame = {};

  let isFirstBiliCall = true;

  for (const game of games) {
    const gameItems = [];

    for (const source of game.rss) {
      if (!source.enabled) continue;

      // 拼接完整 URL
      const fullUrl = source.url.startsWith("http")
        ? source.url
        : `${rsshubBase || ""}${source.url}`;

      // 跳过未配置的占位符 UID
      if (fullUrl.includes("FIND_UID") || fullUrl.includes("REPLACE_UID")) {
        console.log(`🔍 [${game.name}] 跳过未配置: ${source.label}（需填写 UID）`);
        continue;
      }

      // B站源之间加延迟避免频率限制（第一个除外）
      const isBiliSource = /bilibili/.test(fullUrl);
      if (isBiliSource && !isFirstBiliCall) {
        await sleep(300);
      }
      if (isBiliSource) isFirstBiliCall = false;

      console.log(`🔍 [${game.name}] 抓取: ${source.label}`);
      const items = await fetchOneSource(fullUrl, source.label, game.keywords);
      gameItems.push(...items);
    }

    // 同一游戏内去重
    const titles = [];
    const deduped = dedupByTitle(gameItems, titles);
    deduped.forEach((item) => {
      item.gameName = game.name;
      item.gameSlug = game.slug;
    });

    allItems.push(...deduped);
    byGame[game.name] = deduped;
    console.log(`  → ${game.name}: 共 ${deduped.length} 条有效爆料`);
  }

  // 跨游戏去重
  const allTitles = [];
  const finalItems = dedupByTitle(allItems, allTitles);

  console.log(`\n📊 抓取完成: 总计 ${finalItems.length} 条爆料`);
  return { items: finalItems, byGame };
}

module.exports = { fetchAll };
