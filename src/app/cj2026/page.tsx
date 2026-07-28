"use client";

import { useEffect, useState } from "react";
import { supabase, db } from "@/lib/supabase/client";
import LinkNoPrefetch from "@/components/LinkNoPrefetch";
import Cj2026Paywall from "@/components/Cj2026Paywall";
import { getPrice, getEarlyBirdEnd } from "@/lib/cj2026-utils";
import { BreadcrumbListSchema } from "@/components/StructuredData";
import {
  Calendar, MapPin, ExternalLink, Clock, Gamepad2,
  ChevronRight, Play, Users, Monitor, Globe, Sparkles, Shield,
  Star, Zap, MessageCircle, TrendingUp, Timer
} from "lucide-react";

// ── CJ 倒计时 Hook（每秒刷新）──
function useCountdown(target: string) {
  const [remain, setRemain] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) return setRemain({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setRemain({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return remain;
}

// ── 参展游戏数据（7/24 更新：新增锦衣卫/猿公剑/坦克世界征程/奔奔王国等）──
const EXHIBITORS = [
  {
    title: "抵抗者",
    developer: "浩汤科技",
    booth: "N1-G201",
    highlight: "UE5抗日叙事FPS，融合谍战解谜与战术射击，首次公开线下试玩",
    tags: ["FPS", "抗日", "UE5", "首曝试玩"],
    color: "#E94560",
  },
  {
    title: "一盏秋声：锦衣卫",
    developer: "成都离忧",
    booth: "N1G001 索尼 / N1G102 顺网",
    highlight: "索尼中国之星第三期！明末谍战武侠ARPG，独创「推演」时间回溯系统",
    tags: ["武侠", "ARPG", "索尼中国之星", "首曝"],
    color: "#E94560",
  },
  {
    title: "猿公剑",
    developer: "剑猫熊网络 / 4Divinity",
    booth: "N1G102 顺网",
    highlight: "硬核仙侠ARPG！独创「避青入红」剑斗系统，15分钟限时BOSS挑战赛",
    tags: ["仙侠", "ARPG", "硬核", "试玩"],
    color: "#F59E0B",
  },
  {
    title: "颂钟长鸣",
    developer: "——",
    booth: "N1-G306",
    highlight: "中世纪开放世界生存建造，Steam愿望单Top50，CJ首次中国亮相",
    tags: ["生存", "开放世界", "中世纪"],
    color: "#F5A623",
  },
  {
    title: "坦克世界：征程",
    developer: "360游戏",
    booth: "N2-05",
    highlight: "全新载具射击端游首次线下试玩！融合特工技能与载具射击",
    tags: ["射击", "端游", "首曝试玩"],
    color: "#06B6D4",
  },
  {
    title: "奔奔王国",
    developer: "点点互动（世纪华通）",
    booth: "N4-01",
    highlight: "中世纪生存+塔防策略，微信小游戏畅销榜前十，CJ首秀",
    tags: ["策略", "生存", "模拟经营"],
    color: "#10B981",
  },
  {
    title: "无尽冬日",
    developer: "点点互动（世纪华通）",
    booth: "N4-01",
    highlight: "冰雪生存题材连续三年参展，iOS畅销榜常客，极寒沉浸式体验",
    tags: ["生存", "策略", "模拟经营"],
    color: "#22D3EE",
  },
  {
    title: "影之刃零",
    developer: "灵游坊",
    booth: "PlayStation 展台",
    highlight: "7/23刚获批版号！第二款国产买断制3A，10/29全球发售，PS展台可试玩",
    tags: ["动作", "3A", "黑暗武侠", "已获版号"],
    color: "#F59E0B",
  },
  {
    title: "湮灭之潮",
    developer: "日蚀边缘工作室",
    booth: "——",
    highlight: "腾讯旗下骑士幻想ARPG，成都试玩报名已截止，CJ或公布科隆展新情报",
    tags: ["动作RPG", "3A", "UE5"],
    color: "#10B981",
  },
  {
    title: "归唐",
    developer: "网易雷火·临安24工作室",
    booth: "——",
    highlight: "晚唐归义军题材，19分钟实机Demo获数毛社盛赞，CJ或开放新试玩",
    tags: ["动作RPG", "唐代", "3A"],
    color: "#E94560",
  },
  {
    title: "古剑",
    developer: "上海烛龙",
    booth: "——",
    highlight: "UE5中式志怪ARPG，7月试玩会冲上热搜，IGN评价「比想象中更能打」",
    tags: ["RPG", "UE5", "国风", "试玩会热议"],
    color: "#22D3EE",
  },
  {
    title: "黑神话：钟馗",
    developer: "游戏科学",
    booth: "——",
    highlight: "游戏科学续作，主角用剑+生死主题+画质超越悟空，或有新情报披露",
    tags: ["动作RPG", "3A", "神话"],
    color: "#F5A623",
  },
  {
    title: "异环",
    developer: "完美世界",
    booth: "完美世界展台",
    highlight: "自研二次元都市题材，1.2版本刚上线，CJ提供线下实机试玩",
    tags: ["二次元", "都市", "开放世界"],
    color: "#8B5CF6",
  },
  {
    title: "九阴真经 UE5",
    developer: "蜗牛游戏",
    booth: "蜗牛展台",
    highlight: "修仙UE5开放世界双新作CJ首曝，经典IP次世代重生",
    tags: ["修仙", "UE5", "开放世界", "首曝"],
    color: "#8B5CF6",
  },
  {
    title: "朝夕光年 12款",
    developer: "朝夕光年",
    booth: "朝夕光年展台",
    highlight: "携12款游戏强势参展，涵盖动作、射击、二次元等多个品类",
    tags: ["多品类", "动作", "射击", "二次元"],
    color: "#06B6D4",
  },
  {
    title: "古神：风里希",
    developer: "待公布",
    booth: "N1-G102 顺网",
    highlight: "中国原创神话ARPG首曝！刑天BOSS限时挑战+真人女主cos+限量手办",
    tags: ["神话", "ARPG", "首曝试玩", "UE5"],
    color: "#E94560",
  },
  {
    title: "名将杀",
    developer: "巨人网络",
    booth: "巨人展台",
    highlight: "巨人网络全新力作确认参展，具体玩法类型待CJ现场揭晓",
    tags: ["新作", "首曝"],
    color: "#8B5CF6",
  },
  {
    title: "代号：对决",
    developer: "朝夕光年",
    booth: "N3-08",
    highlight: "MOBA+射击新作，经历两轮海外测试，5V5策略射击首次国内试玩",
    tags: ["MOBA", "射击", "首曝试玩"],
    color: "#06B6D4",
  },
  {
    title: "雾影猎人",
    developer: "咪咕游戏",
    booth: "N4-05",
    highlight: "PC新作7/30抢先上线，CJ首秀试玩+JDG无畏空降",
    tags: ["PC", "射击", "首曝"],
    color: "#22D3EE",
  },
  {
    title: "网易六大IP",
    developer: "网易游戏",
    booth: "网易展台",
    highlight: "30余款精品参展，遗忘之海+诡影藏锋+燕云十六声等六大IP独立沉浸体验区",
    tags: ["多品类", "3A", "MMO"],
    color: "#E94560",
  },
  {
    title: "腾讯游戏",
    developer: "腾讯",
    booth: "腾讯展台",
    highlight: "王者/和平/三角洲/无畏契约等全线出击，多款AI工具首次开放体验",
    tags: ["多品类", "电竞", "AI"],
    color: "#06B6D4",
  },
  {
    title: "88款独立游戏",
    developer: "独立开发者",
    booth: "独立游戏专区",
    highlight: "国产独立游戏专区，88款作品涵盖Roguelike、解谜、叙事等多个类型",
    tags: ["独立游戏", "多品类"],
    color: "#10B981",
  },
];

// ── 4天日程（7/24 更新：增加具体参展商活动）──
const SCHEDULE = [
  {
    day: "7/31 周四",
    label: "开幕日 · 媒体日",
    events: [
      "09:00 正式开幕，近900企业参展",
      "10:00 E6主舞台 IMC英特尔大师挑战赛",
      "11:00 抵抗者 N1-G201 首次公开试玩",
      "11:00 古神风里希 N1-G102 首曝试玩",
      "锦衣卫 N1G001 索尼展台试玩",
      "影之刃零 PlayStation展台试玩",
      "猿公剑 N1G102 限时BOSS挑战赛",
      "坦克世界征程 N2-05 首曝试玩",
      "OrangeHill社团《燕云十六声》舞台剧",
    ],
    color: "#E94560",
  },
  {
    day: "8/1 周五",
    label: "公众日 Day 1",
    events: [
      "全面对公众开放",
      "360《坦克世界征程》制作人见面会",
      "影之刃零 PlayStation 展台试玩",
      "独立游戏专区 88款最热闹一天",
      "奔奔王国 & 无尽冬日 N4-01 体验",
      "各大厂商舞台活动集中爆发",
    ],
    color: "#F5A623",
  },
  {
    day: "8/2 周六",
    label: "公众日 Day 2 · 高峰日",
    events: [
      "周末高峰，预计到场人数最多",
      "Cosplay大赛总决赛",
      "异环 完美世界展台试玩",
      "朝夕光年 12款游戏集中体验",
      "周边商品限时发售",
    ],
    color: "#06B6D4",
  },
  {
    day: "8/3 周日",
    label: "闭幕日",
    events: [
      "最后一天，部分展台提前收摊",
      "CJ颁奖典礼",
      "17:00 正式闭幕",
      "建议上午到场，下午撤展",
    ],
    color: "#8B5CF6",
  },
];

// ── B站视频数据 ──
const BILIBILI_VIDEOS = [
  {
    bvid: "BV1dTEu6PE5d",
    title: "国产3A参展阵容前瞻 · CJ2026",
    desc: "抵抗者、锦衣卫、猿公剑、坦克世界征程...国产PC/主机阵容史上最强，16款重点游戏一览",
    live: false,
  },
  {
    bvid: null,
    title: "CJ 2026 现场 Vlog Day1 · 7/31 上线",
    desc: "开幕日第一时间探馆！N1-N4馆全覆盖，国产3A试玩体验+现场氛围，关注 @国游温度计 获取推送",
    live: true,
  },
];

// ── B站视频卡片 ──
function BilibiliCard({ bvid, title, desc, live }: { bvid: string | null; title: string; desc: string; live: boolean }) {
  return (
    <a
      href={bvid ? `https://www.bilibili.com/video/${bvid}` : "https://space.bilibili.com/3546857156380947"}
      target="_blank"
      rel="noopener noreferrer"
      className="block glass-card overflow-hidden hover:border-[rgba(245,166,35,0.3)] transition-all group"
    >
      <div className="aspect-video bg-[#1E293B]/60 flex items-center justify-center relative">
        {bvid ? (
          <img
            src={`https://api.injahow.cn/bilibili/v2/Cover/${bvid}?s=1`}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-center">
            <Play className="w-12 h-12 text-[#F5A623] mx-auto mb-2 animate-pulse" />
            <span className="text-sm text-[#94A3B8]">即将上线</span>
          </div>
        )}
        {bvid && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-14 h-14 text-white fill-white" />
          </div>
        )}
        {live && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#E94560] text-white text-xs rounded-full font-bold animate-pulse">
            LIVE
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-[#F1F5F9] mb-1 group-hover:text-[#F5A623] transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-[#64748B] line-clamp-2">{desc}</p>
      </div>
    </a>
  );
}

// ── 主页面 ──
export default function Cj2026Page() {
  const countdown = useCountdown("2026-07-31T09:00:00+08:00");
  const earlyBirdEnd = getEarlyBirdEnd();
  const earlyBirdCountdown = useCountdown(earlyBirdEnd.toISOString());
  const [leaks, setLeaks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyerCount, setBuyerCount] = useState(0);
  const [recentBuyers, setRecentBuyers] = useState<string[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const price = getPrice();

  // 拉取 CJ 相关爆料
  useEffect(() => {
    supabase
      .from("leaks")
      .select("*")
      .or("title.ilike.%CJ%,title.ilike.%ChinaJoy%,title.ilike.%chinajoy%,title.ilike.%试玩%,title.ilike.%参展%")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setLeaks(data || []);
        setLoading(false);
      });

    // 拉取购买人数 + 最近购买
    db
      .from("cj2026_purchases")
      .select("email, created_at")
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: Array<{ email: string; created_at: string }> | null }) => {
        if (data) {
          setBuyerCount(data.length);
          setRecentBuyers(
            data.slice(0, 5).map((r: { email: string }) =>
              r.email ? `${r.email.slice(0, 3)}****` : "匿名用户"
            )
          );
        }
      });

    // 拉取评分数据
    db
      .from("cj2026_ratings")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }: { data: any[] | null }) => {
        setRatings(data || []);
      });
  }, []);

  const isLive = countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;

  return (
    <div className="pt-20 pb-20">
      <BreadcrumbListSchema items={[
        { name: "首页", url: "https://news.guoyouwenduji.cc/" },
        { name: "ChinaJoy 2026", url: "https://news.guoyouwenduji.cc/cj2026/" },
      ]} />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E94560]/10 via-[#1A1A2E] to-[#06B6D4]/5" />
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E94560]/15 border border-[#E94560]/20 text-[#E94560] text-sm font-semibold mb-6">
            <MapPin className="w-4 h-4" /> 上海新国际博览中心 · 7/31 - 8/3
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#F1F5F9] mb-4 leading-tight">
            ChinaJoy 2026
          </h1>
          <p className="text-xl md:text-2xl text-[#F5A623] font-bold mb-2">
            国产3A 试玩指南
          </p>
          <p className="text-[#94A3B8] max-w-xl mx-auto mb-8 text-sm md:text-base">
            近900家企业超1000款游戏 · 主题"与AI同游"
          </p>

          {/* 倒计时 */}
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
            {isLive ? (
              <div className="text-3xl md:text-5xl font-black text-[#E94560] animate-pulse">
                🔴 正在直播！
              </div>
            ) : (
              <>
                <CountBlock num={countdown.days} label="天" />
                <CountSep />
                <CountBlock num={countdown.hours} label="时" />
                <CountSep />
                <CountBlock num={countdown.minutes} label="分" />
                <CountSep />
                <CountBlock num={countdown.seconds} label="秒" pulse />
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#exhibitors"
              className="px-6 py-3 bg-[#E94560] text-white text-sm font-semibold rounded-xl hover:bg-[#C33550] transition-all flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" /> 查看参展阵容
            </a>
            <a
              href="https://space.bilibili.com/3546857156380947"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm font-semibold rounded-xl hover:border-[#F5A623]/30 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> B站看现场
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 space-y-20">
        {/* ═══════════ 云逛展陪伴团 · 付费转化卡 ═══════════ */}
        <section id="cj2026-payment">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1A2E] via-[#0F172A] to-[#1A1A2E] border border-[#F5A623]/20 shadow-[0_0_60px_rgba(245,166,35,0.05)]">
            {/* 装饰光晕 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E94560]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0">
              {/* 左：权益信息 */}
              <div className="lg:col-span-3 p-8 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/20 text-[#F5A623] text-xs font-semibold mb-4 w-fit">
                  <Sparkles className="w-3.5 h-3.5" /> 云逛展陪伴团
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-[#F1F5F9] mb-3 leading-tight">
                  去不了现场？<br />
                  <span className="text-[#F5A623]">我们帮你看。</span>
                </h2>
                <p className="text-[#94A3B8] mb-6 max-w-lg">
                  4天每日速递 + 读者群 + 总结报告，¥{price.amount} 搞定 CJ2026 所有重点
                </p>

                {/* 权益说明 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1E293B]/30">
                    <Zap className="w-5 h-5 text-[#06B6D4] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#F1F5F9]">4天每日速递</p>
                      <p className="text-xs text-[#64748B]">当天重点提炼，不再信息焦虑</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1E293B]/30">
                    <MessageCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#F1F5F9]">读者群</p>
                      <p className="text-xs text-[#64748B]">和同好聊 CJ，一起云逛展</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1E293B]/30">
                    <Shield className="w-5 h-5 text-[#8B5CF6] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#F1F5F9]">一次购买，永不过期</p>
                      <p className="text-xs text-[#64748B]">CJ 后可随时回看</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#1E293B]/30 border border-[#10B981]/20 bg-[#10B981]/5">
                    <Star className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#10B981]">16款游戏评分表</p>
                      <p className="text-xs text-[#64748B]">免费查看 · 无需购买</p>
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                {buyerCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-4">
                    <Users className="w-4 h-4 text-[#F5A623]" />
                    <span>已有 <strong className="text-[#F5A623]">{buyerCount}</strong> 人加入</span>
                    {recentBuyers.length > 0 && (
                      <span className="text-[#64748B]">
                        · {recentBuyers[0]} 刚刚加入
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 右：价格 + 购买 */}
              <div className="lg:col-span-2 p-8 md:p-10 flex flex-col items-center justify-center bg-[#0F172A]/60 border-t lg:border-t-0 lg:border-l border-[rgba(245,166,35,0.1)]">
                {/* 价格展示 */}
                <div className="text-center mb-2">
                  {price.isEarlyBird && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E94560]/15 text-[#E94560] text-[10px] font-bold rounded-full mb-3">
                      <Timer className="w-3 h-3" /> 早鸟特惠
                    </div>
                  )}
                </div>
                <div className="text-center mb-2">
                  <span className="text-5xl md:text-6xl font-black text-[#F1F5F9]">¥{price.amount}</span>
                  {price.isEarlyBird && (
                    <span className="text-sm text-[#64748B] line-through ml-2">¥19.9</span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mb-4">{price.label}</p>

                {/* 早鸟倒计时 */}
                {price.isEarlyBird && (
                  <div className="flex items-center gap-1.5 mb-4 text-xs">
                    <span className="text-[#E94560]">早鸟截止</span>
                    <span className="text-[#F1F5F9] font-mono font-bold">
                      {String(earlyBirdCountdown.days).padStart(2, "0")}天
                      {String(earlyBirdCountdown.hours).padStart(2, "0")}时
                      {String(earlyBirdCountdown.minutes).padStart(2, "0")}分
                      {String(earlyBirdCountdown.seconds).padStart(2, "0")}秒
                    </span>
                  </div>
                )}

                {/* 购买按钮 */}
                <div className="w-full space-y-3">
                  <LinkNoPrefetch
                    href="/cj2026/pay/"
                    className="block w-full py-3.5 bg-gradient-to-r from-[#F5A623] to-[#F59E0B] text-[#0F172A] text-base font-bold rounded-xl hover:shadow-[0_0_25px_rgba(245,166,35,0.4)] transition-all text-center"
                  >
                    立即购买
                  </LinkNoPrefetch>
                </div>

                <p className="text-[10px] text-[#475569] mt-3 text-center">
                  支持微信支付 · 支付宝 · 一次购买永不过期
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ B站联动区 ═══════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">
                <Play className="w-5 h-5 inline text-[#E94560] mr-2" />
                B站视频报道
              </h2>
              <p className="text-sm text-[#64748B] mt-1">CJ 相关视频 · 持续更新中</p>
            </div>
            <a
              href="https://space.bilibili.com/3546857156380947"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#F5A623] hover:underline"
            >
              关注 @国游温度计 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BILIBILI_VIDEOS.map((v, i) => (
              <BilibiliCard key={i} {...v} />
            ))}
          </div>
        </section>

        {/* ═══════════ 参展阵容 ═══════════ */}
        <section id="exhibitors">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">
              <Gamepad2 className="w-5 h-5 inline text-[#F5A623] mr-2" />
              国产3A 参展阵容
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              以下为已确认参展的国产PC/主机游戏 · 共 {EXHIBITORS.length} 款
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXHIBITORS.map((g, i) => (
              <div
                key={i}
                className="glass-card p-5 hover:border-[rgba(245,166,35,0.2)] transition-all group"
              >
                {/* 顶部色条 */}
                <div
                  className="h-1 rounded-full mb-4 w-12"
                  style={{ backgroundColor: g.color }}
                />
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-[#F1F5F9] group-hover:text-[#F5A623] transition-colors">
                    {g.title}
                  </h3>
                  {g.booth !== "——" && (
                    <span className="shrink-0 px-2 py-0.5 bg-[#1E293B]/60 text-[#F5A623] text-xs rounded font-mono border border-[#F5A623]/15">
                      {g.booth}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mb-2">{g.developer}</p>
                <p className="text-sm text-[#94A3B8] mb-3 leading-relaxed">{g.highlight}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.tags.map((t, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-[#1E293B]/40 text-[#64748B] text-xs rounded border border-[rgba(30,41,59,0.4)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 4天日程 ═══════════ */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">
              <Calendar className="w-5 h-5 inline text-[#06B6D4] mr-2" />
              每日看点
            </h2>
            <p className="text-sm text-[#64748B] mt-1">4天日程 · 关键活动时间节点</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SCHEDULE.map((d, i) => (
              <div key={i} className="glass-card p-5">
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4"
                  style={{ backgroundColor: d.color }}
                >
                  {d.day}
                </div>
                <p className="text-sm text-[#94A3B8] mb-3">{d.label}</p>
                <ul className="space-y-2">
                  {d.events.map((e, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ 相关爆料 ═══════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">📰 最新动态</h2>
              <p className="text-sm text-[#64748B] mt-1">CJ 相关爆料实时更新</p>
            </div>
            <LinkNoPrefetch href="/leaks" className="text-sm text-[#06B6D4] hover:underline flex items-center gap-1">
              全部爆料 <ChevronRight className="w-4 h-4" />
            </LinkNoPrefetch>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="h-5 w-3/4 bg-[#1E293B]/30 rounded mb-3" />
                  <div className="h-4 w-full bg-[#1E293B]/30 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-[#1E293B]/30 rounded" />
                </div>
              ))}
            </div>
          ) : leaks.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <p>CJ 相关爆料将在开展前陆续更新，请关注本页面</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaks.map((l: any) => (
                <LinkNoPrefetch
                  key={l.id}
                  href={`/leaks/detail/?id=${l.id}`}
                  className="glass-card p-5 hover:border-[rgba(245,166,35,0.15)] transition-all"
                >
                  <h3 className="text-sm font-bold text-[#F1F5F9] mb-1.5 line-clamp-2 hover:text-[#F5A623] transition-colors">
                    {l.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-2">{l.summary}</p>
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <Clock className="w-3 h-3" />
                    {l.published_at ? new Date(l.published_at).toLocaleDateString("zh-CN") : ""}
                    {l.credibility === "confirmed" && (
                      <span className="px-1.5 py-0.5 bg-[#10B981]/15 text-[#10B981] text-xs rounded">已确认</span>
                    )}
                  </div>
                </LinkNoPrefetch>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════ 免费：16款游戏评分表 ═══════════ */}
        <section id="ratings" className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">
              <Star className="w-5 h-5 inline text-[#F5A623] mr-2" />
              16款游戏深度评分
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              画面 · 玩法 · 创新 · 完成度 · 期待值 五维评测 · 免费查看 · 综合均分
            </p>
          </div>

          <div className="glass-card p-6">
            {/* 评分标准说明 */}
            <div className="mb-5 p-4 rounded-xl bg-[#1E293B]/30 border border-[rgba(245,166,35,0.1)]">
              <p className="text-xs font-bold text-[#F5A623] mb-2">📐 评分标准</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] text-[#94A3B8]">
                <div><span className="text-[#F1F5F9]">画面</span>：美术风格·光影渲染·场景细节</div>
                <div><span className="text-[#F1F5F9]">玩法</span>：操作手感·战斗系统·可玩深度</div>
                <div><span className="text-[#F1F5F9]">创新</span>：题材突破·机制创新·叙事手法</div>
                <div><span className="text-[#F1F5F9]">完成度</span>：优化状态·体量·打磨程度</div>
                <div><span className="text-[#F1F5F9]">期待值</span>：热度·口碑·行业意义</div>
              </div>
              <div className="flex gap-3 mt-2 text-[10px]">
                <span className="text-[#10B981]">9-10 标杆级</span>
                <span className="text-[#F5A623]">7-8 优秀</span>
                <span className="text-[#64748B]">5-6 合格</span>
                <span className="text-[#E94560]">1-4 缺陷</span>
              </div>
            </div>

            {/* 评分排行榜 */}
            <div className="space-y-2">
              {ratings.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-4">评分数据加载中...</p>
              ) : (
                ratings.filter((r: any) => r.recommendation === 'must_play').map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl bg-[#1E293B]/20 border border-[#F5A623]/20 hover:border-[#F5A623]/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F1F5F9]">{r.game_name}</span>
                        <span className="px-1.5 py-0.5 bg-[#E94560]/15 text-[#E94560] text-[10px] rounded font-bold">必玩</span>
                      </div>
                      <span className="text-lg font-black text-[#F5A623]">{r.overall_score}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-[#64748B] mb-2">
                      <span>画面 {r.graphics}</span><span>玩法 {r.gameplay}</span><span>创新 {r.innovation}</span><span>完成度 {r.completeness}</span><span>期待 {r.hype}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{r.summary}</p>
                  </div>
                ))
              )}
              {ratings.filter((r: any) => r.recommendation === 'worth_playing').slice(0, 5).map((r: any) => (
                <div key={r.id} className="p-3 rounded-xl bg-[#1E293B]/20 border border-[rgba(30,41,59,0.4)] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#F1F5F9]">{r.game_name}</span>
                    <span className="ml-2 px-1 py-0.5 bg-[#F5A623]/10 text-[#F5A623] text-[9px] rounded">值得玩</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#64748B]">{r.summary?.slice(0, 40)}...</span>
                    <span className="text-sm font-bold text-[#F5A623]">{r.overall_score}</span>
                  </div>
                </div>
              ))}
              {ratings.filter((r: any) => r.recommendation === 'wait_and_see').length > 0 && (
                <details className="mt-2">
                  <summary className="text-[10px] text-[#64748B] cursor-pointer hover:text-[#94A3B8]">
                    展开剩余 {ratings.filter((r: any) => r.recommendation === 'wait_and_see').length} 款「观望」游戏
                  </summary>
                  <div className="space-y-1 mt-2">
                    {ratings.filter((r: any) => r.recommendation === 'wait_and_see').map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-1.5 rounded bg-[#1E293B]/10 text-xs">
                        <span className="text-[#94A3B8]">{r.game_name}</span>
                        <span className="text-[#64748B]">{r.overall_score}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
            <p className="text-[10px] text-[#475569] mt-4 text-center">
              评分依据已公开实机/试玩反馈/媒体评测 · CJ期间根据现场体验实时更新
            </p>
          </div>
        </section>

        {/* ═══════════ 付费：每日速递 + 读者群 ═══════════ */}
        <Cj2026Paywall onUnlock={() => {
          const el = document.getElementById("cj2026-payment");
          el?.scrollIntoView({ behavior: "smooth" });
        }}>
          <section id="premium-content">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#F1F5F9] heading-glow">
                <Sparkles className="w-5 h-5 inline text-[#F5A623] mr-2" />
                云逛展陪伴团 · 专属内容
              </h2>
              <p className="text-sm text-[#64748B] mt-1">4天每日速递 · 读者群 · 总结报告</p>
            </div>

            <div className="space-y-8">
              {/* 每日速递入口 */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#06B6D4]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#F1F5F9]">4天每日速递</h3>
                    <p className="text-xs text-[#64748B]">每日重点提炼，不再信息焦虑</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { day: 1, date: "7/31", label: "开幕日" },
                    { day: 2, date: "8/1", label: "公众日" },
                    { day: 3, date: "8/2", label: "高峰日" },
                    { day: 4, date: "8/3", label: "闭幕日" },
                  ].map((d) => {
                    const now = new Date();
                    const publishDate = new Date(`2026-08-0${d.day}T09:00:00+08:00`);
                    const isAvailable = now >= publishDate;
                    return (
                      <LinkNoPrefetch
                        key={d.day}
                        href={`/cj2026/day/?d=${d.day}`}
                        className={`p-4 rounded-xl border transition-all text-center ${
                          isAvailable
                            ? "bg-[#1E293B]/20 border-[rgba(245,166,35,0.2)] hover:border-[#F5A623]/40"
                            : "bg-[#1E293B]/10 border-[rgba(30,41,59,0.3)] opacity-60"
                        }`}
                      >
                        <div className="text-lg font-black text-[#F1F5F9]">Day {d.day}</div>
                        <div className="text-xs text-[#64748B]">{d.date}</div>
                        <div className="text-[10px] text-[#475569] mt-1">{d.label}</div>
                        {isAvailable ? (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] text-[10px] rounded-full">
                            已发布
                          </span>
                        ) : (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-[#F5A623]/15 text-[#F5A623] text-[10px] rounded-full">
                            待发布
                          </span>
                        )}
                      </LinkNoPrefetch>
                    );
                  })}
                </div>
              </div>

              {/* 区块3：读者群 */}
              <div className="glass-card p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-5 h-5 text-[#10B981]" />
                </div>
                <h3 className="text-lg font-bold text-[#F1F5F9] mb-2">加入读者群</h3>
                <p className="text-sm text-[#94A3B8] mb-4">
                  和同好一起聊 CJ，第一时间获取最新速递推送
                </p>
                <div className="w-48 h-48 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-[#10B981]/30">
                  <img
                    src="/cj2026/wechat-group-qrcode.jpg"
                    alt="微信群二维码"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-[#475569]">
                  满 200 人后可联系客服手动邀请
                </p>
              </div>
            </div>
          </section>
        </Cj2026Paywall>

        {/* ═══════════ 底部 CTA ═══════════ */}
        <section className="text-center py-12 glass-card px-6">
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-3">
            关注 CJ 2026 全程报道
          </h2>
          <p className="text-[#94A3B8] mb-6 max-w-md mx-auto">
            7/31-8/3 上海新国际博览中心 · 国产3A最强参展阵容 · 第一时间现场速报
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://space.bilibili.com/3546857156380947"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#E94560] text-white text-sm font-semibold rounded-xl hover:bg-[#C33550] transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> B站 @国游温度计
            </a>
            <LinkNoPrefetch
              href="/games"
              className="px-6 py-3 bg-[#1E293B] border border-[rgba(30,41,59,0.8)] text-[#F1F5F9] text-sm font-semibold rounded-xl hover:border-[#F5A623]/30 transition-all flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" /> 浏览游戏库
            </LinkNoPrefetch>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── 小助手 ──
function CountBlock({ num, label, pulse }: { num: number; label: string; pulse?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-4xl md:text-6xl font-black text-[#F1F5F9] tabular-nums bg-[#1E293B]/40 rounded-2xl px-4 py-3 border border-[rgba(30,41,59,0.6)] min-w-[80px] ${pulse ? "text-[#E94560] border-[#E94560]/30 shadow-[0_0_12px_rgba(233,69,96,0.15)]" : ""}`}>
        {String(num).padStart(2, "0")}
      </div>
      <div className="text-xs text-[#64748B] mt-1">{label}</div>
    </div>
  );
}

function CountSep() {
  return <span className="text-3xl md:text-4xl text-[#475569] font-light mt-[-1.5rem]">:</span>;
}
