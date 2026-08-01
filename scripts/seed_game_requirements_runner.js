/**
 * game_requirements 批量填充脚本 | 2026-08-01
 *
 * 功能:
 *   1. 从 Supabase 拉 games 表, 建立 title → id 映射 (模糊匹配 ILIKE)
 *   2. 读取硬编码的 35 款游戏配置数据(与 SQL 文件一致)
 *   3. 对每一条成功匹配 title 的配置, 调用 supabase.from("game_requirements").upsert()
 *   4. 最后输出执行统计: 命中 / 未命中
 *
 * 前置:
 *   - .env.local 中有 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - 表 game_requirements 已存在 (Supabase 中跑 CREATE TABLE IF NOT EXISTS 那段)
 *
 * 用法:
 *   node scripts/seed_game_requirements_runner.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ── 1. 读取 .env ─────────────────────────────────────
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(path.join(__dirname, "..", ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ 缺环境变量 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// ── 2. 硬编码配置数据(和 seed_game_requirements_20260801.sql 完全一致) ──
// 数组结构: { title_match: string (用于 games 表模糊匹配), fields: { 数据库字段... } }
const DATA = [
  // ---- 已有 15 款, 规范化重写 ----
  {
    title_match: "黑神话：悟空",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i7-9700 / AMD Ryzen 5 5500", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 4070 / AMD RX 7800 XT", ram_min:16, ram_rec:32, storage_min:130, storage_rec:130, directx:"DirectX 12", notes:'支持 DLSS 4 + FSR 4 + XeSS 2。光线追踪推荐 RTX 5070 或以上。DLC"西天取经"额外需 50GB。' }
  },
  {
    title_match: "燕云十六声",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-9400F / AMD Ryzen 5 2600", cpu_rec:"Intel Core i7-10700 / AMD Ryzen 5 5600X", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 3060 Ti / AMD RX 6700 XT", ram_min:16, ram_rec:32, storage_min:100, storage_rec:100, directx:"DirectX 12", notes:"PS5 Pro版支持光线追踪反射 + PSSR超分辨率。多人模式需要 10Mbps+ 带宽。" }
  },
  {
    title_match: "归唐",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-10400F / AMD Ryzen 5 3600", cpu_rec:"Intel Core i7-12700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 2060 6GB / AMD RX 6600 8GB", gpu_rec:"NVIDIA RTX 4070 / AMD RX 7800 XT", ram_min:16, ram_rec:32, storage_min:120, storage_rec:120, directx:"DirectX 12 Ultimate", notes:"UE5引擎。预计支持DLSS 4 + FSR 4。冷兵器战斗需60fps稳定。SSD为必需。" }
  },
  {
    title_match: "影之刃零",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-11400F / AMD Ryzen 5 5600", cpu_rec:"Intel Core i7-13700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 2070 8GB / AMD RX 6600 XT", gpu_rec:"NVIDIA RTX 4070 Ti / AMD RX 7900 XT", ram_min:16, ram_rec:32, storage_min:100, storage_rec:100, directx:"DirectX 12 Ultimate", notes:"灵游坊确认不依赖光线追踪, 优化 Lumen 软光照。高速战斗需稳定 60fps+。PS5 Pro 优先优化。" }
  },
  {
    title_match: "失落之魂",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-10400F / AMD Ryzen 5 3600", cpu_rec:"Intel Core i7-12700 / AMD Ryzen 7 5700X", gpu_min:"NVIDIA RTX 2060 6GB / AMD RX 6600", gpu_rec:"NVIDIA RTX 4070 / AMD RX 7800 XT", ram_min:16, ram_rec:32, storage_min:80, storage_rec:80, directx:"DirectX 12", notes:"高速ACT需60fps稳定。PS5首发优化平台, PC版同步发售。" }
  },
  {
    title_match: "湮灭之潮",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-12400F / AMD Ryzen 5 5600", cpu_rec:"Intel Core i7-13700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 3060 12GB / AMD RX 6700 XT", gpu_rec:"NVIDIA RTX 4070 Ti / AMD RX 7900 XT", ram_min:16, ram_rec:32, storage_min:150, storage_rec:150, directx:"DirectX 12 Ultimate", notes:"30+ Boss战, 大量粒子特效。骑士协同 AI 对 CPU 有一定要求。" }
  },
  {
    title_match: "黑神话：钟馗",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-12400F / AMD Ryzen 5 7600", cpu_rec:"Intel Core i7-14700K / AMD Ryzen 7 9800X3D", gpu_min:"NVIDIA RTX 3060 12GB / AMD RX 7600", gpu_rec:"NVIDIA RTX 5070 / AMD RX 9070 XT", ram_min:16, ram_rec:32, storage_min:150, storage_rec:150, directx:"DirectX 12 Ultimate", notes:"游戏科学第二款UE5作品, 场景密度目标超黑神话悟空一代。NVMe SSD为必需。预计2027年发售。" }
  },
  {
    title_match: "剑来",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-12400F / AMD Ryzen 5 7600", cpu_rec:"Intel Core i7-14700K / AMD Ryzen 7 9800X3D", gpu_min:"NVIDIA RTX 3060 Ti / AMD RX 6700 XT", gpu_rec:"NVIDIA RTX 5070 Ti / AMD RX 9070 XT", ram_min:16, ram_rec:32, storage_min:120, storage_rec:120, directx:"DirectX 12 Ultimate", notes:'四座天下开放世界无缝连接, Nanite + Lumen 全面应用。"万剑归宗"AI 对 CPU 有额外开销。' }
  },
  {
    title_match: "源初之结",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-13400F / AMD Ryzen 5 7600", cpu_rec:"Intel Core i7-14700K / AMD Ryzen 7 9800X3D", gpu_min:"NVIDIA RTX 3070 8GB / AMD RX 6800 16GB", gpu_rec:"NVIDIA RTX 5080 / AMD RX 9070 XT", ram_min:16, ram_rec:32, storage_min:180, storage_rec:180, directx:"DirectX 12 Ultimate", notes:"米哈游首款UE5写实3A。巨型BOSS战 + 4人联机对配置要求极高。NVMe SSD强制要求。预计2027Q4发售。" }
  },
  {
    title_match: "诡秘之主",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-12400F / AMD Ryzen 5 5600", cpu_rec:"Intel Core i7-13700 / AMD Ryzen 7 7700X", gpu_min:"NVIDIA RTX 3060 12GB / AMD RX 7600", gpu_rec:"NVIDIA RTX 4070 Ti / AMD RX 7900 XT", ram_min:16, ram_rec:32, storage_min:100, storage_rec:100, directx:"DirectX 12", notes:"维多利亚×克苏鲁, 光影氛围渲染对GPU要求较高。22条序列途径剧情。预研阶段, 配置为UE5标准预估。" }
  },
  {
    title_match: "望月",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-9400F / AMD Ryzen 5 2600", cpu_rec:"Intel Core i5-11400F / AMD Ryzen 5 5600", gpu_min:"NVIDIA GTX 1660 SUPER / AMD RX 5600 XT", gpu_rec:"NVIDIA RTX 3060 12GB / AMD RX 6600 XT", ram_min:16, ram_rec:16, storage_min:60, storage_rec:60, directx:"DirectX 12", notes:"独立团队作品, 配置要求相对友好。广州都市场景 + 月影界双地图。" }
  },
  {
    title_match: "一盏秋声：锦衣卫",
    fallback_titles: ["锦衣卫"],
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i5-10400F / AMD Ryzen 5 3600", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 2060 6GB / AMD RX 6600", ram_min:8, ram_rec:16, storage_min:40, storage_rec:40, directx:"DirectX 11", notes:"线性关卡 + 写实战斗。独立团队, 优化良好。CJ 2026 索尼展台可试玩。" }
  },
  {
    title_match: "雪中悍刀行",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-10400F / AMD Ryzen 5 3600", cpu_rec:"Intel Core i7-12700K / AMD Ryzen 7 7700X", gpu_min:"NVIDIA RTX 2060 6GB / AMD RX 6600", gpu_rec:"NVIDIA RTX 3070 8GB / AMD RX 6750 XT", ram_min:16, ram_rec:32, storage_min:80, storage_rec:80, directx:"DirectX 12", notes:'"中式撤离"玩法, 多人在线部分需 20Mbps+ 稳定网络。免费游玩 + 外观付费。' }
  },
  {
    title_match: "万民长歌：三国",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i5-11400F / AMD Ryzen 5 5600", gpu_min:"NVIDIA GTX 1060 3GB / AMD RX 570", gpu_rec:"NVIDIA RTX 2060 6GB / AMD RX 6600", ram_min:8, ram_rec:16, storage_min:50, storage_rec:50, directx:"DirectX 11", notes:"策略RPG, 对配置要求友好。偏 CPU (AI 势力模拟)。汉风写实美术。" }
  },
  {
    title_match: "代号：无限大",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-11400F / AMD Ryzen 5 5600", cpu_rec:"Intel Core i7-13700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 2060 6GB / AMD RX 6600", gpu_rec:"NVIDIA RTX 4070 / AMD RX 7800 XT", ram_min:16, ram_rec:32, storage_min:100, storage_rec:100, directx:"DirectX 12 Ultimate", notes:"都市开放世界, 物理引擎极高(几乎所有物体可交互)。CPU 密集型。免费游玩 + 外观付费。" }
  },

  // ---- 新增 20 款 ----
  {
    title_match: "古剑奇谭四",
    fallback_titles: ["古剑四", "古剑奇谭4", "古剑4"],
    fields: { os_min:"Windows 10 64-bit 21H2", os_rec:"Windows 11 64-bit 23H2", cpu_min:"Intel Core i5-10400F / AMD Ryzen 5 3600", cpu_rec:"Intel Core i7-12700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 2060 SUPER 8GB / AMD RX 6600 XT", gpu_rec:"NVIDIA RTX 4070 Ti SUPER / AMD RX 7900 GRE", ram_min:16, ram_rec:32, storage_min:140, storage_rec:140, directx:"DirectX 12 Ultimate", notes:"CJ 2026 开放试玩。虚幻 5.4 + Nanite + Lumen + 全局体积雾。14GB 显存为 4K 光追刚需。" }
  },
  {
    title_match: "猿公剑",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i5-11400F / AMD Ryzen 5 5600", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 3060 12GB / AMD RX 6600 XT", ram_min:8, ram_rec:16, storage_min:50, storage_rec:50, directx:"DirectX 12", notes:'独立团队硬核剑斗。"避青入红"系统对输入延迟敏感, 稳定60fps+为刚需。' }
  },
  {
    title_match: "抵抗者",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-9400F / AMD Ryzen 5 2600", cpu_rec:"Intel Core i5-12400F / AMD Ryzen 5 5600", gpu_min:"NVIDIA GTX 1660 Ti / AMD RX 590", gpu_rec:"NVIDIA RTX 3060 12GB / AMD RX 6650 XT", ram_min:8, ram_rec:16, storage_min:60, storage_rec:80, directx:"DirectX 12", notes:"抗日题材线性 FPS + 谍战解谜。中等场景规模。CJ 首次线下试玩。" }
  },
  {
    title_match: "九阴真经：修仙",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-10400F / AMD Ryzen 5 3600", cpu_rec:"Intel Core i7-12700 / AMD Ryzen 7 5700X", gpu_min:"NVIDIA RTX 2060 6GB / AMD RX 6600", gpu_rec:"NVIDIA RTX 4070 / AMD RX 7800 XT", ram_min:16, ram_rec:32, storage_min:100, storage_rec:100, directx:"DirectX 12 Ultimate", notes:"UE5 开放世界修仙。御剑飞行、宗门大战、海量 NPC 同屏。宗门战对 CPU 额外要求高。" }
  },
  {
    title_match: "太吾绘卷",
    fields: { os_min:"Windows 7 64-bit", os_rec:"Windows 10 64-bit", cpu_min:"Intel Core i3-6100 / AMD FX-6300", cpu_rec:"Intel Core i5-8400 / AMD Ryzen 5 1600", gpu_min:"NVIDIA GTX 660 2GB / AMD HD 7850 2GB", gpu_rec:"NVIDIA GTX 1050 Ti / AMD RX 560", ram_min:4, ram_rec:8, storage_min:10, storage_rec:10, directx:"DirectX 11", notes:"2D 美术为主。复杂性在于策略模拟(大量 NPC 关系/事件), 后期吃 CPU 和内存。" }
  },
  {
    title_match: "修仙",
    use_fuzzy_not_exact: true,
    exclude_keywords: ["九阴"],
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-6500 / AMD FX-8300", cpu_rec:"Intel Core i5-10400F / AMD Ryzen 5 3600", gpu_min:"NVIDIA GTX 960 2GB / AMD R9 380 2GB", gpu_rec:"NVIDIA GTX 1660 / AMD RX 580 8GB", ram_min:8, ram_rec:16, storage_min:20, storage_rec:20, directx:"DirectX 11", notes:"修仙模拟经营类, 中低配置友好。复杂逻辑后期略吃 CPU。" }
  },
  {
    title_match: "百面千相",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-11400F / AMD Ryzen 5 5600", cpu_rec:"Intel Core i7-13700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 3050 8GB / AMD RX 6600", gpu_rec:"NVIDIA RTX 4070 Ti / AMD RX 7900 XT", ram_min:16, ram_rec:32, storage_min:120, storage_rec:120, directx:"DirectX 12 Ultimate", notes:"叠纸首款开放世界。国风 + 戏曲面具美学。画面规格对标国际3A。" }
  },
  {
    title_match: "无限暖暖",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i5-11400F / AMD Ryzen 5 5600", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 3060 12GB / AMD RX 6600 XT", ram_min:8, ram_rec:16, storage_min:60, storage_rec:60, directx:"DirectX 12", notes:"卡通渲染开放世界。服装布料模拟对GPU有一定要求。免费游玩 + 服装抽取。" }
  },
  {
    title_match: "鸣潮",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i7-10700 / AMD Ryzen 5 5600X", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 3060 12GB / AMD RX 6650 XT", ram_min:8, ram_rec:16, storage_min:80, storage_rec:80, directx:"DirectX 12", notes:"开放世界动作手游/PC同步。UE 4.27 自定义渲染管线。中等配置可跑高画质 60fps。" }
  },
  {
    title_match: "绝区零",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-6500 / AMD FX-8300", cpu_rec:"Intel Core i7-7700 / AMD Ryzen 5 2600", gpu_min:"NVIDIA GTX 970 4GB / AMD RX 470 4GB", gpu_rec:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", ram_min:8, ram_rec:16, storage_min:80, storage_rec:100, directx:"DirectX 11", notes:"卡通渲染都市动作。对CPU单核性能要求较高(同屏大量AI+物理)。" }
  },
  {
    title_match: "原神",
    fields: { os_min:"Windows 7 SP1 64-bit", os_rec:"Windows 10 64-bit", cpu_min:"Intel Core i5 或同等", cpu_rec:"Intel Core i7 或同等", gpu_min:"NVIDIA GT 1030 及以上", gpu_rec:"NVIDIA GTX 1060 6GB 及以上", ram_min:8, ram_rec:16, storage_min:120, storage_rec:150, directx:"DirectX 11", notes:"卡通渲染开放世界。每版本 ~20GB 增量更新, 所需存储空间持续扩大。" }
  },
  {
    title_match: "星穹铁道",
    fallback_titles: ["崩坏：星穹铁道", "崩坏星穹铁道"],
    fields: { os_min:"Windows 7 SP1 64-bit", os_rec:"Windows 10 64-bit", cpu_min:"Intel Core i3-6100 / AMD Athlon 200GE", cpu_rec:"Intel Core i5-8400 / AMD Ryzen 5 1600", gpu_min:"NVIDIA GT 1030", gpu_rec:"NVIDIA GTX 1060 6GB / AMD RX 570", ram_min:6, ram_rec:8, storage_min:30, storage_rec:30, directx:"DirectX 11", notes:"回合制战斗。配置为米哈游全家桶最低门槛。" }
  },
  {
    title_match: "终末地",
    fallback_titles: ["明日方舟：终末地", "明日方舟终末地"],
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-8400 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i5-11400F / AMD Ryzen 5 5600", gpu_min:"NVIDIA GTX 1060 6GB / AMD RX 580 8GB", gpu_rec:"NVIDIA RTX 3060 12GB / AMD RX 6600 XT", ram_min:8, ram_rec:16, storage_min:60, storage_rec:60, directx:"DirectX 12", notes:"塔防 + RPG 探索。3D 场景 + 卡通渲染。中等规模。" }
  },
  {
    title_match: "解限机",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-9400F / AMD Ryzen 5 2600", cpu_rec:"Intel Core i7-10700 / AMD Ryzen 5 5600X", gpu_min:"NVIDIA GTX 1660 / AMD RX 590", gpu_rec:"NVIDIA RTX 3060 Ti / AMD RX 6700 XT", ram_min:8, ram_rec:16, storage_min:80, storage_rec:100, directx:"DirectX 12", notes:"机甲对战。同屏大量粒子特效 + 破坏场景, 对 GPU 有一定要求。免费游玩 + 机甲付费。" }
  },
  {
    title_match: "逆水寒",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-10400F / AMD Ryzen 5 3600", cpu_rec:"Intel Core i7-13700K / AMD Ryzen 7 7800X3D", gpu_min:"NVIDIA RTX 2060 6GB / AMD RX 6600", gpu_rec:"NVIDIA RTX 4070 Ti SUPER / AMD RX 7900 GRE", ram_min:16, ram_rec:32, storage_min:150, storage_rec:200, directx:"DirectX 12 Ultimate", notes:'开放世界武侠, 超大规模无缝地图, 海量 NPC 同屏。"呼吸江湖"版本持续扩大安装体积。' }
  },
  {
    title_match: "永劫无间",
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 10 64-bit", cpu_min:"Intel Core i5 9400F / AMD Ryzen 5 2600", cpu_rec:"Intel Core i7 10700 / AMD Ryzen 7 5800X", gpu_min:"NVIDIA GTX 1060 6GB", gpu_rec:"NVIDIA RTX 3060 Ti / AMD RX 6700 XT", ram_min:8, ram_rec:16, storage_min:50, storage_rec:80, directx:"DirectX 11", notes:"多人武侠竞技。稳定 144fps 竞技体验需中高端 CPU。每赛季更新带来增量 5~10GB。" }
  },
  {
    title_match: "幻兽帕鲁",
    fallback_titles: ["Palworld"],
    fields: { os_min:"Windows 10 64-bit", os_rec:"Windows 11 64-bit", cpu_min:"Intel Core i5-7500 / AMD Ryzen 5 1600", cpu_rec:"Intel Core i7-11700K / AMD Ryzen 7 5800X", gpu_min:"NVIDIA GTX 1050 Ti 4GB", gpu_rec:"NVIDIA RTX 2070 Super / AMD RX 5700 XT", ram_min:16, ram_rec:32, storage_min:40, storage_rec:40, directx:"DirectX 12", notes:"开放世界生存 + 抓幻兽。多人服务器对 CPU 压力较大, 单机玩配置友好。" }
  },
];

// ── 3. 拉 games 表 ────────────────────────────────────
async function main() {
  console.log("📦 从 Supabase 拉 games 列表...");
  const { data: games, error: gamesErr } = await supabase
    .from("games")
    .select("id, title, hype_score")
    .order("hype_score", { ascending: false, nullsFirst: false });
  if (gamesErr) {
    console.error("❌ games 查询失败:", gamesErr);
    process.exit(1);
  }
  console.log(`  ✓ 拿到 ${games.length} 款游戏`);

  // 模糊匹配辅助: 先按 exact 再按 includes(title) / includes(data_title)
  function findGameId(entry) {
    const titles = [entry.title_match, ...(entry.fallback_titles || [])];
    // exact
    for (const t of titles) {
      const hit = games.find((g) => g.title === t);
      if (hit) return hit;
    }
    // case-insensitive includes
    for (const t of titles) {
      const low = t.toLowerCase();
      const hit = games.find((g) => {
        if (entry.exclude_keywords && entry.exclude_keywords.some((k) => g.title.toLowerCase().includes(k.toLowerCase()))) return false;
        return g.title.toLowerCase().includes(low) || low.includes(g.title.toLowerCase());
      });
      if (hit) return hit;
    }
    if (entry.use_fuzzy_not_exact) {
      const low = entry.title_match.toLowerCase();
      const candidates = games.filter((g) => {
        if (entry.exclude_keywords && entry.exclude_keywords.some((k) => g.title.toLowerCase().includes(k.toLowerCase()))) return false;
        return g.title.toLowerCase().includes(low) || low.includes(g.title.toLowerCase());
      });
      // 取 hype_score 最高的
      candidates.sort((a, b) => (b.hype_score || 0) - (a.hype_score || 0));
      if (candidates[0]) return candidates[0];
    }
    return null;
  }

  const stats = { inserted: 0, updated: 0, skippedNoMatch: 0, errors: 0 };
  const skipped = [];
  const errors = [];

  for (const entry of DATA) {
    const game = findGameId(entry);
    if (!game) {
      stats.skippedNoMatch++;
      skipped.push(entry.title_match);
      continue;
    }
    const payload = {
      game_id: game.id,
      ...entry.fields,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("game_requirements")
        .upsert(payload, { onConflict: "game_id", count: "exact" });
      if (error) throw error;
      // upsert 无法区分 INSERT vs UPDATE, 粗略统计为 "写入"
      stats.inserted++;
      console.log(`  ✅ ${game.title} (热度${game.hype_score ?? "-"}) 写入成功`);
    } catch (err) {
      stats.errors++;
      errors.push({ title: entry.title_match, db_title: game?.title, error: String(err?.message || err) });
      console.log(`  ❌ ${entry.title_match} 失败:`, err?.message || err);
    }
  }

  console.log("\n═══ 执行结果 ═══");
  console.log(`成功写入 (含 UPDATE): ${stats.inserted} / ${DATA.length}`);
  console.log(`未匹配 (games 表里没有):  ${stats.skippedNoMatch}`);
  console.log(`写入报错:                  ${stats.errors}`);
  if (skipped.length) console.log("  未匹配的 title_match:", skipped.join(", "));
  if (errors.length) console.log("  报错详情:", errors);

  // 最后的统计: SELECT COUNT(*) FROM game_requirements
  const { count, error: cntErr } = await supabase
    .from("game_requirements")
    .select("*", { count: "exact", head: true });
  if (!cntErr) console.log(`\n📊 当前 game_requirements 表里共 ${count} 条数据。`);

  // 提示
  console.log("\n💡 如 game_requirements 表尚未建, 请在 Supabase SQL Editor 中跑:\n   seed_game_requirements_20260801.sql 开头的 CREATE TABLE IF NOT EXISTS 段落 (或整个文件跑一遍)");
}

main().catch((e) => {
  console.error("💥 脚本异常:", e);
  process.exit(1);
});
