/**
 * 用 Playwright 打开 Bing 站长验证页面
 * 运行: node scripts/bing-verify.js
 */
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 先验证 meta 标签是否可访问
  console.log("1. 检查 Meta 标签...");
  await page.goto("https://news.guoyouwenduji.cc/");
  const meta = await page.$('meta[name="msvalidate.01"]');
  if (meta) {
    const content = await meta.getAttribute("content");
    console.log("   ✅ msvalidate.01 meta 标签存在:", content);
  } else {
    console.log("   ❌ 未找到 msvalidate.01 meta 标签");
  }

  // 打开 Bing 站长工具
  console.log("\n2. 打开 Bing 站长工具...");
  console.log("   请登录你的 Microsoft 账号，然后手动完成验证。");
  await page.goto("https://www.bing.com/webmasters/home");

  console.log("\n浏览器已打开，完成后关闭窗口即可。");
  console.log("按 Ctrl+C 退出...");

  // 保持浏览器打开
  await new Promise(() => {});
})();
