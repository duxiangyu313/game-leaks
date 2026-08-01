/**
 * Web 搜索补位模块（Claude Code 桥接）
 *
 * Node 脚本在境内无法直接调 Google/Bing/DuckDuckGo 等搜索引擎。
 * 当 B站 + 机核 RSS 全部为空时，fetch-rss.js 输出 needs-websearch.json 信号文件。
 * Claude Code 会话读取该文件，用 WebSearch 工具补位，然后调用 supplement() 写入结果。
 */
const path = require("path");
const fs = require("fs");
const { todayStr } = require("./utils");

/**
 * 读取待补位信号文件
 * @returns {object|null} { date, emptyGames, allKeywords } 或 null
 */
function readSignalFile() {
  const signalPath = path.join(__dirname, "..", "output", todayStr(), "needs-websearch.json");
  if (!fs.existsSync(signalPath)) return null;
  return JSON.parse(fs.readFileSync(signalPath, "utf-8"));
}

/**
 * 将 Claude Code WebSearch 结果写入早报
 * @param {Array<{gameName, title, link, content, sourceLabel}>} items
 */
function supplement(items) {
  if (!items || items.length === 0) return;

  const dir = path.join(__dirname, "..", "output", todayStr());
  fs.mkdirSync(dir, { recursive: true });

  // 追加到 raw JSON
  const rawPath = path.join(dir, "items.json");
  let existing = [];
  if (fs.existsSync(rawPath)) {
    existing = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
  }
  const merged = [...existing, ...items.map((item) => ({
    ...item,
    gameName: item.gameName || "",
    pubDate: item.pubDate || new Date().toISOString(),
    credibility: item.credibility || "likely",
  }))];
  fs.writeFileSync(rawPath, JSON.stringify(merged, null, 2));

  // 标记已补位，避免重复
  const signalPath = path.join(dir, "needs-websearch.json");
  if (fs.existsSync(signalPath)) {
    fs.writeFileSync(signalPath.replace(".json", ".done.json"), JSON.stringify({ supplementedAt: new Date().toISOString(), count: items.length }));
    fs.unlinkSync(signalPath);
  }

  console.log(`✅ WebSearch 补位完成: ${items.length} 条写入 ${rawPath}`);
}

module.exports = { readSignalFile, supplement };
