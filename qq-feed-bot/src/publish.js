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
 * @param {boolean} dryRun - 仅预览不写入
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
