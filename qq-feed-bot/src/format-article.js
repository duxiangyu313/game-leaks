/**
 * 网站爆料短文格式化
 * 生成可写入 leaks 表 content 字段的 Markdown 短文
 */
const { todayStr } = require("./utils");

/**
 * 为每条爆料生成网站短文段落
 * @param {object} item
 * @returns {{title: string, summary: string, content: string}}
 */
function formatArticleItem(item) {
  const gameName = item.gameName || "未知游戏";
  const source = item.sourceLabel || "未知来源";

  // 标题：游戏名 + 核心爆料（取原始标题前40字）
  const shortTitle = item.title ? item.title.slice(0, 40) : "有新动态";
  const title = `${gameName}：${shortTitle}`;

  // 摘要：取 content 前80字
  const summary = item.content
    ? item.content.replace(/\n+/g, " ").slice(0, 80)
    : shortTitle;

  // 正文：标准三段式
  const content = [
    `**${gameName}** 最新动态。`,
    "",
    item.content || item.title || "",
    "",
    `> 来源：${source}`,
    `> 日期：${todayStr()}`,
  ].join("\n");

  return { title, summary, content };
}

/**
 * 生成网站爆料合辑（所有爆料合并为一篇短文）
 * @param {object[]} items
 * @returns {string}
 */
function formatArticleMarkdown(items) {
  if (!items || items.length === 0) {
    return `# 每日爆料速递 · ${todayStr()}\n\n今日无重大爆料。`;
  }

  const header = `# 每日爆料速递 · ${todayStr()}\n`;
  const sections = items.map((item, i) => {
    const { title, content } = formatArticleItem(item);
    return `## ${i + 1}. ${title}\n\n${content}`;
  });

  return [header, ...sections].join("\n\n---\n\n");
}

module.exports = { formatArticleMarkdown, formatArticleItem };
