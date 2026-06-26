# QQ群每日爆料早报 · 自动化系统设计

> 创建日期: 2026-06-26
> 状态: 设计完成，待实现

---

## 1. 目标

每天早上 8:00 自动从 RSSHub 抓取 4 个核心国产游戏的官方动态，生成两份产物：
1. **QQ 群口语化早报文案**（可直接复制粘贴）
2. **网站爆料短文**（写入 Supabase leaks 表草稿箱）

支持手动触发（`npm run feed`）立即生成当日文案。

---

## 2. 架构

```
next-game-site/
├── qq-feed-bot/                  ← 新增独立模块
│   ├── package.json              ← 独立依赖 (node-cron, rss-parser, dotenv)
│   ├── config/
│   │   └── sources.json          ← 信源配置（可编辑）
│   ├── src/
│   │   ├── index.ts              ← 入口：调度器 + 手动触发
│   │   ├── fetch-rss.ts          ← RSS 抓取 + 关键词过滤 + 去重
│   │   ├── format-qq.ts          ← QQ 群早报模板格式化
│   │   ├── format-article.ts     ← 网站短文格式化
│   │   ├── publish.ts            ← 写入 Supabase + 本地文件
│   │   └── utils.ts              ← 日期/文件/去重工具
│   ├── output/
│   │   └── YYYY-MM-DD/           ← 每日产出目录
│   │       ├── qq-msg.txt        ← QQ群纯文本
│   │       ├── qq-msg.md         ← 同内容 Markdown 备查
│   │       ├── article-leaks.md   ← 网站短文
│   │       └── .fetch-log.json   ← 原始数据 debug
│   └── README.md
```

与主站共享 `.env.local`（Supabase URL/Key），不依赖 Next.js 构建。

---

## 3. 信源配置

### `config/sources.json`

```json
{
  "rsshubBase": "https://rsshub.example.com",
  "games": [
    {
      "name": "归唐",
      "slug": "guitang",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/{UID}", "enabled": true },
        { "label": "微博", "url": "/weibo/user/{UID}", "enabled": false }
      ],
      "keywords": ["归唐", "Return To Tang", "网易3A"]
    },
    {
      "name": "影之刃零",
      "slug": "phantom-blade-zero",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/{UID}", "enabled": true }
      ],
      "keywords": ["影之刃零", "Phantom Blade Zero", "灵游坊", "梁其伟"]
    },
    {
      "name": "燕云十六声",
      "slug": "where-winds-meet",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/{UID}", "enabled": true }
      ],
      "keywords": ["燕云十六声", "燕云", "Where Winds Meet", "网易"]
    },
    {
      "name": "诡秘之主",
      "slug": "lord-of-mysteries",
      "rss": [
        { "label": "B站动态", "url": "/bilibili/user/dynamic/{UID}", "enabled": true }
      ],
      "keywords": ["诡秘之主", "Lord of Mysteries", "弹指宇宙", "快手"]
    }
  ]
}
```

- RSSHub URL 中的 `{UID}` 替换为实际 B 站/微博 UID
- `enabled: false` 可随时关闭不稳定信源
- `keywords` 二次过滤：RSS 标题不含任一关键词则丢弃

---

## 4. 数据流

```
sources.json
    │
    ▼
┌──────────────┐
│  fetch-rss    │  ← rss-parser 逐源抓取
│  (并发请求)    │    过滤: title 含任一 keyword
│               │    去重: title 80%相似 → 仅保留先抓到的那条
└──────┬───────┘
       │ items[]
       ▼
┌──────────────┐
│  format-qq    │  → qq-msg.txt / qq-msg.md
│  format-article│  → article-leaks.md
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  publish      │  → 写入 Supabase leaks 表 (status: "draft")
│               │  → 保存 output/YYYY-MM-DD/ 本地文件
│               │  → console.log(qq文案)
└──────────────┘
```

---

## 5. 文案模板

### QQ 群早报 (`qq-msg.txt`)

```
【06月27日 新游早报】
1. 【归唐】冯骥称世界顶尖关卡演出，金亨泰盛赞
   19分钟实机B站播放破1084万，Polygon称"战神遇到对手"
   但官方删除单机承诺动态引发信任危机
   可信度：confirmed / 10

2. 【影之刃零】所有公开内容100%是支线！主线从未展示
   知名YouTuber独家披露，核心玩法非魂like而是纯ACT
   夏天还将有15-20分钟索尼State of Play专场
   可信度：confirmed / 10

————
深度解析后续会发在网站，想看完整爆料合集的群友可以私聊我~
```

- 每条最多 3 行（标题行 + 2 条细节）
- 无爆料日生成: `【XX月XX日 新游早报】今日无重大爆料，有新消息第一时间同步。`
- 可信度自动根据 `credibility` 字段映射

### 网站短文 (`article-leaks.md`)

标准 Markdown 格式，比 QQ 群版本多一段背景描述，适配网站爆料板块格式。

---

## 6. 去重策略

两层去重：

1. **本次抓取内去重**：同一次运行中，不同源可能抓到同一事件（B站+微博都发了），用标题相似度 >80% 判定为重复，仅保留最先抓到的那条。

2. **跨日去重**：每日运行前检查 Supabase `leaks` 表最近 7 天内的 `title`，完全相同则跳过（避免重复写草稿）。

---

## 7. 调度 & 触发

| 方式 | 命令 | 说明 |
|------|------|------|
| 定时 | `npm run feed:scheduler` | node-cron `0 8 * * *` 每天早上 8:00 |
| 手动 | `npm run feed` | 立即执行一次，输出文案到控制台 |
| 测试 | `npm run feed:dry` | 仅抓取+格式化，不写入 Supabase |

在 `next-game-site/package.json` 中添加：
```json
{
  "scripts": {
    "feed": "cd qq-feed-bot && npm run feed",
    "feed:scheduler": "cd qq-feed-bot && npm run feed:scheduler",
    "feed:dry": "cd qq-feed-bot && npm run feed:dry"
  }
}
```

---

## 8. Supabase 写入

写入 `leaks` 表，字段：

| 字段 | 值 |
|------|-----|
| `title` | 游戏名 + 一句话总结（如 "归唐：19分钟实机B站播放破1084万"） |
| `summary` | QQ 早报中该条的 2 行细节合并 |
| `content` | 完整的 `article-leaks.md` 段落 |
| `source` | 来源 RSS 标签 |
| `credibility` | `rumor` / `likely` / `confirmed`（RSS有元数据则用，否则默认 `rumor`） |
| `game_name` | 游戏名 |
| `status` | **`draft`**（草稿，需管理员在后台一键发布） |
| `published_at` | `now()` |

---

## 9. 实现文件清单

```
qq-feed-bot/
├── package.json
├── tsconfig.json
├── config/
│   └── sources.json
├── src/
│   ├── index.ts
│   ├── fetch-rss.ts
│   ├── format-qq.ts
│   ├── format-article.ts
│   ├── publish.ts
│   └── utils.ts
└── output/   (gitignore)
```

---

## 10. 待用户提供

以下信息需要在 `config/sources.json` 中填入实际值后才能正常运行：

| 项目 | 说明 |
|------|------|
| RSSHub 端点 | `rsshubBase` 字段，需一个可用的 RSSHub 实例 URL |
| 归唐 B站UID | B站官方号的 UID（从 B 站个人空间 URL 获取） |
| 影之刃零 B站UID | 灵游坊/影之刃零官方号 UID |
| 燕云十六声 B站UID | 燕云官方号 UID |
| 诡秘之主 B站UID | 弹指宇宙/诡秘之主官方号 UID |
| 微博 UID | 各游戏如需微博监控，提供微博用户 UID |

---

## 11. 限制 & 后续扩展

| 限制 | 说明 |
|------|------|
| RSSHub 依赖 | 需要可用的 RSSHub 端点。若不可用则降级为空输出 + 日志告警 |
| 可信度评级 | 默认所有 RSS 抓取内容标记为 `confirmed`（源自官方号），需人工调整的注 `rumor` |
| B 站/微博 UID | 需用户提供实际 UID 填入 `sources.json` |
| Claude API 润色 | 预留接口未启用，后续可加 `--ai` 参数调用 |
