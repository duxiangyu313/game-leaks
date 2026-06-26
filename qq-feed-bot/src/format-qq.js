/**
 * QQ 群早报文案格式化
 * 生成可直接复制到 QQ 群的口语化爆料文案
 */
const { todayChinese } = require("./utils");

/** 可信度映射 */
const CREDIBILITY_LABEL = {
  confirmed: "官方确认 ✓",
  likely: "高可信度",
  rumor: "传闻，仅供参考",
};

/**
 * 将单条爆料格式化为 QQ 群早报条目
 * @param {object} item - 爆料项 {title, gameName, sourceLabel, ...}
 * @param {number} index - 序号
 * @returns {string}
 */
function formatOneItem(item, index) {
  const gameTag = item.gameName || "未知游戏";
  const title = item.title || "有新动态";
  const credibility = CREDIBILITY_LABEL[item.credibility] || CREDIBILITY_LABEL.rumor;

  // 提取细节：取 content 的前两句话作为细节补充
  let details = "";
  if (item.content) {
    const sentences = item.content
      .replace(/\n+/g, " ")
      .split(/[。！；]/)
      .filter(s => s.trim().length > 5)
      .slice(0, 2);
    if (sentences.length > 0) {
      details = sentences.map(s => `   ${s.trim()}。`).join("\n");
    }
  }

  // 来源标注
  const sourceNote = item.sourceLabel ? `（来源：${item.sourceLabel}）` : "";

  return [
    `${index}. 【${gameTag}】${title}${sourceNote}`,
    details,
    `   可信度：${credibility}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * 生成完整 QQ 群早报
 * @param {object[]} items - 爆料列表
 * @returns {string}
 */
function formatQQMessage(items) {
  const date = todayChinese();

  if (!items || items.length === 0) {
    return `【${date} 新游早报】\n今日无重大爆料，有新消息第一时间同步。`;
  }

  const header = `【${date} 新游早报】`;
  const body = items.map((item, i) => formatOneItem(item, i + 1)).join("\n\n");
  const footer = "————\n深度解析后续会发在网站，想看完整爆料合集的群友可以私聊我~";

  return `${header}\n${body}\n\n${footer}`;
}

module.exports = { formatQQMessage, formatOneItem };
