# 网站免费化 + PWA + 工具 MVP 规划

> 本文档供 Claude Code 执行。每个任务包含具体文件路径、改动内容、代码示例和验收标准。

---

## 概述

| 任务 | 目标 | 优先级 |
|---|---|:---:|
| 任务一 | 网站所有付费内容免费化(保留代码不删除) | P0 |
| 任务二 | 添加 PWA 支持 | P0 |
| 任务三 | 添加基础版免费试用工具(配置检测) | P1 |

**执行顺序**:任务一 → 任务二 → 任务三

---

## 任务一:网站内容免费化

### 1.1 策略

**核心原则**:不删除任何现有代码,通过全局开关 `FREE_MODE` 禁用所有付费墙逻辑。

- 新建 `src/lib/site-config.ts`,定义 `FREE_MODE = true`
- 修改所有付费墙相关组件,当 `FREE_MODE` 为 true 时直接放行
- 数据库层面:写 SQL 迁移把所有 `articles.required_tier` 设为 `'free'`
- 保留所有付费墙组件代码,方便未来重新启用

### 1.2 新建文件

#### 文件:`src/lib/site-config.ts`

```ts
/**
 * 网站全局配置
 * FREE_MODE = true 时,所有付费内容免费开放,付费墙逻辑全部禁用
 * 未来如需恢复付费模式,改为 false 即可
 */
export const FREE_MODE = true;

/**
 * 工具免费试用配置
 */
export const TOOL_FREE_LIMIT = {
  reqCheck: {
    dailyLimit: 3,        // 每日免费检测次数
    storageKey: "tool_req_check_count",
  },
};
```

### 1.3 修改文件清单

#### 1.3.1 `src/lib/auth.ts`

**改动**:在 `hasAccess` 和 `hasContentAccess` 函数开头加 `FREE_MODE` 短路返回。

```ts
import { FREE_MODE } from "@/lib/site-config";

export function hasAccess(userLevel: MembershipLevel, requiredLevel: Visibility): boolean {
  if (FREE_MODE) return true;  // ← 新增
  if (requiredLevel === "public") return true;
  return LEVEL_RANK[userLevel] >= (LEVEL_RANK[requiredLevel as MembershipLevel] ?? 0);
}

export function hasContentAccess(userLevel: MembershipLevel, contentLevel: ContentLevel): boolean {
  if (FREE_MODE) return true;  // ← 新增
  const CR: Record<ContentLevel, number> = { free: 0, gold: 1, diamond: 2 };
  return LEVEL_RANK[userLevel] >= (CR[contentLevel] ?? 0);
}
```

#### 1.3.2 `src/components/article/PaywallBlur.tsx`

**改动**:组件开头加 `FREE_MODE` 判断,直接渲染 children。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 在 rank 比较之前:
if (FREE_MODE) return <>{children}</>;
```

#### 1.3.3 `src/components/article/SmartPaywallNudge.tsx`

**改动**:组件开头加 `FREE_MODE` 判断,不显示付费引导。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 组件函数开头:
if (FREE_MODE) return null;
```

#### 1.3.4 `src/components/article/ArticleTemplate.tsx`

**改动**:`isPaid` 逻辑加 `FREE_MODE` 判断。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 第 42 行附近:
const isPaid = !FREE_MODE && article.requiredTier !== "free";
```

#### 1.3.5 `src/app/articles/detail/page.tsx`

**改动**:键盘拦截和 Canvas 水印的挂载条件加 `FREE_MODE` 判断。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 第 82 行附近(键盘拦截挂载条件):
// 原来: {isPaid && <ContentProtection ...>} 或内联实现
// 改为: {!FREE_MODE && isPaid && (...键盘拦截...)}

// 第 94 行附近(Canvas 水印挂载条件):
// 原来: {isPaid && <canvas ref={canvasRef} ... />}
// 改为: {!FREE_MODE && isPaid && <canvas ref={canvasRef} ... />}
```

**注意**:此文件有两处需要改,分别是键盘拦截(`blockKeys` 事件监听器的挂载)和 Canvas 水印的渲染。搜索 `isPaid` 关键字找到所有使用点,在每个条件前加 `!FREE_MODE &&`。

#### 1.3.6 `src/components/MembershipGate.tsx`

**改动**:组件开头加 `FREE_MODE` 判断,直接渲染 children。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 在会员等级检查之前:
if (FREE_MODE) return <>{children}</>;
```

#### 1.3.7 `src/components/protection/ContentProtection.tsx`

**改动**:键盘拦截和 Canvas 水印逻辑加 `FREE_MODE` 判断。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// useEffect 中:
useEffect(() => {
  if (FREE_MODE) return;  // ← 新增,跳过所有拦截逻辑
  // ... 原有的键盘拦截和 contextmenu 拦截代码
}, []);

// Canvas 水印的 useEffect 同理:
useEffect(() => {
  if (FREE_MODE) return;  // ← 新增
  // ... 原有的 Canvas 水印绘制代码
}, []);
```

#### 1.3.8 `src/components/article/ImageWithWatermark.tsx`

**改动**:水印显示条件加 `FREE_MODE` 判断。

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 水印容器的渲染条件:
// 原来: 始终显示水印
// 改为: {FREE_MODE ? null : (<水印层>)}
```

### 1.4 数据库迁移 SQL

#### 文件:`supabase/migrations/20260801000000_free_all_content.sql`

```sql
-- 把所有付费文章的 required_tier 改为 free
-- 保留原值在 required_tier_backup 列,方便未来恢复
ALTER TABLE articles ADD COLUMN IF NOT EXISTS required_tier_backup TEXT;

UPDATE articles
SET required_tier_backup = required_tier,
    required_tier = 'free'
WHERE required_tier IS NOT NULL AND required_tier != 'free';

-- 验证:确认没有 gold/diamond 的文章了
SELECT required_tier, COUNT(*) FROM articles GROUP BY required_tier;
```

**执行方式**:在 Supabase 后台的 SQL Editor 中执行。

### 1.5 会员页面调整

#### `src/app/member/page.tsx`

**改动**:
1. 第 47 行的付费文章统计,加 `FREE_MODE` 判断显示 0 或隐藏
2. 会员购买页面保留(不删除),但在顶部加一个提示:"当前所有内容免费开放,会员权益调整中"

```tsx
import { FREE_MODE } from "@/lib/site-config";

// 在页面顶部加提示:
{FREE_MODE && (
  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 text-center">
    <p className="text-yellow-400">当前所有内容免费开放中,会员权益正在调整</p>
  </div>
)}

// 付费文章统计:
const paidCount = FREE_MODE ? 0 : await supabase.from("articles").in("required_tier", ["gold", "diamond"])...
```

### 1.6 验收标准

- [ ] 未登录用户可以完整阅读所有文章(包括之前 gold/diamond 的)
- [ ] 文章页面没有模糊遮罩
- [ ] 文章页面没有键盘拦截(Ctrl+C 可用)
- [ ] 文章页面没有 Canvas 水印
- [ ] 文章页面没有底部付费引导条(SmartPaywallNudge)
- [ ] 图片没有水印
- [ ] `/member` 页面仍可访问,但有"内容免费开放中"提示
- [ ] 付费墙组件代码仍然存在(未删除)
- [ ] 数据库 `articles.required_tier` 全部为 `free`
- [ ] `required_tier_backup` 列保存了原值

---

## 任务二:PWA 配置

### 2.1 需要创建的文件

#### 2.1.1 `public/manifest.json`

```json
{
  "name": "国游温度计",
  "short_name": "国游温度计",
  "description": "有温度的国产游戏观察者 - 国产3A游戏资讯、爆料、深度解析",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0A0E14",
  "theme_color": "#0A0E14",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["games", "news"],
  "lang": "zh-CN"
}
```

#### 2.1.2 `public/sw.js`(Service Worker)

简单的离线缓存策略:缓存首页和静态资源。

```javascript
const CACHE_NAME = "guoyou-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

// 安装:预缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 激活:清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// fetch:网络优先,失败回退缓存(适用于动态内容)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // 跳过 Supabase API 和 Stripe
  const url = new URL(event.request.url);
  if (url.hostname.includes("supabase") || url.hostname.includes("stripe")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 成功则缓存副本
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 网络失败,回退缓存
        return caches.match(event.request).then((cached) => cached || caches.match("/"));
      })
  );
});
```

#### 2.1.3 `public/icons/icon-192.png` 和 `public/icons/icon-512.png`

**注意**:这两个图标需要手动放置。可以从现有品牌素材 `品牌素材/国游温度计-头像.png` 裁剪生成,或用 PIL 脚本生成。

如果暂时没有图标,Claude Code 可以用以下占位方案:
- 创建 `public/icons/` 目录
- 从 `品牌素材/国游温度计-头像.png` 复制并调整尺寸(如果安装了 sharp)
- 或先创建占位文件,后续手动替换

#### 2.1.4 `src/components/PWA/RegisterSW.tsx`

```tsx
"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
        .catch((err) => console.warn("[PWA] SW registration failed:", err));
    }
  }, []);
  return null;
}
```

### 2.2 需要修改的文件

#### 2.2.1 `src/app/layout.tsx`

**改动**:在 `<head>` 区域添加 PWA 相关 meta 标签和 manifest 链接。

```tsx
// 在 metadata 对象中添加:
export const metadata: Metadata = {
  // ... 现有配置
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "国游温度计",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

// 在 <body> 中引入 RegisterSW 组件:
import RegisterSW from "@/components/PWA/RegisterSW";

// <body> 标签内最后加:
<RegisterSW />
```

### 2.3 验收标准

- [ ] `public/manifest.json` 存在且格式正确
- [ ] `public/sw.js` 存在且语法正确
- [ ] `src/components/PWA/RegisterSW.tsx` 存在
- [ ] `src/app/layout.tsx` 中有 manifest 链接和 apple meta 标签
- [ ] `npm run build` 成功(静态导出到 `live/` 目录)
- [ ] `live/manifest.json` 存在
- [ ] `live/sw.js` 存在
- [ ] Chrome DevTools → Application → Manifest 能识别到 PWA 配置
- [ ] Chrome DevTools → Application → Service Workers 能看到注册成功
- [ ] 手机浏览器访问时提示"添加到主屏幕"

---

## 任务三:基础版免费试用工具(配置检测)

### 3.1 工具说明

**工具名**:配置检测器(Req Checker)

**功能**:用户输入电脑配置 → 选择游戏 → 系统比对配置需求 → 显示能否运行

**免费策略**:每天免费 3 次,用 localStorage 记录次数。超过后显示"明日再来"。

### 3.2 数据库

**复用现有表**:`games` + `game_requirements`(如果 `game_requirements` 表存在)

**注意**:需要确认 `game_requirements` 表是否存在。如果不存在,从 `games` 表的配置字段读取(需要检查数据库类型定义)。

**如果 `game_requirements` 表不存在**,需要创建:

```sql
-- 文件:supabase/migrations/20260801000001_game_requirements.sql
CREATE TABLE IF NOT EXISTS game_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'minimum',  -- minimum / recommended / ultra
  cpu_min TEXT,
  cpu_rec TEXT,
  gpu_min TEXT,
  gpu_rec TEXT,
  ram_min INTEGER,   -- GB
  ram_rec INTEGER,
  storage_min INTEGER, -- GB
  storage_rec INTEGER,
  os_min TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, tier)
);

-- 添加 RLS
ALTER TABLE game_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read requirements" ON game_requirements FOR SELECT USING (true);
```

### 3.3 新建文件清单

#### 3.3.1 `src/app/tools/layout.tsx`

```tsx
import Link from "next/link";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0A0E14]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">工具箱</h1>
          <p className="text-gray-400 mt-2">国产游戏实用工具集合</p>
        </div>
        <nav className="flex gap-4 mb-8 border-b border-gray-800 pb-4">
          <Link href="/tools/req-check" className="text-[#F5A623] hover:underline">
            配置检测
          </Link>
          {/* 未来更多工具入口 */}
        </nav>
        {children}
      </div>
    </div>
  );
}
```

#### 3.3.2 `src/app/tools/req-check/page.tsx`

这是核心页面。功能流程:

1. 用户输入电脑配置(CPU 型号、GPU 型号、内存 GB、存储 GB)
   - 提供"自动检测"按钮(用 `navigator.hardwareConcurrency` 获取 CPU 核心数,`navigator.deviceMemory` 获取内存)
2. 用户选择一款游戏(搜索/下拉选择)
3. 系统比对配置:CPU/GPU 靠关键词匹配,内存/存储靠数值比较
4. 显示结果:✅ 可运行 / ⚠️ 勉强可运行 / ❌ 无法运行
5. 每日免费 3 次,localStorage 记录

```tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { TOOL_FREE_LIMIT } from "@/lib/site-config";

interface UserConfig {
  cpu: string;
  gpu: string;
  ram: number;
  storage: number;
}

interface GameRequirement {
  game_id: string;
  game_title: string;
  cpu_min: string;
  cpu_rec: string;
  gpu_min: string;
  gpu_rec: string;
  ram_min: number;
  ram_rec: number;
  storage_min: number;
  storage_rec: number;
}

export default function ReqCheckPage() {
  const [config, setConfig] = useState<UserConfig>({ cpu: "", gpu: "", ram: 0, storage: 0 });
  const [games, setGames] = useState<{ id: string; title: string }[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [requirement, setRequirement] = useState<GameRequirement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState<number>(0);

  // 初始化:加载游戏列表 + 检查剩余次数
  useEffect(() => {
    loadGames();
    checkRemainingCount();
  }, []);

  async function loadGames() {
    const { data } = await supabase.from("games").select("id, title").order("title");
    if (data) setGames(data);
  }

  function checkRemainingCount() {
    const today = new Date().toISOString().split("T")[0];
    const key = TOOL_FREE_LIMIT.reqCheck.storageKey;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setRemainingCount(Math.max(0, TOOL_FREE_LIMIT.reqCheck.dailyLimit - parsed.count));
      } else {
        setRemainingCount(TOOL_FREE_LIMIT.reqCheck.dailyLimit);
      }
    } else {
      setRemainingCount(TOOL_FREE_LIMIT.reqCheck.dailyLimit);
    }
  }

  function incrementUsage() {
    const today = new Date().toISOString().split("T")[0];
    const key = TOOL_FREE_LIMIT.reqCheck.storageKey;
    const stored = localStorage.getItem(key);
    let count = 1;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) count = parsed.count + 1;
    }
    localStorage.setItem(key, JSON.stringify({ date: today, count }));
    setRemainingCount(Math.max(0, TOOL_FREE_LIMIT.reqCheck.dailyLimit - count));
  }

  // 自动检测配置(浏览器 API 有限,只能获取核心数和内存)
  function autoDetect() {
    const cores = navigator.hardwareConcurrency || 0;
    const memory = (navigator as any).deviceMemory || 0;
    setConfig((prev) => ({
      ...prev,
      cpu: cores ? `${cores} 核心` : "",
      ram: memory ? Math.round(memory) : 0,
    }));
  }

  // 执行检测
  async function handleCheck() {
    if (remainingCount <= 0) {
      alert("今日免费检测次数已用完,明日再来!");
      return;
    }
    if (!selectedGame || !config.cpu || !config.gpu || !config.ram) {
      alert("请填写完整配置并选择游戏");
      return;
    }

    // 查询游戏配置需求
    const { data: reqData } = await supabase
      .from("game_requirements")
      .select("*, games(title)")
      .eq("game_id", selectedGame)
      .eq("tier", "minimum")
      .maybeSingle();

    if (!reqData) {
      alert("该游戏暂无配置需求数据");
      return;
    }

    // 比对逻辑(简化版:内存和存储用数值比较,CPU/GPU 用关键词包含匹配)
    const ramOk = config.ram >= (reqData.ram_min || 0);
    const storageOk = config.storage >= (reqData.storage_min || 0);
    const cpuOk = reqData.cpu_min ? config.cpu.toLowerCase().includes(reqData.cpu_min.toLowerCase().split(" ")[0]) : true;
    const gpuOk = reqData.gpu_min ? config.gpu.toLowerCase().includes(reqData.gpu_min.toLowerCase().split(" ")[0]) : true;

    let verdict: string;
    if (ramOk && storageOk && cpuOk && gpuOk) {
      verdict = "✅ 可以运行";
    } else if (ramOk && storageOk) {
      verdict = "⚠️ 勉强可运行(CPU/GPU 可能不达标)";
    } else {
      verdict = "❌ 无法运行(内存或存储不足)";
    }

    setResult(verdict);
    setRequirement({ ...reqData, game_title: reqData.games?.title || "" });
    incrementUsage();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 剩余次数提示 */}
      <div className="bg-[#1A1A2E] rounded-lg p-4 mb-6 flex justify-between items-center">
        <span className="text-gray-400">今日剩余免费检测次数</span>
        <span className="text-[#F5A623] font-bold text-xl">{remainingCount} / {TOOL_FREE_LIMIT.reqCheck.dailyLimit}</span>
      </div>

      {/* 配置输入区 */}
      <div className="bg-[#1A1A2E] rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">你的电脑配置</h2>
          <button onClick={autoDetect} className="text-sm text-[#F5A623] hover:underline">
            自动检测
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">CPU</label>
            <input
              value={config.cpu}
              onChange={(e) => setConfig({ ...config, cpu: e.target.value })}
              placeholder="如:Intel i5-12400"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 mt-1 border border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">显卡 GPU</label>
            <input
              value={config.gpu}
              onChange={(e) => setConfig({ ...config, gpu: e.target.value })}
              placeholder="如:RTX 3060"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 mt-1 border border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">内存 (GB)</label>
            <input
              type="number"
              value={config.ram || ""}
              onChange={(e) => setConfig({ ...config, ram: Number(e.target.value) })}
              placeholder="如:16"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 mt-1 border border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm">存储 (GB)</label>
            <input
              type="number"
              value={config.storage || ""}
              onChange={(e) => setConfig({ ...config, storage: Number(e.target.value) })}
              placeholder="如:500"
              className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 mt-1 border border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* 游戏选择区 */}
      <div className="bg-[#1A1A2E] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">选择游戏</h2>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full bg-[#0A0E14] text-white rounded px-3 py-2 border border-gray-700"
        >
          <option value="">请选择游戏</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      {/* 检测按钮 */}
      <button
        onClick={handleCheck}
        disabled={remainingCount <= 0}
        className="w-full bg-[#E94560] text-white font-bold py-3 rounded-lg hover:bg-[#E94560]/80 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {remainingCount > 0 ? "开始检测" : "今日次数已用完"}
      </button>

      {/* 结果展示区 */}
      {result && requirement && (
        <div className="bg-[#1A1A2E] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-2">{requirement.game_title}</h2>
          <p className="text-2xl mb-4">{result}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">最低 CPU: {requirement.cpu_min || "未知"}</p>
              <p className="text-gray-400">最低 GPU: {requirement.gpu_min || "未知"}</p>
              <p className="text-gray-400">最低内存: {requirement.ram_min || "未知"} GB</p>
              <p className="text-gray-400">最低存储: {requirement.storage_min || "未知"} GB</p>
            </div>
          </div>
        </div>
      )}

      {/* 次数用完提示 */}
      {remainingCount === 0 && (
        <div className="bg-[#1A1A2E] rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-4">今日免费检测次数已用完</p>
          <p className="text-sm text-gray-500">每日 0:00 重置,或升级会员获取无限次数</p>
        </div>
      )}
    </div>
  );
}
```

#### 3.3.3 `src/components/Navbar.tsx` 添加工具入口

**改动**:在导航栏添加"工具箱"链接。

```tsx
// 在导航链接数组中添加:
{ href: "/tools", label: "工具箱" }
```

**位置**:在现有导航项(首页/游戏库/爆料/...)之间插入。

### 3.4 验收标准

- [ ] `/tools/req-check` 页面可访问
- [ ] 导航栏有"工具箱"入口
- [ ] 游戏下拉列表能加载游戏数据
- [ ] 填写配置 + 选择游戏 + 点击检测 → 显示结果
- [ ] 每日 3 次免费限制生效(localStorage 记录)
- [ ] 次数用完后按钮禁用并显示提示
- [ ] "自动检测"按钮能获取 CPU 核心数和内存(navigator API)
- [ ] 页面使用品牌色(#1A1A2E 背景 / #E94560 按钮 / #F5A623 强调)
- [ ] `npm run build` 成功

---

## 执行顺序

```
步骤 1:创建 src/lib/site-config.ts
    ↓
步骤 2:修改所有付费墙相关文件(任务一 1.3.1 - 1.3.8)
    ↓
步骤 3:修改 src/app/member/page.tsx(任务一 1.5)
    ↓
步骤 4:在 Supabase 后台执行数据库迁移 SQL(任务一 1.4)
    ↓
步骤 5:创建 PWA 文件(任务二 2.1.1 - 2.1.4)
    ↓
步骤 6:修改 src/app/layout.tsx(任务二 2.2.1)
    ↓
步骤 7:创建工具页面(任务三 3.3.1 - 3.3.3)
    ↓
步骤 8:在 Supabase 后台执行 game_requirements 建表 SQL(任务三 3.2,如需要)
    ↓
步骤 9:npm run build 验证
    ↓
步骤 10:本地 npm run dev 验证所有功能
```

---

## 全局注意事项

### 给 Claude Code 的执行指令

1. **不要删除任何现有代码**,只做修改或新增。所有付费墙组件保留,通过 `FREE_MODE` 开关禁用。
2. **保持品牌色一致**:背景 `#0A0E14` / 卡片 `#1A1A2E` / 强调红 `#E94560` / 强调金 `#F5A623`。
3. **Static Export 限制**:
   - 不能用动态路由(如 `[id]`),必须用 query params(如 `?id=`)
   - 不能用 `next/image` 的优化功能(已配置 `images.unoptimized: true`)
   - Service Worker 必须放在 `public/` 目录(静态文件)
4. **Tailwind v4 语法**:配置文件在 `postcss.config.mjs`,不是 `tailwind.config.js`。
5. **Supabase 查询**:用 `src/lib/supabase/client.ts` 导出的 `supabase` 实例。
6. **类型定义**:数据库类型在 `src/types/database.ts`。如果新增 `game_requirements` 表,需要在此文件添加类型定义。
7. **构建命令**:`npm run build`(依次执行 prebuild → build → postbuild)
8. **测试命令**:`npm run dev` 启动开发服务器

### 已知坑(参考 docs/常见错误与解决方案.md)

1. Windows Edge 浏览器可能锁 `live/` 目录 → 构建前关闭 Edge
2. Static Export 不支持动态路由 → 用 query params
3. RSC 载荷路径错配 → postbuild 的 `fix-rsc.js` 会修复
4. Tailwind v4 语法与 v3 不兼容 → 不要用 v3 写法
5. Bash heredoc 中 `$` 符号被展开 → 用单引号或转义

### 关于 game_requirements 表

执行前需要先确认 `game_requirements` 表是否已存在于 Supabase 中。检查方法:
1. 查看 `src/types/database.ts` 中是否有 `game_requirements` 的类型定义
2. 如果有 → 表已存在,直接使用
3. 如果没有 → 需要先建表(任务三 3.2 的 SQL)
4. 建表后需要在 `database.ts` 中补充类型定义

### 关于 PWA 图标

如果无法自动生成图标,可以:
1. 从 `品牌素材/国游温度计-头像.png` 复制到 `public/icons/`
2. 用 Python PIL 调整尺寸:
   ```python
   from PIL import Image
   img = Image.open("品牌素材/国游温度计-头像.png")
   img.resize((192, 192)).save("next-game-site/public/icons/icon-192.png")
   img.resize((512, 512)).save("next-game-site/public/icons/icon-512.png")
   ```
3. 或暂时跳过图标,PWA 仍可工作(只是没有安装图标)
