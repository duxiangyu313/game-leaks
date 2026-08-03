import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "国产3A游戏日历 - 黑神话悟空/影之刃零/归唐发售日与展会时间",
  description: "国产3A游戏事件日历，汇聚黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作的预计发售日、公开测试与封测时间、官方直播发布会、大型游戏展会、开发者访谈活动、DLC与重要更新节点等关键时间，方便玩家提前规划关注、设置发售提醒并按时间范围快速筛选。",
  alternates: { canonical: "/calendar/" },
  openGraph: {
    title: "国产3A游戏日历 - 黑神话悟空/影之刃零/归唐发售日与展会时间 · 国游爆料",
    description: "国产3A游戏事件日历，汇聚黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作的预计发售日、公开测试与封测时间、官方直播发布会、大型游戏展会、开发者访谈活动、DLC与重要更新节点等关键时间，方便玩家提前规划关注、设置发售提醒并按时间范围快速筛选。",
    url: "https://news.guoyouwenduji.cc/calendar/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "国产3A游戏日历 - 黑神话悟空/影之刃零/归唐发售日与展会时间 · 国游爆料",
    description: "国产3A游戏事件日历，汇聚黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作的预计发售日、公开测试与封测时间、官方直播发布会、大型游戏展会、开发者访谈活动、DLC与重要更新节点等关键时间，方便玩家提前规划关注、设置发售提醒并按时间范围快速筛选。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
