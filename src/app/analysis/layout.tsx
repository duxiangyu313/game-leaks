import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "深度解析",
  description: "国产3A游戏深度分析文章 — 黑神话悟空、影之刃零、归唐、湮灭之潮的评测、前瞻与行业观察。",
  alternates: { canonical: "/analysis/" },
  openGraph: {
    title: "深度解析 · 国游爆料",
    description: "国产3A游戏深度分析文章 — 黑神话悟空、影之刃零、归唐、湮灭之潮的评测、前瞻与行业观察。",
    url: "https://news.guoyouwenduji.cc/analysis/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "深度解析 · 国游爆料",
    description: "国产3A游戏深度分析文章 — 黑神话悟空、影之刃零、归唐、湮灭之潮的评测、前瞻与行业观察。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
