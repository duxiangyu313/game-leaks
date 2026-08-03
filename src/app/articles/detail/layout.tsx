import type { Metadata } from "next";
import SEOPreloadScript from "@/components/SEOPreloadScript";

export const metadata: Metadata = {
  title: "文章详情 · 国产3A游戏深度解析评测爆料",
  description: "国游爆料文章详情，黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的深度解析、评测、爆料与行业观察。专业视角分析国产游戏开发趋势、技术突破与市场表现，做有温度的国产游戏观察者。",
  alternates: { canonical: "/articles/detail/" },
  openGraph: {
    title: "文章详情 · 国产3A游戏深度解析评测爆料 · 国游爆料",
    description: "国游爆料文章详情，黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的深度解析、评测、爆料与行业观察。专业视角分析国产游戏开发趋势、技术突破与市场表现，做有温度的国产游戏观察者。",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "article",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "文章详情 · 国产3A游戏深度解析评测爆料 · 国游爆料",
    description: "国游爆料文章详情，黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声、百面千相等国产3A游戏的深度解析、评测、爆料与行业观察。专业视角分析国产游戏开发趋势、技术突破与市场表现，做有温度的国产游戏观察者。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: "国产3A游戏,深度解析,游戏评测,游戏爆料,黑神话,影之刃零,归唐,湮灭之潮",
};

export default function ArticleDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SEOPreloadScript />
      {children}
    </>
  );
}
