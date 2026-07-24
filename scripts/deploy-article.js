/**
 * 部署深度文章到 Supabase
 * 用法: node scripts/deploy-article.js
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

async function main() {
  const env = loadEnv(path.join(__dirname, "..", ".env.local"));

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const article = {
    title: '古剑四试玩深度解析：所有人都在吵“像魂”，但烛龙做对了一件更重要的事',
    content: fs.readFileSync(path.join(__dirname, "article-ep20.md"), "utf-8"),
    category: "深度解析",
    required_tier: "gold",
    cover_image: "",
    excerpt: '古剑四上海试玩结束后，网上吵翻了——“魂游换皮”还是“国产良心”？我去了现场打了四场Boss，发现烛龙做对了一件比战斗系统更重要的事：诚实。在一个人人都在画饼的时代，敢把半成品端上来给你尝，本身就是一种信任。',
    tags: ["古剑奇谭四", "古剑四", "试玩评测", "深度解析", "战斗系统", "Boss设计", "文化壁垒"],
    status: "published",
    author_id: null, // service_role 不强制 author_id
  };

  const { data, error } = await supabase.from("articles").insert(article).select("id").single();

  if (error) {
    console.error("❌ 文章插入失败:", error.message);
    process.exit(1);
  }

  console.log(`✅ 文章已发布: ${data.id}\n   标题: ${article.title}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
