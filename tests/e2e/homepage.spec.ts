/**
 * 首页 E2E 测试 — 核心页面可访问性验证
 *
 * 运行方式:
 *   npx playwright test
 *
 * 前置条件:
 *   1. npx playwright install chromium
 *   2. 构建静态文件: npm run build
 *   3. 启动服务: npx serve live -l 3000
 */
import { test, expect } from "@playwright/test";

test.describe("首页", () => {
  test("加载成功，显示标题", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const title = await page.title();
    expect(title).toContain("国游");
  });

  test("导航到游戏库", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const gameLink = page.locator('a[href*="/games"]').first();
    if (await gameLink.isVisible()) {
      await gameLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/games");
    }
  });
});

test.describe("静态页面", () => {
  for (const path of ["/about", "/contact", "/privacy", "/terms"]) {
    test(`${path} 加载成功`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await page.title()).toBeTruthy();
    });
  }
});

test.describe("关键页面", () => {
  test("登录页可访问", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    expect(await page.title()).toBeTruthy();
  });

  test("会员页可访问", async ({ page }) => {
    await page.goto("/member");
    await page.waitForLoadState("networkidle");
    expect(await page.title()).toBeTruthy();
  });

  test("游戏库可访问", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");
    expect(await page.title()).toBeTruthy();
  });
});
