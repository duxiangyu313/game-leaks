// 发布《湮灭之潮》4 篇文章到 Supabase（leaks / articles 表）
// 密钥从项目根 .env.local 读取，不硬编码、不打印到 stdout。
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "node:fs";

const ROOT = process.cwd();
const DRAFT_DIR = `${ROOT}/../网站文章草稿/湮灭之潮`;

// 解析 .env.local
const envRaw = readFileSync(`${ROOT}/.env.local`, "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("缺少 SUPABASE_URL 或 SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 剥离 YAML frontmatter，提取标题与正文
function parseDraft(path) {
  const raw = readFileSync(path, "utf8");
  let body = raw;
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) body = raw.slice(end + 4).replace(/^\n+/, "");
  }
  const lines = body.split("\n");
  let title = "";
  const titleIdx = lines.findIndex((l) => l.startsWith("# "));
  if (titleIdx !== -1) title = lines[titleIdx].slice(2).trim();
  // 摘要：标题之后的第一个非空段落
  let excerpt = "";
  for (let i = titleIdx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t && !t.startsWith("#") && !t.startsWith(">")) {
      excerpt = t;
      break;
    }
  }
  return { title, content: body.trim(), excerpt: excerpt.slice(0, 120) };
}

const items = [
  {
    file: "爆料1_试玩口碑解禁.md",
    table: "leaks",
    credibility: "confirmed",
    tags: ["试玩", "线下试玩", "IGN中国", "湮灭之潮"],
    game_name: "湮灭之潮",
  },
  {
    file: "爆料2_脸模与海外热议.md",
    table: "leaks",
    credibility: "likely",
    tags: ["脸模", "Reddit", "海外热度", "湮灭之潮"],
    game_name: "湮灭之潮",
  },
  {
    file: "深度1_腾讯控股逻辑.md",
    table: "articles",
    category: "analysis",
    tags: ["腾讯", "蛇夫座", "控股子公司", "湮灭之潮"],
    game_name: "湮灭之潮",
  },
  {
    file: "深度2_亚瑟王出海路径.md",
    table: "articles",
    category: "analysis",
    tags: ["亚瑟王", "出海", "题材选择", "湮灭之潮"],
    game_name: "湮灭之潮",
  },
];

async function main() {
  const results = [];
  for (const it of items) {
    const { title, content, excerpt } = parseDraft(`${DRAFT_DIR}/${it.file}`);
    console.error(`准备写入 [${it.table}] ${title}`);

    // 防护：同名已存在则跳过，避免重复
    const { data: exist } = await supabase
      .from(it.table)
      .select("id")
      .eq("title", title)
      .limit(1);
    if (exist && exist.length > 0) {
      console.error(`↪️ 已存在，跳过: ${title}`);
      results.push({ title, ok: true, id: exist[0].id, skipped: true });
      continue;
    }

    let payload, res;
    if (it.table === "leaks") {
      payload = {
        title,
        summary: excerpt,
        content,
        source: "国游温度计整合（IGN中国/腾讯新闻/游侠网/网易/Reddit）",
        credibility: it.credibility,
        game_name: it.game_name,
        status: "published",
        published_at: new Date().toISOString(),
        view_count: 0,
      };
      res = await supabase.from("leaks").insert(payload).select("id, title");
    } else {
      payload = {
        title,
        excerpt,
        content,
        category: it.category,
        required_tier: "free",
        tags: it.tags,
        status: "published",
        author_name: "国游温度计",
        game_name: it.game_name,
      };
      res = await supabase.from("articles").insert(payload).select("id, title");
    }
    if (res.error) {
      console.error(`❌ ${title} 失败:`, res.error.message);
      results.push({ title, ok: false, err: res.error.message });
    } else {
      console.error(`✅ ${title} ->`, res.data?.[0]?.id);
      results.push({ title, ok: true, id: res.data?.[0]?.id });
    }
  }
  const ok = results.filter((r) => r.ok).length;
  console.error(`\n完成：成功 ${ok}/${results.length}`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error("脚本异常:", e);
  process.exit(1);
});
