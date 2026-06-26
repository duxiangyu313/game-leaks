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
