const SUPABASE_URL = "https://gumpxfxbxxyljikaizsh.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0";

const headers = {
  "Content-Type": "application/json",
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  Prefer: "return=representation",
};

async function patchRow(id, data) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/game_progress?id=eq.${id}`,
    { method: "PATCH", headers, body: JSON.stringify(data) }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ PATCH failed (${res.status}): ${err}`);
    return null;
  }
  console.log("  ✅");
  return res.json();
}

// ─── 1-2. 影之刃零: stage→压盘阶段 + 追加版号信息 ───
const yzrlNewInfo = `影之刃零是灵游坊开发的黑暗武侠动作RPG，采用UE5打造武侠朋克风格。曾在S-Party 2025千人线下试玩，IGN放出22分钟实机演示。定档2026年10月29日全球发售。2026年7月洛杉矶闭门试玩获外媒好评；夏季开启预购；索尼将举办专场State of Play。

【2026.07.23 版号获批】国家新闻出版署7月版号公告：正式获批客户端+PS5双端版号，成为继《黑神话：悟空》后国内第二款获批版号的国产买断制3A游戏。同批193款国产+4款进口游戏过审。10月29日全球发售已无监管障碍。`;

console.log("1-2. 影之刃零: stage→压盘阶段 + 追加版号信息");
await patchRow("ce98b203-f83b-44f4-8540-6bcc1b838486", {
  development_stage: "压盘阶段",
  public_info: yzrlNewInfo,
});

// ─── 3-5. 昭和米国物语: stage→原型开发 + 科隆信息 + 发售日→2026 ───
const zhNewInfo = `2026年7月23日，铃空游戏正式宣布参展2026科隆游戏展（8月26-30日），将首次提供线下实机试玩并发布全新预告片，打破外界"项目搁浅"猜测。预计2026年发售，登陆PS5/PC（Steam），支持中日英三语配音，主线超20小时。自2022年首支预告轰动海内外后，经历2025年延期，现已进入发售前最后冲刺阶段。`;

console.log("3-5. 昭和米国物语: stage→原型开发 + 追加科隆信息 + 发售日→2026");
await patchRow("d1aae218-a86f-4061-8328-c9e59bf0e67a", {
  development_stage: "原型开发",
  estimated_release_date: "2026",
  public_info: zhNewInfo,
});

// ─── 6-7. 雾影猎人: stage→压盘阶段 + XGP/S1信息 ───
const wylrNewInfo = `UE5黑暗奇幻PvPvE动作搜打撤游戏；定档2026年7月30日全球发售（PC/PS5/XSX|S）；标准版88元/豪华版138元（首发14天限时折扣）；Steam新品节双榜登顶（43万+玩家测试）。

【2026.07 发售前最终信息】首发加入Xbox Game Pass，S1赛季"灵魂追猎"同步上线，新增枪盾武器流派"凋零骑士"。首发14天限时9折（官网渠道最低70元起），支持跨平台联机。倒计时6天！`;

console.log("6-7. 雾影猎人: stage→压盘阶段 + 追加XGP/S1信息");
await patchRow("c7671961-2e48-47b9-943e-f6ef698834f3", {
  development_stage: "压盘阶段",
  public_info: wylrNewInfo,
});

// ─── 8-9. 锦衣卫: 追加CJ信息 + credibility 6→7 ───
const jywNewInfo = `成都离忧工作室开发的明末谍战武侠ARPG，索尼中国之星计划第三期作品。核心机制为"推演"时间回溯能力——可在箱庭关卡中时空穿梭回溯，保留信息与道具。BW2026首次公开试玩获好评，确认参展2026 ChinaJoy（N1G001索尼展台+N1G102顺网展台）。计划登陆PC/PS5。战斗以真气为核心资源，支持格挡/闪避/弹反。战斗手感偏软仍是后续优化重点。`;

console.log("8-9. 锦衣卫: 追加CJ信息 + credibility 6→7");
await patchRow("7631bb44-c104-4cf1-b181-28695083f8ec", {
  public_info: jywNewInfo,
  credibility_score: 7,
});

// ─── 10. 古剑: 追加试玩Boss信息 ───
const gjNewInfo = `古剑（古剑奇谭四）是上海烛龙开发的UE5动作RPG，玩家扮演地界司判游走阴阳两界，中式志怪+幽冥国风。买断制登陆PC/PS5/XSX。2026年7月18-19日上海美术馆首次大规模线下试玩会引发类魂争议冲上热搜；新角色牛头人/茶壶头武士等Boss曝光；项目负责人薛岭回应中期版本还在打磨；IGN中国41分钟实机前瞻评价"比想象中更能打"。

【2026.07.18-19 试玩会细节】Boss设计更多曝光：彩衣侯·空空子、无头剑客、三尾猫妖"三命"等。官方强调"不是魂like，没有开放世界大地图"，主线流程约20-25小时。融入剧情解谜元素，纸人召唤牛头马面设定颇具特色。计划全球同步登陆PS5/XSX|S/PC。`;

console.log("10. 古剑: 追加试玩Boss信息");
await patchRow("72a8230f-259b-4590-b8d3-70733772fa44", {
  public_info: gjNewInfo,
});

console.log("\n═══════════════════════════");
console.log("✅ 全部更新完成！（10条/5款游戏）");
console.log("═══════════════════════════");
console.log("\n⚠️  development_stage 使用了当前约束允许的值。");
console.log("   更精确的值（'已获版号'/'即将发售'/'开发中'）需要先在 Supabase SQL Editor 执行：");
console.log("   supabase/migrations/20260724_expand_development_stages.sql");
