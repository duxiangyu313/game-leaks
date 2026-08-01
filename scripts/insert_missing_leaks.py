"""批量插入缺失的爆料到 Supabase — 2026年7月21日~31日"""
import json, os, sys, io
from datetime import datetime, timezone
from urllib import request, error

# Fix Windows GBK encoding issue
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SUPABASE_URL = "https://gumpxfxbxxyljikaizsh.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bXB4ZnhieHh5bGppa2FpenNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM3MzU0NSwiZXhwIjoyMDk1OTQ5NTQ1fQ.tCMI5xxpL4GszXKO9pUHyc-8i3eafx9RfQCCQKcyUh0"

LEAKS = [
    {
        "title": "ChinaJoy 2026 今日开幕！近900家企业参展，影之刃零+抵抗者首次线下试玩",
        "summary": "2026 ChinaJoy今日在上海新国际博览中心开幕（7/31-8/3），近900家企业、超1000款游戏创历史新高。索尼PlayStation展台《影之刃零》可试玩，《抵抗者》首次线下公开试玩。朝夕光年携12款新游参展。",
        "content": "## 🎪 ChinaJoy 2026 今日开幕\n\n2026年7月31日，中国国际数码互动娱乐展览会（ChinaJoy）在上海新国际博览中心正式开幕，展期持续至8月3日。\n\n### 核心看点\n\n- **900家企业参展**：创历史新高，涵盖游戏、硬件、AI、动漫等全产业链\n- **超1000款游戏亮相**：国产3A史上最强阵容\n- **索尼PlayStation展台**：《影之刃零》提供线下试玩，《抵抗者》首次公开试玩\n- **朝夕光年**：12款新游参展阵容\n- **腾讯、网易**：各有重磅产品亮相\n\n### 为什么重要\n\n本届CJ是国产3A史上阵容最强的一届：影之刃零（10/29发售）+ 抵抗者（抗日FPS首秀）+ 九阴真经修仙（UE5开放世界修真首曝）。国产3A从\"能不能做出来\"到\"做出来好不好玩\"的阶段转变，CJ是最好的检验场。",
        "source": "17173/游戏陀螺",
        "credibility": "confirmed",
        "game_name": "ChinaJoy 2026",
        "published_at": "2026-07-31T09:00:00+08:00",
        "status": "published"
    },
    {
        "title": "蜗牛游戏发布AAA级《九阴真经：修仙》Steam页面已上线，UE5开放世界修真",
        "summary": "蜗牛游戏在CJ开幕当天正式发布UE5打造的AAA级开放世界沙盒修真游戏《九阴真经：修仙》，同步上线Steam商店页面。预告片展示御剑飞行、渡劫飞升、宗门大战等核心玩法。",
        "content": "## 🐉 九阴真经：修仙 — UE5开放世界修真AAA\n\n蜗牛游戏（Snail Games）在ChinaJoy 2026开幕当天正式发布《九阴真经：修仙》，一款基于Unreal Engine 5打造的AAA级开放世界沙盒修真游戏。\n\n### 核心特性\n\n- **开放世界修真**：无缝大地图，御剑飞行自由探索\n- **渡劫飞升系统**：从筑基到飞升的完整修仙体系\n- **宗门大战**：大规模PVP/PVE宗门战争\n- **UE5画质**：Lumen全局光照 + Nanite虚拟几何\n- **Steam页面已上线**：全球玩家可加入愿望清单\n\n### 行业意义\n\n蜗牛游戏以九阴IP进军AAA赛道，是国内网游大厂转型买断制单机的重要信号。修真题材在AAA级别上一直是空白，这款产品有望填补这一市场缺口。",
        "source": "GlobeNewsWire/17173",
        "credibility": "confirmed",
        "game_name": "九阴真经：修仙",
        "published_at": "2026-07-31T08:00:00+08:00",
        "status": "published"
    },
    {
        "title": "腾讯3A「Project T」招聘细节全面曝光：对标美末+神海+古墓，UE5第三人称动作冒险",
        "summary": "网友通过腾讯招聘平台梳理出Project T完整信息：UE5第三人称动作冒险，PC+PS5+Xbox Series，设计灵感直指《最后生还者》《神秘海域》《古墓丽影》。涵盖攀爬跳跃、掩体系统、枪械战斗、电影化镜头等。",
        "content": "## 🔍 腾讯 Project T — 对标索尼三大招牌\n\n网友通过腾讯招聘平台梳理出Project T的完整技术方向，信息量巨大。\n\n### 技术规格\n\n- **引擎**：Unreal Engine 5\n- **类型**：第三人称动作冒险\n- **平台**：PC + PlayStation 5 + Xbox Series X|S\n- **设计灵感**：《最后生还者》《神秘海域》《古墓丽影》\n\n### 玩法系统\n\n- 攀爬跳跃系统\n- 掩体射击系统\n- 枪械战斗 + 徒手战斗\n- 电影化镜头语言\n- 战斗与解谜无缝结合\n- 敌人AI：独立决策 + 团队协作 + 感知环境 + 适应玩家风格\n\n### 行业意义\n\n腾讯将索尼第一方三大招牌作为\"对标清单\"是史无前例的 — Project T的野心不是\"做一个不错的国产3A\"，而是\"做出世界顶级的线性叙事动作冒险\"。但\"对标三神作\"是自信还是画饼，还需实机验证。",
        "source": "360游戏/163",
        "credibility": "likely",
        "game_name": "Project T",
        "published_at": "2026-07-30T18:00:00+08:00",
        "status": "published"
    },
    {
        "title": "《明末2》正式官宣：505 Games投资1.6亿元，东方文化内核不变",
        "summary": "505 Games与成都递归海豚联合官宣《明末2》开发计划。前作Steam首日在线13.1万、累计触达500万玩家。IP已归Digital Bros全资持有，承诺坚守东方文化内核。续作投资1.6亿元。",
        "content": "## 🎯 明末2 正式官宣\n\n505 Games母公司Digital Bros与成都递归海豚（Recursive Dolphin）联合宣布《明末2》开发计划。\n\n### 前作成绩\n\n- Steam首日在线峰值 13.1 万\n- 累计触达 500 万玩家\n- 东方志怪 + 类魂玩法获好评\n\n### 续作信息\n\n- **投资规模**：1.6亿人民币（505 Games全资）\n- **IP归属**：Digital Bros全资持有\n- **文化内核**：承诺坚守东方文化内核，不会\"西化\"\n- **平台**：预计PC + 主机\n\n### 行业意义\n\n海外发行商全资持有中国IP并投资续作，这在国内游戏行业极为罕见。说明《明末》的东方志怪风格在全球市场有真实需求。",
        "source": "17173",
        "credibility": "confirmed",
        "game_name": "明末2",
        "published_at": "2026-07-29T20:00:00+08:00",
        "status": "published"
    },
    {
        "title": "7月版号197款创年内单月新高，上半年游戏市场收入1884.5亿元增长12.17%",
        "summary": "7月共发放197款游戏版号（国产193+进口4），创2026年以来单月最高。上半年国内游戏市场实际销售收入1884.5亿元，同比增长12.17%，创历史新高。版号常态化+市场规模持续增长。",
        "content": "## 📋 7月版号197款创年内新高\n\n### 版号数据\n\n- **7月总量**：197款（国产193 + 进口4），创2026年单月最高\n- **上半年累计**：超800款版号发放\n- **重点产品**：《影之刃零》（客户端+PS5双端）获批\n\n### 市场数据\n\n- **上半年收入**：1884.5亿元，同比增长12.17%\n- **自研游戏海外收入**：持续增长\n- **游戏板块**：暑期档新游周期延续，行业景气度保持高位\n\n### 行业意义\n\n版号常态化+市场规模持续增长，为国产3A提供了稳定的政策与市场双底座。影之刃零版号到手，10月29日发售已无障碍。",
        "source": "万联证券/新浪财经",
        "credibility": "confirmed",
        "game_name": None,
        "published_at": "2026-07-30T16:00:00+08:00",
        "status": "published"
    },
    {
        "title": "《雾影猎人》7月30日全球发售，同步加入XGP，S1赛季详情公布",
        "summary": "国产合作PVE射击游戏《雾影猎人》7月30日正式全球发售，同步加入Xbox Game Pass。S1赛季「深渊觉醒」详情公布：新地图、新武器、新Boss。Steam愿望单突破50万。",
        "content": "## 🎯 雾影猎人正式发售\n\n### 发售信息\n\n- **发售日期**：2026年7月30日\n- **平台**：PC（Steam/WeGame）+ Xbox Series X|S + PS5\n- **XGP**：首发同步加入 Xbox Game Pass\n- **Steam愿望单**：突破50万\n\n### S1赛季「深渊觉醒」\n\n- 全新地图：深渊裂隙\n- 新武器类型：灵魂猎手\n- 新Boss：深渊之主\n- 赛季通行证包含30+外观道具\n\n### 行业意义\n\n国产合作PVE射击游戏首次同步登陆全平台+XGP，标志着国产游戏全球化发行能力进一步提升。",
        "source": "官方/Steam",
        "credibility": "confirmed",
        "game_name": "雾影猎人",
        "published_at": "2026-07-30T10:00:00+08:00",
        "status": "published"
    },
    {
        "title": "Steam出现碰瓷游戏《明末影之刃零》，DLC含《归唐》《黑神话钟馗》售价18元",
        "summary": "Steam出现名为《明末影之刃零》的碰瓷游戏，DLC列表包含《归唐》《黑神话钟馗》等碰瓷命名，实际内容仅10分钟简陋迷宫，售价18元。玩家呼吁Steam加强中文区名称审核。",
        "content": "## 🚨 Steam碰瓷游戏引发众怒\n\n### 事件详情\n\nSteam平台出现一款名为《明末影之刃零》的游戏，通过拼凑国产3A热门IP名称吸引眼球：\n\n- **主体游戏**：《明末影之刃零》售价18元\n- **碰瓷DLC**：《归唐》《黑神话钟馗》等\n- **实际内容**：仅10分钟的简陋迷宫，无任何玩法可言\n\n### 玩家反应\n\n- 大量玩家在Steam评论区举报\n- 呼吁V社建立中文区名称审核机制\n- 担心此类碰瓷行为损害国产3A口碑\n\n### 行业反思\n\n国产3A IP影响力越大，碰瓷成本越低。Steam作为全球平台，对中文区名称审核存在盲区，需要社区共同维护。",
        "source": "IT之家/17173",
        "credibility": "confirmed",
        "game_name": None,
        "published_at": "2026-07-30T14:00:00+08:00",
        "status": "published"
    },
    {
        "title": "《影之刃零》7月版号正式过审，WeGame预约破4.3万，10月29日发售锁定",
        "summary": "《影之刃零》7月版号正式获批（客户端+PS5双端），发售日期锁定10月29日全球同步。Steam愿望单突破百万，半数来自海外。WeGame预约已破4.3万。距离发售仅余90天。",
        "content": "## ⚔️ 影之刃零版号过审，发售倒计时90天\n\n### 关键节点\n\n- **版号**：7月版号正式获批（客户端 + PS5 双端）\n- **发售日**：2026年10月29日，全球同步\n- **Steam愿望单**：突破100万，半数来自海外\n- **WeGame预约**：突破4.3万\n- **CJ试玩**：PlayStation展台提供线下试玩\n\n### 为什么重要\n\n影之刃零是\"村里第二个大学生\"（继黑神话悟空之后），其表现将直接影响资本市场对国产3A的信心。版号到手意味着发售已无政策障碍，接下来三个月是营销冲刺期。",
        "source": "17173/游民星空/WeGame",
        "credibility": "confirmed",
        "game_name": "影之刃零",
        "published_at": "2026-07-25T14:00:00+08:00",
        "status": "published"
    },
    {
        "title": "《昭和米国物语》确认参展科隆游戏展，将发布全新预告片并首次开放线下试玩",
        "summary": "铃空游戏官宣《昭和米国物语》将参展2026科隆游戏展（8月26-30日），发布全新预告片并首次开放线下试玩。打破\"项目搁置\"传闻，标志着进入发售前最后冲刺阶段。",
        "content": "## 🌸 昭和米国物语确认参展科隆\n\n### 参展信息\n\n- **展会**：Gamescom 2026（科隆游戏展）\n- **日期**：2026年8月26-30日\n- **内容**：全新预告片 + 首次线下试玩\n- **开发商**：铃空游戏（NEKCOM）\n\n### 打破搁置传闻\n\n此前社区有传闻称该项目因资金问题搁置，此次官方确认参展科隆并开放试玩，彻底打破这一传言。全新预告片将展示更多\"日本殖民美国\"的架空世界内容。",
        "source": "游民星空/铃空游戏官方",
        "credibility": "confirmed",
        "game_name": "昭和米国物语",
        "published_at": "2026-07-28T12:00:00+08:00",
        "status": "published"
    },
    {
        "title": "《永恒之塔2》国服正式官宣，盛趣游戏代理，CJ期间首次国内试玩",
        "summary": "盛趣游戏与韩国NC十七年后再携手，正式宣布代理《永恒之塔2》中国大陆运营。CJ期间（7/31-8/3）首次面向国内玩家开放线下试玩。国服上线日期待定。",
        "content": "## 🏯 永恒之塔2 国服官宣\n\n### 代理信息\n\n- **代理方**：盛趣游戏（原盛大游戏）\n- **开发商**：韩国NCsoft\n- **合作背景**：盛趣与NC十七年后再度携手（前作《永恒之塔》2009年国服上线）\n- **试玩**：CJ期间首次面向国内玩家开放线下试玩\n\n### 为什么重要\n\n《永恒之塔》是2009年中国MMO市场的现象级产品，一代玩家的青春回忆。续作国服确认，意味着NCsoft对中国市场的持续重视。但当前MMO市场竞争激烈，能否再现前作辉煌有待观察。",
        "source": "17173/GameLook",
        "credibility": "confirmed",
        "game_name": "永恒之塔2",
        "published_at": "2026-07-31T07:00:00+08:00",
        "status": "published"
    },
]


def insert_leaks():
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
        # Ensure published_at is ISO format
        body = json.dumps(leak, ensure_ascii=False).encode("utf-8")
        req = request.Request(url, data=body, headers=headers, method="POST")
        try:
            with request.urlopen(req, timeout=15) as resp:
                if resp.status in (200, 201):
                    print(f"✅ [{i+1}/{len(LEAKS)}] {leak['title'][:60]}...")
                    success += 1
                else:
                    print(f"⚠️ [{i+1}/{len(LEAKS)}] HTTP {resp.status}: {leak['title'][:60]}...")
                    failed += 1
        except error.HTTPError as e:
            body_text = e.read().decode("utf-8", errors="replace")
            print(f"❌ [{i+1}/{len(LEAKS)}] {leak['title'][:60]}... → {body_text[:200]}")
            failed += 1
        except Exception as e:
            print(f"❌ [{i+1}/{len(LEAKS)}] {leak['title'][:60]}... → {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"完成: 成功 {success}, 失败 {failed}")

    return failed == 0


if __name__ == "__main__":
    ok = insert_leaks()
    sys.exit(0 if ok else 1)
