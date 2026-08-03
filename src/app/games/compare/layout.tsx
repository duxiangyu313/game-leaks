import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏对比 · 国产3A游戏参数配置画面对比评测 · 国游爆料",
  description: "国游爆料游戏对比工具，支持黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的全方位横向对比。比较开发商、发售日期、平台、配置要求、画质表现、评分等参数，帮助玩家选择最适合自己的国产大作。",
  alternates: { canonical: "/games/compare/" },
  openGraph: {
    title: "游戏对比 · 国产3A游戏参数配置画面对比评测 · 国游爆料",
    description: "国游爆料游戏对比工具，支持黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A游戏的全方位横向对比。比较开发商、发售日期、平台、配置要求、画质表现、评分等参数，帮助玩家选择最适合自己的国产大作。",
    url: "https://news.guoyouwenduji.cc/games/compare/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}