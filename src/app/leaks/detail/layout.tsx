import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "爆料详情 · 国产3A游戏最新传闻官方确认消息 · 国游爆料",
  description: "国游爆料爆料详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的最新传闻、开发者消息与官方确认爆料。",
  alternates: { canonical: "/leaks/detail/" },
  openGraph: {
    title: "爆料详情 · 国产3A游戏最新传闻官方确认消息 · 国游爆料",
    description: "国游爆料爆料详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的最新传闻、开发者消息与官方确认爆料。",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "article",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "爆料详情 · 国产3A游戏最新传闻官方确认消息 · 国游爆料",
    description: "国游爆料爆料详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的最新传闻、开发者消息与官方确认爆料。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: "游戏爆料,国产3A传闻,影之刃零爆料,归唐实机,黑神话DLC,独家爆料",
};

export default function LeakDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
