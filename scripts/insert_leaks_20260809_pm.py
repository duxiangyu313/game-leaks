"""批量插入国产游戏最新爆料到 Supabase — 2026年8月9日（晚间）热点补充批次
去重说明：本批避开 8-6/8-8/8-9 已发布内容（影之刃零预售、钟馗、CODM×崩坏3、
米哈游泄密、星砂岛、黑神话七折、怪物猎人旅人、诡影藏锋、索尼PS5、魂坠深境、王者万象棋等），
仅写入 8-9 当日真正新增的话题。
"""
import json, os, sys, io
from urllib import request, error

if (getattr(sys.stdout, "encoding", "") or "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


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
        "title": "《原神》7.0\"无神怜爱的雪国\"定档8月12日：至冬国终开放，五年七国叙事收束",
        "summary": "米哈游《原神》7.0版本\"无神怜爱的雪国\"正式定档8月12日上线，旅行者将前往斯涅日纳（至冬国）——这是提瓦特七国叙事中最后一个未开放的主要国家。冰之女皇登场、戴因斯雷布入池、坎瑞亚新神线索、新元素力上线，信息量巨大。从1.0蒙德到7.0至冬，米哈游用五年时间铺陈七国主线。",
        "content": "## ❄️ 至冬国，终于来了\n\n8 月 12 日，《原神》7.0 版本\"无神怜爱的雪国\"正式上线，旅行者将踏入斯涅日纳——也就是至冬国。这是提瓦特七国叙事里**最后一个未开放的主要国家**。\n\n### 为什么说这一版分量最重\n\n从 1.0 蒙德到 7.0 至冬，米哈游花了整整五年铺陈七国主线。至冬国的定位特殊：它是愚人众的大本营，冰之女皇是七神里最具争议性的角色之一。这一版确认放出的内容包括：\n\n- **冰之女皇正式登场**，作为愚人众最高统治者揭开更多主线谜团\n- **戴因斯雷布入池**，这位贯穿\"坎瑞亚\"线索的神秘角色终于成为可玩角色\n- **坎瑞亚新神线索**浮出水面，五年埋下的伏笔进入收束阶段\n- **新元素力上线**，战斗体系迎来版本级扩展\n\n### 期待值拉满，也意味着容错率极低\n\n社区对至冬的期待值，是《原神》历次版本里最高的之一。但高期待也带来高风险：五年叙事收束，能不能给出令人信服的推进，直接决定玩家对\"后七国时代\"的信心。\n\n周年庆福利尚未完全公布，已引发部分玩家焦虑；更核心的关注点在于叙事——米哈游在长线运营上积累的经验，能不能在这一版把五年伏笔兑现成\"值回等待\"的体验。8 月 12 日，答案揭晓。",
        "source": "今日头条 / 腾讯网 / 米哈游官方",
        "credibility": "confirmed",
        "game_name": "原神",
        "published_at": "2026-08-09T19:00:00+08:00",
        "status": "published"
    },
    {
        "title": "沙特PIF完成550亿美元收购EA，游戏史上第二大并购落定",
        "summary": "8月4日，由沙特公共投资基金（PIF）牵头的投资者财团正式完成对美国艺电（EA）的收购，交易总额约550亿美元（约合人民币3711亿元），历时近一年。这是全球游戏产业史上规模第二大的并购。PIF将持有EA 93.4%股份，EA结束36年上市公司历史转为私有。",
        "content": "## 💰 石油资本，改写游戏版图\n\n8 月 4 日，由沙特公共投资基金（PIF）牵头的财团正式完成对**美国艺电（EA）**的收购，交易总额约 **550 亿美元**（折合约 3711 亿元人民币），历时近一年。这是全球游戏产业史上**规模第二大的并购**。\n\n### 交易结构\n\n- 收购方：沙特公共投资基金（PIF）牵头，联合银湖资本（Silver Lake）、库什纳的 Affinity Partners\n- 持股比例：PIF 持有 **93.4%**，银湖 5.5%，Affinity 1.1%\n- EA 结束其 **36 年**上市公司历史，转为私有公司\n- EA 首席执行官 Andrew Wilson 留任董事长兼 CEO\n\n### 钱从哪来，债往哪去\n\n据报，PIF 为完成交易向摩根大通借款 **200 亿美元**。这笔巨额债务，可能迫使 EA 未来更聚焦《战地》《模拟人生》等成熟 IP，而非冒险尝试新作——这与过去 EA\"广撒网\"的策略形成微妙反差。\n\n### 对国产游戏意味着什么\n\n沙特资本近年密集布局游戏：从收购 SNK、投资 Embracer，到如今吞下 EA，其\"主权基金 + 内容资产\"的打法，正在重塑全球游戏资本格局。对中国厂商而言，这是把双刃剑：一边是出海中东市场的资金与渠道红利，另一边是顶级 IP 与人才被资本进一步集中。当石油美元开始\"重仓游戏\"，2026 下半场的全球竞争，底色已经变了。",
        "source": "网易 / 竞核 / 公开财报",
        "credibility": "confirmed",
        "game_name": None,
        "published_at": "2026-08-09T19:05:00+08:00",
        "status": "published"
    },
    {
        "title": "《黑神话：悟空》登CCTV9纪录片《吴承恩与西游记》，央视再背书文化输出",
        "summary": "8月9日，央视CCTV9纪录片《吴承恩与西游记》第一集《世间岂谓无英雄》专门聚焦《黑神话：悟空》，点明其2024年8月20日发售、凭东方玄幻风格惊艳全球的表现，并介绍游戏化身天命人探寻西游传说、解锁身世谜题的核心设定。这是该作继央视新闻、央视财经后，再次亮相主流文化节目。",
        "content": "## 📺 从游戏到纪录片，文化输出的新注脚\n\n8 月 9 日，央视 CCTV9 纪录片《吴承恩与西游记》第一集《世间岂谓无英雄》，专门把镜头给到了《黑神话：悟空》。\n\n### 纪录片怎么讲这款游戏\n\n节目开篇即提及：这款作品于 **2024 年 8 月 20 日发售**，凭东方玄幻风格惊艳全球；并介绍了游戏\"化身天命人、探寻西游传说、解锁身世谜题\"的核心剧情设定。随后节目以《黑神话》为切入点，顺势拓展到对《西游记》作者吴承恩创作历程、经典文学内核的深度探讨。\n\n### 为什么这件事值得记一笔\n\n这并非《黑神话》首次获央视认可——此前央视新闻、央视财经均报道过其海外传播影响力与文化价值。但纪录片这一载体不同：它把一款游戏，放进\"传统文学与现代文娱的关联桥梁\"这个更厚重的叙事里。\n\n对国产游戏来说，这是文化输出最理想的状态：不是生硬地说教，而是用高品质的数字文创作品，让全球玩家先\"玩进去\"，再主动去了解背后的西游文化与吴承恩。当一款游戏能自然地出现在国家级文化纪录片中，它就已经超越了\"娱乐产品\"的范畴。",
        "source": "游侠网 / 央视网 / CCTV9",
        "credibility": "confirmed",
        "game_name": "黑神话：悟空",
        "published_at": "2026-08-09T19:10:00+08:00",
        "status": "published"
    },
    {
        "title": "《影之刃零》联动《堡垒之夜》\"孤狼\"皮肤，Epic二次确认合作推进",
        "summary": "8月7日，Epic Games官方发文宣布国产武侠动作游戏《影之刃零》与全球热门大逃杀《堡垒之夜》达成跨界联动，配文仅\"孤狼\"二字并发布全新视觉海报。这是继今年6月State of Unreal 2026公布合作后的再度确认，预计《堡垒之夜》将迎来《影之刃零》主题全新外观皮肤。",
        "content": "## 🐺 \"孤狼\"，撞进大逃杀\n\n8 月 7 日，Epic Games 官方发文，宣布《影之刃零》与全球热门大逃杀《堡垒之夜》达成跨界联动，配文只有两个字：\"孤狼\"，并放出一张全新视觉海报。\n\n### 这不是第一次，但分量更重\n\n其实早在今年 6 月的 **State of Unreal 2026** 发布会上，Epic 就公布过《堡垒之夜》与多款作品联动，其中就包括《影之刃零》，但当时没披露具体角色、外观或道具细节。这一次 Epic 主动再度发文官宣并配\"孤狼\"视觉图，被外界视为对合作推进的进一步确认与预热。\n\n### 为什么国产 3A 进堡垒之夜值得关注\n\n《堡垒之夜》的联动向来是\"全球顶流 IP 同框\"的舞台。一款尚未发售（10 月 29 日全球发售）的国产武侠动作新作，能反向输出自己的视觉符号到这个舞台，本身就是国产游戏 IP 影响力提升的信号。\n\n对《影之刃零》而言，这也是发售前一次低成本的全球曝光：借着《堡垒之夜》的体量，把\"功夫朋克\"的中式暗黑美学，塞进海外玩家的日常对局里。至于联动具体形式是皮肤、道具还是地图彩蛋，官方尚未公布——但\"孤狼\"二字，已经足够让两边玩家开始脑补了。",
        "source": "17173 / Epic官方 / 灵游坊",
        "credibility": "confirmed",
        "game_name": "影之刃零",
        "published_at": "2026-08-09T19:15:00+08:00",
        "status": "published"
    },
    {
        "title": "金山系变局：《尘白禁区》发行制作人离职，西山居收缩非战略项目",
        "summary": "据脉脉公开信息与媒体报道，《尘白禁区》发行制作人林增鸿（网名\"木木\"）已于2026年6月从西山居离职，结束五年八个月任职。与此同时，成都西山居传出组织架构调整，金山软件2025年游戏业务收入同比下滑28%、2026年一季度继续下滑22%，CEO邹涛表示将对非战略性项目进行收缩。",
        "content": "## 🏯 金山的\"加减法\"\n\n8 月 9 日，竞核 HOT 周报披露了一组关于金山系游戏业务的关键信号。\n\n### 人事与组织双线变动\n\n- 《尘白禁区》发行制作人林增鸿（网名\"木木\"）已于 **2026 年 6 月**从西山居离职，结束了五年八个月的任职，全程参与《尘白禁区》从立项到爆发的周期\n- 成都西山居传出**组织架构调整**消息\n- 金山 CEO 邹涛在财报会上明确表示，将对**非战略性项目进行收缩**\n\n### 数据背后的压力\n\n财报显示，金山软件 2025 年全年游戏业务收入**同比下降 28%**，2026 年一季度**继续下滑 22%**。而《尘白禁区》本身也经历波折：2026 年 3 月因内容争议宣布无限期停服，66 天后于 5 月 8 日重新开服，部分角色皮肤与互动内容被迫整改；据第三方估算，游戏 2026 年 7 月全球移动端收入已不足 5000 美元。\n\n### 这与《星砂岛》是什么关系\n\n把这条线和 8 月 18 日上线的《星砂岛》放在一起看，金山的\"加减法\"逻辑就清晰了：收缩争议与亏损项目，把投资与资源倾斜到差异化、有口碑基础的垂类新品（如中式田园模拟《星砂岛》）。在游戏业务整体承压的背景下，这种\"断尾 + 补位\"的组合拳，是传统大厂面对增长瓶颈时的典型反应——只不过这一次，动作更果断。",
        "source": "网易 / 竞核 / 脉脉 / 金山财报",
        "credibility": "confirmed",
        "game_name": "尘白禁区",
        "published_at": "2026-08-09T19:20:00+08:00",
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
