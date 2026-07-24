import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏库",
  description: "国产3A游戏大全 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作数据库。搜索、对比、追踪开发进度。",
  alternates: { canonical: "/games/" },
  openGraph: {
    title: "游戏库 · 国游爆料",
    description: "国产3A游戏大全 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作数据库。搜索、对比、追踪开发进度。",
    url: "https://news.guoyouwenduji.cc/games/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://news.guoyouwenduji.cc/og-image.png", width: 1200, height: 630, alt: "国游爆料" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游戏库 · 国游爆料",
    description: "国产3A游戏大全 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作数据库。搜索、对比、追踪开发进度。",
    images: ["https://news.guoyouwenduji.cc/og-image.png"],
  },
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
