# -*- coding: utf-8 -*-
"""批量推送 2026-09-14 热点批次到 Supabase — 国游温度计
内容类型：2 篇深度分析文章(articles, required_tier=free)
- 行业观察：9月国产开测潮（用户勾选）
- 深度解析：为什么日本做不出「异环」（独立角度，与 EP32 视频错峰，不撞车）
策略：沿用 2026-09-11「全部免费 + 混发」
"""
import json, os, sys, io, uuid
from urllib import request, error
from datetime import datetime, timezone, timedelta

if (getattr(sys.stdout, "encoding", "") or "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

def load_env_local(p=".env.local"):
    try:
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k in ("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY") and not os.environ.get("SUPABASE_SERVICE_KEY"):
                    os.environ["SUPABASE_SERVICE_KEY"] = v
    except Exception:
        pass

load_env_local()
SUPABASE_URL = "https://gumpxfxbxxyljikaizsh.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

DISCLAIMER = "> ⚠️ **重要声明**：本文基于公开信息整理，部分内容为行业分析与推测，不构成投资建议。游戏开发进度、商业决策等信息均以官方最终公告为准。"

def now_cst():
    return (datetime.now(timezone(timedelta(hours=8)))).strftime("%Y-%m-%dT%H:%M:%S+08:00")

def count_words(text):
    import re
    chinese = len(re.findall(r"[\u4e00-\u9fff]", text))
    english = len(re.findall(r"[a-zA-Z]+", text))
    return chinese + english

PUBLISHED_AT = now_cst()
AUTHOR = "国游温度计编辑部"

ARTICLES = [
    {
        "title": "【行业观察】9月国产开测潮：腾讯/蛮啾/B站/爪印/37扎堆，二游·捉宠·修仙「军备竞赛」",
        "slug": "sept-2026-china-game-launch-wave",
        "excerpt": "9月14日—20日一周内29款新游开测，国产内容供给在二游、捉宠、修仙赛道高度密集：腾讯代理育碧《彩虹六号：攻势》、自研《修仙时代》，爪印《伊莫》、蛮啾《蓝色星原》、B站《闪耀吧！噜咪》、37《斗破》紧随，恺英《古龙群侠录》9/23压轴。当「捉宠+开放世界」成为最拥挤赛道，差异化定位正从加分项变成生死线。",
        "content": f"""{DISCLAIMER}

## 一周 29 款：开测密度创新高

GameRes 游资网统计，**2026 年 9 月 14 日—20 日共有 29 款游戏开测**。这不是某家厂商的发布会周，而是国产内容供给在多个赛道同时「补弹药」的窗口。重点产品按节奏铺开：

- **9 月 15 日**：腾讯代理育碧研发的战术 PVP 射击《彩虹六号：攻势》限量测试（5v5 室内攻防）；腾讯自研水墨国风自由修仙 RPG《修仙时代》限量删档测试
- **9 月 16 日**：爪印工作室大世界自研捉宠 RPG《伊莫》PC 端上线
- **9 月 17 日**：蛮啾网络星宠结伴幻想大世界 RPG《蓝色星原：旅谣》限量计费删档测试；B 站自研休闲经营抓宠手游《闪耀吧！噜咪》上线（全球预约破 200 万）；37 手游《斗破：莫欺少年穷》上线（斗破苍穹正版授权国风玄幻）
- **9 月 23 日**：恺英《古龙群侠录》全平台公测（古龙武侠正版授权 3D 武侠 RPG）

## 赛道扫描：三股主力同时进场

### 1. 二游 / 开放世界：蓝色星原、伊莫扛旗

《蓝色星原：旅谣》用「美少女 + 捉宠」差异化定位杀入红海，全球预约数千万，被视作二次元开放世界赛道旗舰级产品；《伊莫》则是爪印的大世界自研捉宠 RPG，强调艾德尔大陆的联结合体玩法。两者都把「开放世界 + 收集」作为基底。

### 2. 捉宠：最拥挤的赛道

《伊莫》《蓝色星原》《闪耀吧！噜咪》都带捉宠 / 收集基因，叠加此前《异环》在开放世界里的宠物与城建元素——「捉宠 + 开放世界」已成国产内容最拥挤的拼图格。B 站用轻量化竖屏休闲捉宠做错位竞争，恰恰说明大厂也在主动避开正面肉搏。

### 3. 修仙 / 国风：IP 改编扎堆

《修仙时代》（腾讯水墨自由修仙）、《斗破：莫欺少年穷》（斗破苍穹授权）、《古龙群侠录》（古龙授权武侠）三款都在同一窗口亮相，国民级 IP 授权仍是降低获客成本的最稳路径。

## 大厂在悄悄换赛道

两个信号值得记一笔：

- **腾讯**：代理育碧《彩虹六号：攻势》补齐战术射击拼图，同时自研《修仙时代》守国风基本盘——「代理补品类 + 自研守基本盘」的双线思路很清晰
- **米哈游**：《星布谷地》二测 PV 在 B 站突破 200 万播放，是其**首次跳出二次元**、挑战生活模拟品类，高自由度 AI NPC 实现「有记忆、有情感」的对话——这是 AI 技术在游戏社交领域的规模化落地探索，也为生活模拟赛道设立了「AI 陪伴」新维度（本站不单独做米哈游专题，仅作行业全景客观提及）

## 真正的考题：差异化

当「捉宠 + 开放世界」成为标配基底，后来者的考题不再是「能不能做出来」，而是「凭什么被记住」。《异环》已经证明中国团队能把日式审美做到让本土玩家误认，但这把尺子一旦被拉平，堆料就不再是护城河。下周这 29 款里，能跑出来的大概率不是产能最猛的，而是定位最锋利的。

## 可信度评分

⭐⭐⭐⭐ **4/5**

**来源**：GameRes 游资网开测统计、网易 HOT 周报、厂商公开预约 / 测试公告、B 站二测 PV 播放数据。开测时间表与产品定位为公开信息；扣 1 分因部分「全球预约数千万 / 数亿」为厂商披露口径，实际转化待观察，且米哈游《星布谷地》具体上线时间尚未官宣。

## 编辑分析

9 月这波开测潮，表面是「新游多」，底层是**国产内容供给在二游、捉宠、修仙三条线同时军备竞赛**。对玩家是红利，对厂商是淘汰赛。

最值得盯的，不是谁先上线，而是谁先找到「非堆料」的差异化。当大厂开始用代理补射击、用 AI  NPC 探生活模拟，说明赛道边界正在被重新画——下一款破圈的，很可能出现在今天还没人注意的缝隙里。
""",
        "category": "analysis",
        "tags": ["开测潮", "二游", "捉宠", "修仙", "腾讯", "蛮啾", "米哈游", "蓝色星原", "伊莫"],
        "status": "published",
        "required_tier": "free",
        "game_name": None,
        "author_name": AUTHOR,
        "credibility_score": 4,
        "published_at": PUBLISHED_AT,
    },
    {
        "title": "【深度解析】为什么日本做不出「异环」：从一款二游看中国游戏工业化的结构性领先",
        "slug": "why-japan-cant-make-yihuan-2026",
        "excerpt": "《异环》4月公测后连登日本PS5下载榜一周第一，引发日本业界「为什么我们做不出」的灵魂拷问。虚幻引擎公司代表直言其细节打磨「离谱」，日本制作人则归因为资源投入、商业模式与监管环境的三重差异。这不是一款游戏的胜利，而是中国游戏工业化体系对成熟市场的结构性领先——但领先是阶段性的，不是终局。",
        "content": f"""{DISCLAIMER}

## 一个让日本业界「破防」的事实

2026 年 4 月 23 日，完美世界旗下 Hotta Studio 研发的都市开放世界 RPG《异环》全平台公测，覆盖超 180 个国家及地区。它在日本市场的表现，超出所有人预期：

- **日本 PS5 下载榜连登一周第一**，把多款本土大作压在身后
- **全球首日流水突破 1 亿元**，其中 **PC + PS 端收入占比高达 75%**
- 日本与美国并列成为首日流水最高地区
- 日本玩家反应剧烈：有主播看游戏场景「竟然有点想哭」，安魂曲线下集卡活动现场「周围全是日语交流，几乎没有说普通话的玩家」

这不是「中国游戏出海又赢一次」的爽文开头——它是一次让日本从业者被迫自我审视的文化工业事件。

## 日本从业者自己给出的答案

面对「为什么日本做不出异环这种级别」，日本业界没有甩锅，而是给出了相当清醒的诊断。

### 虚幻引擎公司 Indie-Us Games 代表 Alwei

> 「任何真正玩过《异环》的日本游戏从业者，应该都能理解——这款游戏的细节与打磨程度完全到了一个离谱的程度。」

他特地爬到游戏最高点，同时测试 PC 版和 iOS 版，两边都很流畅：「如果你知道这意味着什么，那真的会觉得有点可怕。」

### 日本制作人 Ukyo：三重核心差异

他把差距拆成三层：

1. **资源投入**：中国工作室单项目可投入 **200 人专职**做角色制作、动画设计，还重金打造角色短片、歌曲等衍生内容；日本公司难获批同等预算，动画资源扩充申请通过率极低
2. **监管环境**：日本新劳动法规限制加班，本土开发者产能被硬约束
3. **商业模式**：日本长期以《最终幻想》《勇者斗恶龙》等买断制单机为核心，追求「完成品」交付；中国因主机禁令培育出成熟的服务型游戏市场，《异环》用持续迭代、长期运营的「活游戏」模式，更适配当下全球玩家

## 这不是「抄袭」，是体系胜

把视角拉高一层：《异环》能反向输出日本，靠的不是某一两个天才，而是一整套工业化体系——

- **服务型市场底色**：中国玩家被长线运营、内容更新、社交生态训练出的需求，倒逼团队具备持续产能
- **UE5 工业化管线**：实时动态「活城市」、跨 PC/iOS/PS5 多端稳定表现，背后是海量内容管理与工程化能力
- **审美本土化能力**：从《原神》→《崩坏：星穹铁道》→《鸣潮》→《异环》，中国团队已能深度理解并精准还原东亚（尤其日式）审美，让日本玩家误认本土大作

这正是「中国游戏出海进入高质量输出新阶段」的标本：不再靠低端代工或模仿，而在开放世界、二次元等核心赛道建立技术与内容壁垒。

## 但要清醒：领先是阶段性的

「日本做不出异环」这个结论，必须加上两个限定：

- **它指的是产能与模式，不是能力**：日本在品类创新、单机叙事、玩法原创上仍有深厚底子；Ukyo 们缺的是「200 人专职 + 不限工时的服务型产能」，不是创意
- **服务型模式自身有隐忧**：《异环》证明的是工业化交付能力，其长线留存、内容消耗速度、付费曲线仍需时间验证；一旦进入长草期，考验才真正开始

换言之，这是一场「工业化产能」的阶段性领先，不是终局宣判。

## 可信度评分

⭐⭐⭐⭐ **4/5**

**来源**：日本业界观察者引述（Alwei / Ukyo 公开表态）、完美世界投资者交流会数据、《异环》海外公测公开战报。首日流水、PS5 登顶、75% 端游占比为官方 / 厂商披露；扣 1 分因「日本做不出」是结构性判断而非绝对结论，且长线表现尚无从验证。

## 编辑分析

《异环》在日本引发的「为什么我们做不出」，比登顶本身更有价值——它是一个成熟市场第一次被迫承认，自己在某个维度上被反超了。

但真正值得中国团队记住的，不是「我们赢了」的爽感，而是**领先的根因是体系，不是运气**。体系可以被学习、被追赶；今天靠 200 人专职和服务型产能建立的壁垒，明天可能就被日本厂商用 AI 提效或模式创新填平。

所以这篇不是庆功，是提醒：趁窗口期把护城河从「产能」挖到「原创玩法与叙事」，才是把阶段性领先变成长期优势的唯一路。
""",
        "category": "analysis",
        "tags": ["异环", "完美世界", "Hotta Studio", "国产出海", "日本游戏业", "工业化", "开放世界"],
        "status": "published",
        "required_tier": "free",
        "game_name": "异环",
        "author_name": AUTHOR,
        "credibility_score": 4,
        "published_at": PUBLISHED_AT,
    },
]


def insert_rows(table, rows, with_id=False):
    if not SERVICE_KEY:
        print("❌ 缺少 SUPABASE_SERVICE_KEY")
        return False
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    success = failed = 0
    for i, row in enumerate(rows):
        if with_id:
            row = dict(row)
            row["id"] = str(uuid.uuid4())
            wc = count_words(row.get("content", ""))
            row["word_count"] = wc
            row["read_time"] = max(3, round(wc / 400))
        body = json.dumps(row, ensure_ascii=False).encode("utf-8")
        req = request.Request(url, data=body, headers=headers, method="POST")
        try:
            with request.urlopen(req, timeout=25) as resp:
                if resp.status in (200, 201, 204):
                    rid = row.get("id", "?")
                    print(f"OK  [{i+1}/{len(rows)}] {row['title'][:46]} | id={rid}")
                    success += 1
                else:
                    print(f"WARN[{i+1}/{len(rows)}] HTTP {resp.status}: {row['title'][:46]}")
                    failed += 1
        except error.HTTPError as e:
            print(f"ERR [{i+1}/{len(rows)}] {row['title'][:46]} -> {e.read().decode('utf-8','replace')[:240]}")
            failed += 1
        except Exception as e:
            print(f"ERR [{i+1}/{len(rows)}] {row['title'][:46]} -> {e}")
            failed += 1
    print("=" * 50)
    print(f"{table}: 成功 {success}, 失败 {failed}")
    return failed == 0


if __name__ == "__main__":
    print(f"发布时间基准: {PUBLISHED_AT}\n")
    ok = insert_rows("articles", ARTICLES, with_id=True)
    sys.exit(0 if ok else 1)
