/**
 * 工具函数：日期格式化、文件写入、去重、环境变量加载
 */
const fs = require("fs");
const path = require("path");

/** 读取 .env.local 到 process.env */
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

/** 返回今日日期字符串 YYYY-MM-DD */
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** 返回中文日期 MM月DD日 */
function todayChinese() {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 确保目录存在 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** 写入文本文件（自动创建目录） */
function writeTextFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * 标题相似度判断（简单：两标题最长公共子串占比）
 * 返回 0-1，>=0.8 视为重复
 */
function titleSimilarity(a, b) {
  const s1 = a.toLowerCase().replace(/\s+/g, "");
  const s2 = b.toLowerCase().replace(/\s+/g, "");
  if (s1 === s2) return 1;
  if (!s1 || !s2) return 0;

  // 动态规划求 LCS
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let maxLen = 0;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        maxLen = Math.max(maxLen, dp[i][j]);
      }
    }
  }
  return maxLen / Math.max(s1.length, s2.length);
}

/** 去重：过滤掉与已有列表标题相似度 >=0.8 的项，返回去重后新数组 */
function dedupByTitle(items, existingTitles) {
  return items.filter(item => {
    return !existingTitles.some(t => titleSimilarity(item.title, t) >= 0.8);
  });
}

module.exports = {
  loadEnv,
  todayStr,
  todayChinese,
  ensureDir,
  writeTextFile,
  titleSimilarity,
  dedupByTitle,
};
