# QQ群每日爆料早报 · 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 `next-game-site/qq-feed-bot/` 下创建独立 Node.js 模块，每天 8:00 自动抓取 RSS → 生成 QQ 群早报 + 网站短文 → 写入 Supabase 草稿箱 + 本地文件。

**架构：** 独立 Node.js 模块，与主站共享 `.env.local`，不依赖 Next.js。CommonJS（匹配现有 scripts/ 风格），手动解析 .env（不用 dotenv），`rss-parser` 抓取 + `node-cron` 调度。

**技术栈：** Node.js (CommonJS)、rss-parser、node-cron、@supabase/supabase-js

---

### 任务 1：创建模块骨架

**文件：**
- 创建：`next-game-site/qq-feed-bot/package.json`
- 创建：`next-game-site/qq-feed-bot/config/sources.json`
- 创建：`next-game-site/qq-feed-bot/.gitignore`

- [ ] **步骤 1：创建 package.json**

```json
{
  "name": "qq-feed-bot",
  "version": "1.0.0",
  "private": true,
  "description": "QQ群每日爆料早报自动生成器",
  "scripts": {
    "feed": "node src/index.js",
    "feed:scheduler": "node src/index.js --scheduler",
    "feed:dry": "node src/index.js --dry"
  },
  "dependencies": {
    "node-cron": "^3.0.3",
    "rss-parser": "^3.13.0"
  }
}
```

- [ ] **步骤 2：创建 config/sources.json**

```json
{
  "rsshubBase": "https://rsshub.example.com",
  "games": [
    {
      "name": "归唐",
      "slug": "guitang",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/REPLACE_UID", "enabled": true },
        { "label": "微博", "url": "/weibo/user/REPLACE_UID", "enabled": false }
      ],
      "keywords": ["归唐", "Return To Tang", "网易3A"]
    },
    {
      "name": "影之刃零",
      "slug": "phantom-blade-zero",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/REPLACE_UID", "enabled": true }
      ],
      "keywords": ["影之刃零", "Phantom Blade Zero", "灵游坊", "梁其伟"]
    },
    {
      "name": "燕云十六声",
      "slug": "where-winds-meet",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/REPLACE_UID", "enabled": true }
      ],
      "keywords": ["燕云十六声", "燕云", "Where Winds Meet"]
    },
    {
      "name": "诡秘之主",
      "slug": "lord-of-mysteries",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/REPLACE_UID", "enabled": true }
      ],
      "keywords": ["诡秘之主", "Lord of Mysteries", "弹指宇宙", "快手"]
    }
  ]
}
```

- [ ] **步骤 3：创建 .gitignore**

```
output/
node_modules/
```

- [ ] **步骤 4：安装依赖并验证**

```bash
cd next-game-site/qq-feed-bot && npm install
```

预期：安装 `node-cron` 和 `rss-parser`，无报错。

- [ ] **步骤 5：Commit**

```bash
git add next-game-site/qq-feed-bot/package.json next-game-site/qq-feed-bot/config/sources.json next-game-site/qq-feed-bot/.gitignore next-game-site/qq-feed-bot/package-lock.json
git commit -m "feat(qq-feed-bot): 初始化模块骨架，添加信源配置"
```

---

### 任务 2：实现工具函数 utils.js

**文件：**
- 创建：`next-game-site/qq-feed-bot/src/utils.js`

- [ ] **步骤 1：创建 utils.js**

```js
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
```

- [ ] **步骤 2：验证 utils.js 语法正确**

```bash
cd next-game-site/qq-feed-bot && node -e "const u = require('./src/utils'); console.log(u.todayStr(), u.todayChinese());"
```

预期：输出今天的日期，如 `2026-06-26 6月26日`。

- [ ] **步骤 3：Commit**

```bash
git add next-game-site/qq-feed-bot/src/utils.js
git commit -m "feat(qq-feed-bot): 添加工具函数（日期/文件/去重/环境加载）"
```

---

### 任务 3：实现 RSS 抓取模块 fetch-rss.js

**文件：**
- 创建：`next-game-site/qq-feed-bot/src/fetch-rss.js`

- [ ] **步骤 1：创建 fetch-rss.js**

```js
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
```

- [ ] **步骤 2：验证语法**

```bash
cd next-game-site/qq-feed-bot && node -e "const f = require('./src/fetch-rss'); console.log('fetchAll:', typeof f.fetchAll);"
```

预期：输出 `fetchAll: function`。

- [ ] **步骤 3：Commit**

```bash
git add next-game-site/qq-feed-bot/src/fetch-rss.js
git commit -m "feat(qq-feed-bot): 实现RSS抓取模块（关键词过滤+去重）"
```

---

### 任务 4：实现 QQ 群文案格式化 format-qq.js

**文件：**
- 创建：`next-game-site/qq-feed-bot/src/format-qq.js`

- [ ] **步骤 1：创建 format-qq.js**

```js
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
```

- [ ] **步骤 2：创建快速测试脚本验证格式**

```bash
cd next-game-site/qq-feed-bot && node -e "
const { formatQQMessage } = require('./src/format-qq');
const testItems = [
  { title: '19分钟实机B站播放破1084万', gameName: '归唐', sourceLabel: 'B站动态', credibility: 'confirmed', content: '归唐19分钟实机在B站播放量突破1084万，登顶全站排行榜第一。外媒Polygon称战神终于遇到了竞争对手。' },
  { title: '灰雾测试今日正式开启', gameName: '诡秘之主', sourceLabel: 'B站动态', credibility: 'confirmed', content: '快手弹指宇宙UE5 MMORPG诡秘之主灰雾测试6月26日正式开测。PC+安卓+iOS三端互通。' }
];
console.log(formatQQMessage(testItems));
"
```

预期：输出格式正确的早报文案。

- [ ] **步骤 3：Commit**

```bash
git add next-game-site/qq-feed-bot/src/format-qq.js
git commit -m "feat(qq-feed-bot): 实现QQ群早报文案格式化"
```

---

### 任务 5：实现网站短文格式化 format-article.js

**文件：**
- 创建：`next-game-site/qq-feed-bot/src/format-article.js`

- [ ] **步骤 1：创建 format-article.js**

```js
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
```

- [ ] **步骤 2：验证格式**

```bash
cd next-game-site/qq-feed-bot && node -e "
const { formatArticleMarkdown } = require('./src/format-article');
const items = [
  { title: '测试爆料标题', gameName: '归唐', sourceLabel: 'B站动态', content: '这是一条测试爆料的详细内容。包含了关键信息。' }
];
console.log(formatArticleMarkdown(items));
"
```

预期：输出标准 Markdown 格式的短文。

- [ ] **步骤 3：Commit**

```bash
git add next-game-site/qq-feed-bot/src/format-article.js
git commit -m "feat(qq-feed-bot): 实现网站短文Markdown格式化"
```

---

### 任务 6：实现发布模块 publish.js

**文件：**
- 创建：`next-game-site/qq-feed-bot/src/publish.js`

- [ ] **步骤 1：创建 publish.js**

```js
/**
 * 发布模块：写入 Supabase leaks 表 + 本地文件保存
 */
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { loadEnv, todayStr, ensureDir, writeTextFile } = require("./utils");
const { formatArticleItem } = require("./format-article");

// 加载项目根目录的 .env.local
loadEnv(path.join(__dirname, "..", "..", ".env.local"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 保存到本地 output/YYYY-MM-DD/ 目录
 * @param {string} qqText - QQ群纯文本
 * @param {string} articleMd - 网站短文
 * @param {object[]} rawItems - 原始抓取数据
 */
function saveLocal(qqText, articleMd, rawItems) {
  const date = todayStr();
  const dir = path.join(__dirname, "..", "output", date);
  ensureDir(dir);

  writeTextFile(path.join(dir, "qq-msg.txt"), qqText);
  writeTextFile(path.join(dir, "qq-msg.md"), qqText);
  writeTextFile(path.join(dir, "article-leaks.md"), articleMd);
  writeTextFile(
    path.join(dir, ".fetch-log.json"),
    JSON.stringify(rawItems, null, 2)
  );

  console.log(`\n📁 本地文件已保存到: output/${date}/`);
  return dir;
}

/**
 * 写入 Supabase leaks 表（草稿状态）
 * @param {object[]} items - 爆料列表
 * @returns {Promise<number>} 成功写入条数
 */
async function publishToSupabase(items, dryRun = false) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ 缺少 Supabase 环境变量，跳过数据库写入");
    return 0;
  }

  if (dryRun) {
    console.log("\n🔍 [DRY RUN] 跳过 Supabase 写入，以下是将写入的内容:");
    items.forEach((item, i) => {
      const { title } = formatArticleItem(item);
      console.log(`  ${i + 1}. ${title}`);
    });
    return 0;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  // 尝试管理员登录
  const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
  const adminPassword = process.env.SUPABASE_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (error) {
      console.error(`⚠️  管理员登录失败: ${error.message}，尝试匿名插入...`);
    } else {
      console.log("✅ 管理员登录成功");
    }
  }

  let successCount = 0;

  for (const item of items) {
    // 检查是否已存在
    const { title } = formatArticleItem(item);
    const { data: existing } = await supabase
      .from("leaks")
      .select("id")
      .eq("title", title)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  ⏭️  已存在，跳过: ${title.slice(0, 40)}`);
      continue;
    }

    const { error } = await supabase.from("leaks").insert({
      title,
      summary: item.content ? item.content.replace(/\n+/g, " ").slice(0, 120) : "",
      content: item.content || "",
      source: item.sourceLabel || "",
      credibility: item.credibility || "rumor",
      game_name: item.gameName || "",
      status: "draft",
      published_at: new Date().toISOString(),
      view_count: 0,
    });

    if (error) {
      console.error(`  ❌ 写入失败: ${title.slice(0, 40)} — ${error.message}`);
    } else {
      console.log(`  ✅ 草稿已写入: ${title.slice(0, 40)}`);
      successCount++;
    }
  }

  return successCount;
}

module.exports = { saveLocal, publishToSupabase };
```

- [ ] **步骤 2：验证语法**

```bash
cd next-game-site/qq-feed-bot && node -e "const p = require('./src/publish'); console.log('saveLocal:', typeof p.saveLocal, 'publish:', typeof p.publishToSupabase);"
```

预期：输出两个 `function`。

- [ ] **步骤 3：Commit**

```bash
git add next-game-site/qq-feed-bot/src/publish.js
git commit -m "feat(qq-feed-bot): 实现发布模块（Supabase草稿+本地文件）"
```

---

### 任务 7：实现入口文件 + 调度器 index.js

**文件：**
- 创建：`next-game-site/qq-feed-bot/src/index.js`

- [ ] **步骤 1：创建 index.js**

```js
/**
 * QQ群每日爆料早报 · 入口
 *
 * 用法:
 *   node src/index.js             手动执行一次
 *   node src/index.js --scheduler 启动定时任务（每天 8:00）
 *   node src/index.js --dry       仅抓取+格式化，不写入 Supabase
 */
const path = require("path");
const cron = require("node-cron");
const { todayStr, todayChinese, writeTextFile } = require("./utils");
const { fetchAll } = require("./fetch-rss");
const { formatQQMessage } = require("./format-qq");
const { formatArticleMarkdown } = require("./format-article");
const { saveLocal, publishToSupabase } = require("./publish");

// 加载配置
const configPath = path.join(__dirname, "..", "config", "sources.json");
const config = require(configPath);

/**
 * 主流程：抓取 → 格式化 → 发布
 */
async function run(dryRun = false) {
  const divider = "═".repeat(50);
  console.log(`\n${divider}`);
  console.log(`🕐 QQ群每日爆料早报 · ${todayChinese()}`);
  console.log(`${divider}\n`);

  // 1. 抓取
  console.log("📡 开始抓取 RSS 信源...\n");
  const { items } = await fetchAll(config);

  // 2. 格式化
  console.log("\n📝 生成文案...");
  const qqText = formatQQMessage(items);
  const articleMd = formatArticleMarkdown(items);

  // 3. 输出到控制台
  console.log(`\n${divider}`);
  console.log("📋 QQ群早报文案（可直接复制）:");
  console.log(`${divider}\n`);
  console.log(qqText);
  console.log(`\n${divider}\n`);

  // 4. 保存本地
  saveLocal(qqText, articleMd, items);

  // 5. 写入 Supabase 草稿箱
  const count = await publishToSupabase(items, dryRun);
  if (dryRun) {
    console.log(`\n🔍 DRY RUN 完成，共 ${items.length} 条爆料（未写入数据库）`);
  } else {
    console.log(`\n✅ 完成: ${items.length} 条爆料，${count} 条写入草稿箱`);
  }

  console.log(`${divider}\n`);
}

// 主入口
const args = process.argv.slice(2);

if (args.includes("--scheduler")) {
  console.log("⏰ 启动定时任务：每天早上 8:00 执行\n");
  console.log(`   下一次执行: 明天 08:00`);
  console.log(`   按 Ctrl+C 退出\n`);

  // 启动时先跑一次
  run(false);

  // 每天 8:00 执行
  cron.schedule("0 8 * * *", () => {
    console.log(`\n⏰ 定时触发: ${new Date().toLocaleString("zh-CN")}`);
    run(false).catch(err => console.error("定时任务出错:", err));
  });
} else {
  const dryRun = args.includes("--dry");
  run(dryRun).catch(err => {
    console.error("❌ 执行失败:", err);
    process.exit(1);
  });
}
```

- [ ] **步骤 2：验证入口加载**

```bash
cd next-game-site/qq-feed-bot && node -e "
const config = require('./config/sources.json');
console.log('配置加载成功，游戏数:', config.games.length);
"
```

预期：`配置加载成功，游戏数: 4`

- [ ] **步骤 3：dry run 测试**

```bash
cd next-game-site/qq-feed-bot && node src/index.js --dry
```

预期：尝试抓取 RSS（会因为 `rsshub.example.com` 不可用而失败，但程序不应崩溃，应输出空结果 + `今日无重大爆料` 文案）。

- [ ] **步骤 4：Commit**

```bash
git add next-game-site/qq-feed-bot/src/index.js
git commit -m "feat(qq-feed-bot): 实现入口+node-cron定时调度"
```

---

### 任务 8：集成到主站 package.json

**文件：**
- 修改：`next-game-site/package.json`

- [ ] **步骤 1：添加 feed 脚本到主站 package.json**

在 `next-game-site/package.json` 的 `scripts` 块中添加：

```json
"feed": "cd qq-feed-bot && node src/index.js",
"feed:dry": "cd qq-feed-bot && node src/index.js --dry",
"feed:scheduler": "cd qq-feed-bot && node src/index.js --scheduler"
```

- [ ] **步骤 2：验证脚本可执行**

```bash
cd next-game-site && npm run feed:dry
```

预期：执行 dry run，输出格式正确的早报文案。

- [ ] **步骤 3：Commit**

```bash
git add next-game-site/package.json
git commit -m "feat: 集成qq-feed-bot脚本到主站package.json"
```

---

### 任务 9：创建 README 文档

**文件：**
- 创建：`next-game-site/qq-feed-bot/README.md`

- [ ] **步骤 1：创建 README.md**

````markdown
# QQ群每日爆料早报

每天早上 8:00 自动抓取国产新游官方动态，生成 QQ 群早报 + 网站短文。

## 快速开始

```bash
# 安装依赖
cd qq-feed-bot && npm install

# 手动执行一次（dry run，不写数据库）
npm run feed:dry

# 手动执行一次（写入 Supabase 草稿箱）
npm run feed

# 启动定时任务（每天 8:00 自动执行）
npm run feed:scheduler
```

也可从主站根目录调用：

```bash
cd next-game-site
npm run feed         # 手动
npm run feed:dry     # 预览
npm run feed:scheduler  # 定时
```

## 配置信源

编辑 `config/sources.json`：

1. 设置 `rsshubBase` 为可用的 RSSHub 实例 URL
2. 将 `REPLACE_UID` 替换为实际 B 站/微博 UID
3. 用 `enabled: false` 临时关闭不稳定信源
4. 添加新游戏：在 `games` 数组中新增一条

## 产出文件

每次运行在 `output/YYYY-MM-DD/` 下生成：

| 文件 | 用途 |
|------|------|
| `qq-msg.txt` | QQ 群纯文本，可直接复制 |
| `qq-msg.md` | 同内容 Markdown 备查 |
| `article-leaks.md` | 网站爆料短文 |
| `.fetch-log.json` | 原始抓取数据（debug） |

同时自动写入 Supabase `leaks` 表（`status: draft`），在网站后台 `/admin/leaks` 可查看并一键发布。
````

- [ ] **步骤 2：Commit**

```bash
git add next-game-site/qq-feed-bot/README.md
git commit -m "docs(qq-feed-bot): 添加README使用说明"
```

---

### 最终验证

- [ ] **步骤 1：端到端 dry run**

```bash
cd next-game-site && npm run feed:dry
```

预期：
- 尝试连接 RSSHub（当前会失败因为端点未配置）
- 优雅降级：输出 `今日无重大爆料` 文案
- 在 `qq-feed-bot/output/YYYY-MM-DD/` 下生成完整文件
- 不写入 Supabase

- [ ] **步骤 2：检查产出文件**

```bash
ls -la next-game-site/qq-feed-bot/output/$(date +%Y-%m-%d)/
```

预期：4 个文件（qq-msg.txt, qq-msg.md, article-leaks.md, .fetch-log.json）

- [ ] **步骤 3：最终 Commit**

```bash
git add -A
git commit -m "feat(qq-feed-bot): QQ群每日爆料早报系统完成"
```
