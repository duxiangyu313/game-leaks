import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏详情 · 国产3A游戏介绍评测配置攻略 · 国游爆料",
  description: "国游爆料游戏详情页面 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的详细介绍、评测、配置要求、发售日期、玩家评论与最新动态。",
  alternates: { canonical: "/games/detail/" },
  openGraph: {
    title: "游戏详情 · 国产3A游戏介绍评测配置攻略 · 国游爆料",
    description: "国游爆料游戏详情页面 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的详细介绍、评测、配置要求、发售日期、玩家评论与最新动态。",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游戏详情 · 国产3A游戏介绍评测配置攻略 · 国游爆料",
    description: "国游爆料游戏详情页面 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的详细介绍、评测、配置要求、发售日期、玩家评论与最新动态。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: "国产3A游戏,黑神话悟空,影之刃零,归唐,湮灭之潮,燕云十六声,游戏评测,配置要求,发售日期",
};

export default function GameDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
