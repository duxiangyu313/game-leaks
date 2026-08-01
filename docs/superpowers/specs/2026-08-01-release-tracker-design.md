# 发售日历 + 邮件提醒工具 — 设计规格

> 日期: 2026-08-01
> 状态: 已批准

## 概述

在现有 `/calendar` 页面上增加事件订阅功能。用户可对任意日历事件（发售/测试/展会/demo 等）一键订阅邮件提醒，选择提前 1/3/7 天通知。后端通过 Supabase Edge Function + Resend 每日定时扫描并发送提醒邮件。

## 数据库

### 新建表: `event_subscriptions`

```sql
CREATE TABLE public.event_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.game_events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notify_days INT DEFAULT 1,
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email)
);
```

### RLS 策略

- INSERT: 公开（匿名用户也可订阅）
- SELECT: 公开（通过 email 匹配查询自己的订阅）
- DELETE: 公开（通过 email 匹配删除自己的订阅）

## 前端

### 页面: `/calendar`（增强现有页面）

在 `src/app/calendar/page.tsx` 中新增：

1. **「我的订阅」面板**（页面顶部，折叠式）
   - 输入邮箱查看已订阅列表
   - 每条显示：事件标题、日期、提前天数、取消按钮
   - 邮箱缓存在 localStorage

2. **事件卡片订阅按钮**
   - 每个事件卡片右下角增加「提醒我」按钮
   - 点击展开微型表单：邮箱输入 + 提前天数选择（1/3/7天，默认1天）
   - 已订阅事件显示「已订阅 ✓」，可点击取消
   - 登录用户自动填充邮箱

### 交互流程

```
用户看到感兴趣事件
→ 点「提醒我」
→ 输入邮箱 + 选择提前天数
→ 提交到 event_subscriptions 表
→ 卡片状态变为「已订阅 ✓」
→ 事件前 N 天收到邮件提醒
```

### 工具箱页面更新

`src/app/tools/page.tsx` 中的占位卡片改为已上线状态，链接到 `/calendar`。

## 后端

### Edge Function: `send-event-reminders`

路径: `supabase/functions/send-event-reminders/index.ts`

**触发方式**: Supabase Cron (pg_cron)，每天 08:00 执行

**逻辑**:
1. 查询 `event_subscriptions` 中 `notified = FALSE` 的记录
2. 匹配条件: `event_date::date = CURRENT_DATE + notify_days`
3. 对每条记录调用 Resend API 发送邮件
4. 发送成功后标记 `notified = TRUE`

**邮件内容**:
- 主题: `🎮 你关注的《{游戏名}》{事件类型}即将到来`
- 正文: 事件标题、日期、类型、详情链接
- 品牌署名: 国游爆料

**依赖**: Resend API Key（环境变量 `RESEND_API_KEY`）

## 文件变更清单

### 新建
- `supabase/seeds/seed_event_subscriptions.sql` — 建表 + RLS + 示例数据
- `supabase/functions/send-event-reminders/index.ts` — Edge Function

### 修改
- `src/app/calendar/page.tsx` — 新增订阅交互 + 我的订阅面板
- `src/app/tools/page.tsx` — 占位卡片改为已上线

### 不涉及
- Navbar 不改（日历入口已有）
- 游戏详情页不改
- 账户页不改

## 实现顺序

1. SQL 建表 + RLS 策略
2. 前端订阅交互（弹窗 + 状态管理 + 我的订阅面板）
3. Edge Function（邮件发送逻辑）
4. 工具箱占位卡片更新
