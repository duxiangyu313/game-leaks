import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "国产3A游戏开发进度详情 - 黑神话悟空/影之刃零/归唐/湮灭之潮追踪",
  description: "国产3A游戏开发进度详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作最新开发阶段、可信度评分与发售日追踪。",
  alternates: { canonical: "/games/progress/detail/" },
  openGraph: {
    title: "国产3A游戏开发进度详情 - 黑神话悟空/影之刃零/归唐/湮灭之潮追踪 · 国游爆料",
    description: "国产3A游戏开发进度详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作最新开发阶段、可信度评分与发售日追踪。",
    url: "https://news.guoyouwenduji.cc/games/progress/detail/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "国产3A游戏开发进度详情 - 黑神话悟空/影之刃零/归唐/湮灭之潮追踪 · 国游爆料",
    description: "国产3A游戏开发进度详情 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作最新开发阶段、可信度评分与发售日追踪。",
  },
};

export default function GameProgressDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
