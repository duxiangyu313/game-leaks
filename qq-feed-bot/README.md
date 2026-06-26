# QQ群每日爆料早报

每天早上 8:00 自动抓取国产新游官方动态，生成 QQ 群早报 + 网站短文。

## 快速开始

```bash
# 安装依赖
cd qq-feed-bot && npm install

# 手动执行一次（dry run，不写数据库）
npm run feed:dry

# 手动执行一次（写入 Supabase 草稿箱）
npm run feed

# 启动定时任务（每天 8:00 自动执行）
npm run feed:scheduler
```

也可从主站根目录调用：

```bash
cd next-game-site
npm run feed         # 手动
npm run feed:dry     # 预览
npm run feed:scheduler  # 定时
```

## 配置信源

编辑 `config/sources.json`：

1. 设置 `rsshubBase` 为可用的 RSSHub 实例 URL
2. 将 `REPLACE_UID` 替换为实际 B 站/微博 UID
3. 用 `enabled: false` 临时关闭不稳定信源
4. 添加新游戏：在 `games` 数组中新增一条

## 产出文件

每次运行在 `output/YYYY-MM-DD/` 下生成：

| 文件 | 用途 |
|------|------|
| `qq-msg.txt` | QQ 群纯文本，可直接复制 |
| `qq-msg.md` | 同内容 Markdown 备查 |
| `article-leaks.md` | 网站爆料短文 |
| `.fetch-log.json` | 原始抓取数据（debug） |

同时自动写入 Supabase `leaks` 表（`status: draft`），在网站后台 `/admin/leaks` 可查看并一键发布。
