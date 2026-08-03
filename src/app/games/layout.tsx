import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏库 · 国产3A游戏大全 黑神话悟空 影之刃零 归唐 湮灭之潮 · 国游爆料",
  description: "国游爆料游戏库收录黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A大作。支持按开发商、类型、状态筛选，提供发售日期、配置要求、评分、玩家评论与最新动态一站式查询。",
  alternates: { canonical: "/games/" },
  openGraph: {
    title: "游戏库 · 国产3A游戏大全 黑神话悟空 影之刃零 归唐 湮灭之潮 · 国游爆料",
    description: "国游爆料游戏库收录黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A大作。支持按开发商、类型、状态筛选，提供发售日期、配置要求、评分、玩家评论与最新动态一站式查询。",
    url: "https://news.guoyouwenduji.cc/games/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游戏库 · 国产3A游戏大全 黑神话悟空 影之刃零 归唐 湮灭之潮 · 国游爆料",
    description: "国游爆料游戏库收录黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A大作。支持按开发商、类型、状态筛选，提供发售日期、配置要求、评分、玩家评论与最新动态一站式查询。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
