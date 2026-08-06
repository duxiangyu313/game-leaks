import type { Metadata } from "next";
import SEOPreloadScript from "@/components/SEOPreloadScript";

export const metadata: Metadata = {
  title: "游戏详情 · 国产3A游戏介绍评测配置要求攻略预购 · 国游爆料",
  description: "国游爆料游戏详情页面，提供黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的详细介绍、专业评测、配置要求、发售日期、DLC信息、价格对比、玩家评论与最新动态，一站式了解每款国产大作的全部信息。",
  alternates: { canonical: "/games/detail/" },
  openGraph: {
    title: "游戏详情 · 国产3A游戏介绍评测配置攻略 · 国游爆料",
    description: "国游爆料游戏详情页面，提供黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的详细介绍、专业评测、配置要求、发售日期、DLC信息、价格对比、玩家评论与最新动态，一站式了解每款国产大作的全部信息。",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游戏详情 · 国产3A游戏介绍评测配置攻略 · 国游爆料",
    description: "国游爆料游戏详情页面，提供黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A游戏的详细介绍、专业评测、配置要求、发售日期、DLC信息、价格对比、玩家评论与最新动态，一站式了解每款国产大作的全部信息。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
  keywords: "国产3A游戏,黑神话悟空,影之刃零,归唐,湮灭之潮,燕云十六声,游戏评测,配置要求,发售日期",
};

export default function GameDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SEOPreloadScript />
      {children}
    </>
  );
}
