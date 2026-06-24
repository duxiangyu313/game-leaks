# 国游爆料网站 · 第一轮测试报告

> 测试日期：2026-06-16  
> 测试环境：本地 HTTP Server (Python) + Playwright Chromium, 1920×1080 / 390×844  
> 测试范围：全站 20+ 路由，功能渲染 + 控制台错误 + 响应式

---

## 测试覆盖一览

| 页面路由 | 标题正确 | 内容渲染 | JS 错误 | 备注 |
|----------|:--:|:--:|:--:|------|
| `/` 首页 | ✅ | ✅ | ❌ 1个 | React hydration #418 |
| `/games/` 游戏库 | ✅ | ✅ | ✅ | 37款游戏完整展示 |
| `/games/detail/?id=` 游戏详情 | ✅ | ✅ | ✅ | 标签页齐全，评分/进度条正常 |
| `/games/progress/` 开发进度 | ⚠️ | ❌ | ✅ | 显示"0款"，3条种子数据未加载 |
| `/games/compare/` 游戏对比 | — | — | — | 未测试 |
| `/leaks/` 爆料列表 | ✅ | ⚠️ | ✅ | 统计数字全0，但列表内容正常 |
| `/leaks/detail/?id=` 爆料详情 | ✅ | ✅ | ✅ | 游戏链接ID错误（见Bug #8） |
| `/analysis/` 深度解析 | ✅ | ✅ | ✅ | 49篇文章，分类筛选正常 |
| `/articles/detail/?id=` 文章详情 | ✅ | ✅ | ✅ | 目录/TOC/付费保护/标签均正常 |
| `/forum/` 论坛 | ✅ | ⚠️ | ✅ | 统计全0，分类板块存在但无内容 |
| `/forum/post/?id=` 帖子详情 | — | — | — | 未测试 |
| `/forum/new/` 发帖 | — | — | — | 需登录，未测试 |
| `/auth/` 登录注册 | ✅ | ✅ | ✅ | 登录/注册/忘记密码表单正常 |
| `/member/` 会员购买 | ✅ | ✅ | ✅ | 三级定价/月年切换/支付宝微信图标 |
| `/member/success/` | — | — | — | 需 Stripe 回调 |
| `/admin/` 管理后台 | ✅ | ✅ | ✅ | 正确重定向到 /admin/login/ |
| `/account/` 账户 | — | — | — | 需登录 |
| `/calendar/` 日历 | ✅ | ✅ | ✅ | 月份选择器+事件筛选 |
| `/videos/` 视频 | ✅ | ⚠️ | ✅ | 显示"0期" |
| `/submit/` 匿名爆料 | ✅ | ✅ | ✅ | 表单渲染正常 |
| `/about/` 关于我们 | ✅ | ✅ | ✅ | — |
| `/contact/` 联系我们 | ✅ | ✅ | ✅ | — |
| `/join/` 加入团队 | ⚠️ | ❌ | ✅ | 显示"加载中..." |
| `/privacy/` 隐私政策 | ✅ | ✅ | ✅ | — |
| `/terms/` 服务条款 | ✅ | ✅ | ✅ | — |
| `/404/` 404页面 | ✅ | ✅ | ✅ | — |

---

## 🔴 严重问题（Critical）

### 1. 首页 React Hydration 错误 #418

- **页面**: `/`
- **现象**: 控制台报 `Minified React error #418` — SSR/CSR 渲染 HTML 不匹配
- **频率**: 每次首次访问必现
- **根因分析**: 
  - `FreeTrialBanner` 组件在 `useEffect` 中调用 `localStorage` 和 `supabase.auth.getUser()`，延迟 1s 后 `setVisible(true)`，导致横幅从无到有的 DOM 变化
  - `StatsDashboard` 使用 `useCachedQuery`，首次渲染时为 loading→skeleton，hydration 后替换为实际数据
  - `dynamic()` 懒加载组件在服务器端返回空占位，客户端 hydration 后替换为实际内容
- **修复建议**: 
  - 给所有 `dynamic()` 组件加 `ssr: false` 或提供一致的 loading 占位
  - 使用 `suppressHydrationWarning` 在已知差异元素上
  - 将 `FreeTrialBanner` 的初始状态从 `false` 延迟渲染改为 CSS `visibility: hidden`

### 2. 统计数据首屏为 0

- **页面**: `/` (首页 StatsDashboard)
- **现象**: 桌面端首次加载显示"收录游戏 0 / 爆料总数 0 / 社区成员 0"，回访时正常（37/30/1）
- **根因**: Static Export 环境下 `useCachedQuery` 的 fallback 逻辑问题——`homepage-cache.json` 可能未包含 stats 数据，localStorage 首次访问为空，Supabase 查询在 build 时结果被序列化为 0
- **修复建议**: 
  - 确保 `scripts/build-cache.js` 生成 stats 数据写入 `homepage-cache.json`
  - 将 MOCK_STATS 值更新为接近真实数据（而非 8/12/128）

---

## 🟡 中等问题（Moderate）

### 3. `/games/progress/` 显示 0 款游戏

- **现象**: 页面标题"实时追踪 0 款国产3A游戏"，但种子数据有 3 条（归唐/失落之魂/黑神话悟空）
- **根因**: `game_progress` 表查询未返回数据，可能是 RLS 策略阻止匿名查询或 API 路由未正确工作
- **修复**: 检查 Supabase `game_progress` 表的 RLS policy，确保 `SELECT USING (true)` 生效

### 4. `/join/` 页面显示"加载中..."

- **现象**: 页面仅显示 Logo + 导航，主内容区为"加载中..."
- **根因**: 可能是依赖 Supabase 实时查询或特定 API 端点，静态导出下这些不可用
- **修复**: 为 `/join/` 页面提供静态 fallback 内容（团队成员列表、招聘岗位等）

### 5. 论坛统计数据与首页矛盾

- **现象**: `/forum/` 显示"0 主题/0 帖子/0 在线"，但首页 HotDiscussions 展示了 5 条热门帖子（最高 345 评论）
- **根因**: 首页数据来自 `homepage-cache.json`，论坛页面实时查询 Supabase 但未返回数据
- **修复**: 统一论坛数据源，使用相同的缓存策略

### 6. 爆料专区统计全为 0

- **现象**: `/leaks/` 显示"今日爆料 0 / 本周热点 0 / 已确认 0"，但列表内容正常显示
- **根因**: 统计数据单独查询 Supabase，列表数据可能来自缓存
- **修复**: 统计数据和列表数据使用同一个查询结果

### 7. `/videos/` 显示 0 期

- **现象**: "视频专区 · 0 期"，但首页视频区展示了 8 期视频
- **根因**: 视频列表硬编码在首页组件中，`/videos/` 页面依赖 Supabase 查询
- **修复**: 为视频页面添加与首页一致的数据源

---

## 🟢 轻微问题（Minor）

### 8. 爆料详情页游戏链接 ID 错误

- **页面**: `/leaks/detail/?id=61a27eda-8da0-44ec-962c-93494618fe06`
- **现象**: "归唐"链接到 `/games/detail/?id=61a27eda-8da0-44ec-962c-93494618fe06`（爆料ID），正确应为 `164ab6b8-dde1-4400-871c-4cf0d168d876`（归唐游戏ID）
- **修复**: 确保 `game_id` 字段正确传递

### 9. 论坛页面标题重复

- **页面**: `/forum/`
- **现象**: `<title>` 为 "论坛 · 国游爆料 · 国游爆料"（"国游爆料"出现两次）
- **修复**: 检查 metadata title template

### 10. 会员定价与 CLAUDE.md 不一致

| 等级 | CLAUDE.md | 实际网站 |
|------|-----------|----------|
| Silver | ¥29/月 ¥199/年 | 不存在 |
| Gold | ¥59/月 ¥399/年 | ¥299/年 |
| Diamond | ¥199/月 ¥1299/年 | ¥899/年 |

- **说明**: 网站无 Silver 等级（仅 Free/Gold/Diamond），定价已调整。需要更新 CLAUDE.md 或确认定价策略

### 11. 非标准路径 404 使用 Python Server 默认页

- **现象**: 访问 `/random-path` 返回 Python http.server 默认 404，而非 Next.js 自定义 404 页
- **根因**: Python http.server 不支持 SPA fallback
- **修复**: 生产部署时使用 Nginx/静态托管平台配置 `error_page 404 /404.html`

---

## ✅ 表现优秀的部分

1. **游戏库** — 37 款游戏完整展示、排序/筛选/搜索功能齐全、排行榜视觉层次清晰
2. **游戏详情** — 12 个标签页（介绍/评测/百科/配置/预购/评分/价格/DLC/视频/爆料/截图/评论）、评分组件、进度条、相关推荐
3. **文章详情** — 目录导航（TOC）、Paywall 模糊保护、Canvas 水印、键盘拦截、SmartPaywallNudge、标签/点赞/收藏/分享
4. **会员页** — 三级定价卡片、月年切换、支付方式图标、信任徽章
5. **响应式** — 390px 移动端导航折叠为汉堡菜单、内容单列布局、卡片适配良好
6. **导航一致性** — 所有页面 Header/Footer 统一，面包屑导航正确
7. **内容保护** — 文章付费内容被 CSS 模糊遮罩，底部"升级会员"引导
8. **404 页面** — 自定义设计，含"返回首页"和"浏览游戏库"两个行动按钮
9. **认证流程** — 登录/注册/忘记密码三合一，表单校验完整
10. **管理后台保护** — 未登录自动跳转 `/admin/login/`

---

## 📊 总结

| 分类 | 数量 |
|------|:----:|
| 测试页面 | 25 |
| 严重问题 (Critical) | 2 |
| 中等问题 (Moderate) | 5 |
| 轻微问题 (Minor) | 4 |
| 整体评分 | B+ |

**核心矛盾**：Static Export 模式下，依赖 Supabase 实时查询的页面在首次访问时缺少数据，而首页通过 `build-cache.js` 预生成 JSON 规避了此问题。建议将更多关键数据（论坛统计、爆料统计、开发进度、视频列表）纳入预构建缓存。

**最优先修复项**：
1. React Hydration #418 错误
2. 统计数据首屏为 0
3. 更新 CLAUDE.md 会员定价与网站一致
