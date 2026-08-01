import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏对比",
  description: "国产3A游戏对比 — 黑神话悟空 vs 影之刃零、归唐 vs 湮灭之潮，参数、特色、画质全维度横向对比。",
  alternates: { canonical: "/games/compare/" },
  openGraph: {
    title: "游戏对比 · 国游爆料",
    description: "国产3A游戏全维度横向对比 — 参数、特色、画质一网打尽。",
    url: "https://news.guoyouwenduji.cc/games/compare/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}