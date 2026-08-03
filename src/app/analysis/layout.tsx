import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "深度解析 · 国产3A游戏深度分析评测前瞻与行业观察",
  description: "国游爆料深度解析专区，提供黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作的深度评测、前瞻分析、幕后爆料、行业观察、开发者访谈整理、开发幕后与玩家观点汇总，帮助你从玩法设计、叙事风格、技术表现、美术风格和市场定位等多维度全面理解国产游戏。",
  alternates: { canonical: "/analysis/" },
  openGraph: {
    title: "深度解析 · 国产3A游戏深度分析评测前瞻与行业观察 · 国游爆料",
    description: "国游爆料深度解析专区，提供黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作的深度评测、前瞻分析、幕后爆料、行业观察、开发者访谈整理、开发幕后与玩家观点汇总，帮助你从玩法设计、叙事风格、技术表现、美术风格和市场定位等多维度全面理解国产游戏。",
    url: "https://news.guoyouwenduji.cc/analysis/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "深度解析 · 国产3A游戏深度分析评测前瞻与行业观察 · 国游爆料",
    description: "国游爆料深度解析专区，提供黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作的深度评测、前瞻分析、幕后爆料、行业观察、开发者访谈整理、开发幕后与玩家观点汇总，帮助你从玩法设计、叙事风格、技术表现、美术风格和市场定位等多维度全面理解国产游戏。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
