import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "国产3A游戏开发进度追踪 - 黑神话悟空/影之刃零/归唐/湮灭之潮",
  description: "国游爆料开发进度追踪，实时更新黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A大作的开发阶段、里程碑、实机演示、Beta测试与发售日期。提供可信度评分与来源追踪，让你掌握每款国产大作的最新进展。",
  alternates: { canonical: "/games/progress/" },
  openGraph: {
    title: "国产3A游戏开发进度追踪 - 黑神话悟空/影之刃零/归唐/湮灭之潮 · 国游爆料",
    description: "国游爆料开发进度追踪，实时更新黑神话悟空、影之刃零、归唐、湮灭之潮、燕云十六声等国产3A大作的开发阶段、里程碑、实机演示、Beta测试与发售日期。提供可信度评分与来源追踪，让你掌握每款国产大作的最新进展。",
    url: "https://news.guoyouwenduji.cc/games/progress/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}