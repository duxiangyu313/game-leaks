/**
 * RSS 抓取模块
 * 从 sources.json 配置的信源抓取 RSS，关键词过滤，去重
 */
const RssParser = require("rss-parser");
const { dedupByTitle } = require("./utils");

const parser = new RssParser({
  timeout: 15000,
  headers: {
    "User-Agent": "QQ-Feed-Bot/1.0 (news.guoyouwenduji.cc)",
  },
});

/**
 * 检查标题是否包含任一关键词
 * @param {string} title
 * @param {string[]} keywords
 * @returns {boolean}
 */
function matchKeywords(title, keywords) {
  if (!title) return false;
  return keywords.some(kw => title.includes(kw));
}

/**
 * 从单项 RSS 源抓取并过滤
 * @param {string} rssUrl - 完整 RSS URL
 * @param {string} label - 源标签（用于日志）
 * @param {string[]} keywords - 关键词列表
 * @returns {Promise<Array<{title, link, content, pubDate, sourceLabel}>>}
 */
async function fetchOneSource(rssUrl, label, keywords) {
  try {
    const feed = await parser.parseURL(rssUrl);
    const items = (feed.items || [])
      .filter(item => matchKeywords(item.title, keywords))
      .map(item => ({
        title: item.title || "",
        link: item.link || "",
        content: item.contentSnippet || item.content || "",
        pubDate: item.pubDate || "",
        sourceLabel: label,
      }));
    console.log(`  [${label}] 抓取 ${feed.items?.length || 0} 条 → 关键词匹配 ${items.length} 条`);
    return items;
  } catch (err) {
    console.error(`  [${label}] 抓取失败: ${err.message}`);
    return [];
  }
}

/**
 * 抓取所有已启用的信源
 * @param {object} config - sources.json 解析后的对象
 * @returns {Promise<{items: Array, byGame: object}>}
 */
async function fetchAll(config) {
  const { rsshubBase, games } = config;
  const allItems = [];
  const byGame = {};

  for (const game of games) {
    const gameItems = [];

    for (const source of game.rss) {
      if (!source.enabled) continue;
      const fullUrl = source.url.startsWith("http")
        ? source.url
        : `${rsshubBase}${source.url}`;
      console.log(`🔍 [${game.name}] 抓取: ${source.label}`);
      const items = await fetchOneSource(fullUrl, source.label, game.keywords);
      gameItems.push(...items);
    }

    // 同一游戏内去重
    const titles = [];
    const deduped = dedupByTitle(gameItems, titles);
    deduped.forEach(item => {
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

module.exports = { fetchAll, matchKeywords };
