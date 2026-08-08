"""批量插入国产游戏最新爆料到 Supabase — 2026年8月6日~8月8日热点"""
import json, os, re, sys, io
from urllib import request, error

if (getattr(sys.stdout, "encoding", "") or "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 从 .env.local 读取 service key（避免明文写在脚本里）
def load_env_local(p='.env.local'):
    try:
        for line in open(p, encoding='utf-8'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                if k in ('SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY') and not os.environ.get('SUPABASE_SERVICE_KEY'):
                    os.environ['SUPABASE_SERVICE_KEY'] = v
    except Exception:
        pass

load_env_local()

SUPABASE_URL = "https://gumpxfxbxxyljikaizsh.supabase.co"
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

LEAKS = [
    {
        "title": "《黑神话：悟空》全平台开启七折优惠，8月12日至25日，史低价标准版187.6元",
        "summary": "游戏科学8月5日官宣《黑神话：悟空》全平台数字版七折，标准版折后187.6元、豪华版229.6元，为上线以来最大规模优惠之一。PS商店8/12-8/26，Steam/Epic/WeGame窗口为8/12 0点至8/25 24点。折扣时间精准压在8月20日发售两周年节点。",
        "content": "## 🐒 悟空两周年，先来一发史低\n\n2026年8月5日，游戏科学官宣《黑神话：悟空》全平台数字版本（标准版、豪华版、豪华升级包）开启七折优惠。\n\n### 折扣要点\n\n- **标准版折后 187.6 元**，豪华版 229.6 元，均为史低区间\n- **PS Store**：8 月 12 日 — 8 月 26 日\n- **Steam / Epic / WeGame**：8 月 12 日 0 点 — 8 月 25 日 24 点（北京时间）\n- 洪都拉斯、墨西哥、尼加拉瓜暂不参与本轮 PS5 促销\n\n### 为什么是现在\n\n这个时间点选得很巧——正好卡在每年 8 月 20 日这个\"游科大日子\"之前。自 2020 年 8 月 20 日发布首支实机预告起，游科几乎年年在这个节点搞事情：2024 年同日正式发售，2025 年同日官宣《黑神话：钟馗》立项。制作人自己也调侃\"一转眼又到了压力山大的 8 月\"。\n\n业内普遍把这次七折理解为两层用意：一是给还没入坑的玩家一个\"史低上车\"的理由，把两年累积的口碑转化成销量；二是为 8 月 20 日前后可能公布的《钟馗》新消息提前蓄一波流量——毕竟一个正在打折、热搜在榜的 IP，比一个沉寂的 IP 更适合承接新作的关注。\n\n目前《黑神话：悟空》全球销量早已突破千万套，这次折扣更像是一次\"节点运营\"而非\"清仓\"。对玩家来说，187.6 元买一款拿过年度最佳的国产 3A，大概率不会有比这更便宜的窗口了。",
        "source": "快科技 / 界面新闻 / 潇湘晨报 / 搜狐",
        "credibility": "confirmed",
        "game_name": "黑神话：悟空",
        "published_at": "2026-08-06T22:00:00+08:00",
        "status": "published"
    },
    {
        "title": "网易《诡影藏锋》8月7日10点正式开测，预约破200万，极乐古刹+争锋/共御双模式",
        "summary": "网易雷火中式志怪搜打撤《诡影藏锋》8月7日10:00开启首轮限号删档\"藏锋测试\"，仅PC端持续至8月10日。预约量突破200万。测试含极乐古刹地图、PvP争锋（三排4队上限12人/单排8队上限8人）与PvE共御模式，新角色肉盾\"卫沧岩\"亮相。",
        "content": "## 🗡️ 诡影藏锋：从预告到真开测\n\n网易雷火工作室旗下首款中式志怪搜打撤游戏《诡影藏锋》，于 8 月 7 日上午 10:00 正式开启首轮限号删档\"藏锋测试\"。\n\n### 开测实况\n\n- **测试周期**：8 月 7 日 10:00 — 8 月 10 日 23:59，仅限 PC 端\n- **预约体量**：自 5 月拿版号、7 月 8 日首曝 PV 以来，预约量已突破 **200 万**\n- **地图**：极乐古刹\n- **PvP 争锋模式**：三排 4 队上限 12 人，单排 8 队上限 8 人\n- **PvE 共御模式**：合作对抗\n- **局外系统**：仓库、交易行、武器打造、藏身处\n- **新角色**：肉盾抗伤型\"卫沧岩\"在测试前通过实机演示亮相\n\n### 它到底特别在哪\n\n《诡影藏锋》的核心标签是\"冷兵器 + 中式恐怖\"。它把搜打撤最常见的枪械射击换成了近身格挡、闪避、突刺——玩家得看敌方出招决定自己的应对，而不是比谁先瞄谁。配合祠堂、荒村、纸人精怪这些民俗怪谈场景，整体调性和海外那批军事风搜打撤拉开了明显距离。\n\n之前业界担心\"搜打撤赛道太挤、玩家审美疲劳\"，而光大证券的判断是：偏动作、偏冷兵器的搜打撤反而更有新鲜感。雷火手里有《永劫无间》多年积累的冷兵器多人战斗手感调校经验，这恰好是《诡影藏锋》最被低估的家底。\n\n8 月 10 日测试就结束，想体验的人得抓紧。",
        "source": "17173 / 网易官方 / GameRes",
        "credibility": "confirmed",
        "game_name": "诡影藏锋",
        "published_at": "2026-08-07T11:00:00+08:00",
        "status": "published"
    },
    {
        "title": "腾讯天美《怪物猎人：旅人》8月7日开启\"启明测试\"，38种怪物+新增大锤",
        "summary": "CAPCOM正版授权、腾讯天美研发的《怪物猎人：旅人》8月7日10:00开启\"启明测试\"，安卓限号删档计费。版本新增38种可挑战怪物、融光种黑脚龙/飞雷龙，新武器\"大锤\"兼具机动性与破坏力，并优化随从获取与养成。配置要求骁龙845及以上、Android 12.0及以上。",
        "content": "## 🏹 怪猎旅人：腾讯的开放世界狩猎落子\n\n由 CAPCOM 正版授权、腾讯天美工作室群研发的《怪物猎人：旅人》，8 月 7 日上午 10:00 正式开启\"启明测试\"。本次为安卓平台限号、删档、计费测试。\n\n### 测试新增内容\n\n- **38 种可挑战怪物**，新增融光种黑脚龙、融光种飞雷龙等\n- **新武器类型\"大锤\"**：兼具机动性与破坏力，可蓄力释放强力攻击\n- 优化随从获取机制与养成系统\n- **配置门槛**：骁龙 845 及以上处理器、Android 12.0 及以上系统\n\n### 它和原创搜打撤不是一回事\n\n《怪物猎人：旅人》本质是 CAPCOM 怪物猎人 IP 的开放世界化手游，走的是\"狩猎 + 共斗\"而非\"搜打撤撤离\"。但它在 8 月这个\"搜打撤大月\"里和《诡影藏锋》《雾海之下》同期开测，客观上把\"国产撤离类\"和\"IP 改编共斗类\"摆在了同一个擂台上。\n\n对腾讯来说，这是其在开放世界狩猎赛道的关键落子：用成熟 IP 内容储备直接解决\"内容消耗率\"难题，而不是从零搭建怪物生态。对原创国产搜打撤团队而言，IP 怪兽入场意味着内容军备竞赛的门槛又抬高了一截——这一点，值得单独写一篇来分析。",
        "source": "17173 / 腾讯新闻 / 游戏陀螺",
        "credibility": "confirmed",
        "game_name": "怪物猎人：旅人",
        "published_at": "2026-08-07T11:30:00+08:00",
        "status": "published"
    },
    {
        "title": "索尼确认2028年1月起PS5新作仅数字发行，国产单机出海实体版恐退场",
        "summary": "索尼在PS5包装盒加贴警告标签，明确自2028年1月起新发售PlayStation游戏仅以数字形式提供，首批照片8月5日社交平台曝光。玩家对失去实体版购买、转售与收藏权表达强烈担忧。这对计划登陆PS5的《影之刃零》《归唐》等国产3A的实体版发行提出了新变量。",
        "content": "## 💿 索尼的\"数字-only\"信号\n\n8 月 5 日，索尼将在 PS5 包装盒加贴警告标签的照片在社交平台曝光，标签明确：自 **2028 年 1 月起**，新发售的 PlayStation 游戏仅以数字形式提供。\n\n### 玩家为什么反弹\n\n实体版承载的不只是游戏本身：购买权、转售权、收藏价值，以及\"二手盘\"这个长期存在的玩家经济。全面转向数字，意味着这些权利一次性清零。消息一出，玩家社区对\"失去实体收藏\"表达了强烈担忧。\n\n### 对国产单机出海意味着什么\n\n这件事和《影之刃零》《归唐》们直接相关——这两款都规划了 PS5 同步发售。如果索尼的数字化政策在 2028 年如期落地，那么 2027 年之后国产 3A 在 PS5 上的\"国行实体盘 / 海外实体盘\"发行逻辑会彻底改写，首发期的实体收藏版、限量版这类品牌动作将失去载体。\n\n短期看影响有限：《影之刃零》10 月 29 日发售、归唐预计 2027 年，都还在实体窗口期内。但长期看，国产 3A 出海的\"实体仪式感\"会被逐步抽走，版本分层、收藏溢价的设计空间也被压缩。数字生态是趋势，只是玩家需要时间消化。",
        "source": "腾讯网 / 游民星空 / 玩家社区",
        "credibility": "confirmed",
        "game_name": None,
        "published_at": "2026-08-06T12:00:00+08:00",
        "status": "published"
    },
    {
        "title": "凉屋游戏《魂坠深境》8月6日上线，暗黑西幻卡牌Roguelike，700+卡牌取舍博弈",
        "summary": "凉屋游戏卡牌Roguelike新作《魂坠深境》8月6日定档上线。游戏以策略构筑与序列式卡牌对战为核心，战斗序列中每打出一张卡需牺牲其后若干张，出牌顺序与牺牲决策构成策略内核。现已开放700余张特色卡牌、170余种祝福、50种印记及85种护符。",
        "content": "## 🃏 魂坠深境：把\"取舍\"做成核心机制\n\n凉屋游戏（代表作《元气骑士》）的卡牌 Roguelike 新作《魂坠深境》于 8 月 6 日上线。\n\n### 玩法内核\n\n游戏以策略构筑与序列式卡牌对战为核心，但它的差异化不在卡牌数量，而在一套\"取舍\"机制：\n\n- 战斗序列中，**每打出一张卡牌，需以牺牲其后若干张卡牌为代价**\n- 出牌顺序与牺牲决策共同构成策略内核\n- 暗黑西幻美术基调 + 克系诡异氛围\n\n### 内容体量\n\n- 700 余张特色卡牌\n- 170 余种祝福、50 种印记、85 种护符\n- 四大职业、十七位出战者，各自独立卡池与专属天赋树\n\n### 为什么值得单列一条\n\n《元气骑士》证明了凉屋做\"轻量但有深度\"动作游戏的能力。《魂坠深境》把这份能力迁移到卡牌 Roguelike，用\"牺牲\"机制强制玩家做选择，而不是无脑堆数值——这在同类产品里是个清醒的设计取向。\n\n单机/独游这条线在 2026 年持续热闹：《黑神话》拉高了行业水位，《太吾绘卷》《达巴：水痕之地》证明中小团队也能做出有记忆点的作品。凉屋这次能不能用\"取舍\"机制在卡牌红海里撕开一道口子，暑期档会给出答案。",
        "source": "游戏陀螺 / 网易号 / 好游快爆",
        "credibility": "confirmed",
        "game_name": "魂坠深境",
        "published_at": "2026-08-06T15:00:00+08:00",
        "status": "published"
    },
]


def insert_leaks():
    if not SERVICE_KEY:
        print("❌ 缺少 SUPABASE_SERVICE_KEY（请确认 .env.local 中存在）")
        return False

    url = f"{SUPABASE_URL}/rest/v1/leaks"
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    success = 0
    failed = 0

    for i, leak in enumerate(LEAKS):
        body = json.dumps(leak, ensure_ascii=False).encode("utf-8")
        req = request.Request(url, data=body, headers=headers, method="POST")
        try:
            with request.urlopen(req, timeout=20) as resp:
                if resp.status in (200, 201, 204):
                    print(f"OK  [{i+1}/{len(LEAKS)}] {leak['title'][:48]}")
                    success += 1
                else:
                    print(f"WARN[{i+1}/{len(LEAKS)}] HTTP {resp.status}: {leak['title'][:48]}")
                    failed += 1
        except error.HTTPError as e:
            body_text = e.read().decode("utf-8", errors="replace")
            print(f"ERR [{i+1}/{len(LEAKS)}] {leak['title'][:48]} -> {body_text[:200]}")
            failed += 1
        except Exception as e:
            print(f"ERR [{i+1}/{len(LEAKS)}] {leak['title'][:48]} -> {e}")
            failed += 1

    print("=" * 50)
    print(f"完成: 成功 {success}, 失败 {failed}")
    return failed == 0


if __name__ == "__main__":
    ok = insert_leaks()
    sys.exit(0 if ok else 1)
