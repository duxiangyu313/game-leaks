import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "开发进度追踪",
  description: "国产3A游戏开发进度追踪 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作最新开发动态、里程碑和发售日。",
  alternates: { canonical: "/games/progress/" },
  openGraph: {
    title: "开发进度追踪 · 国游爆料",
    description: "独家追踪国产3A游戏最新开发动态、里程碑和发售日。",
    url: "https://news.guoyouwenduji.cc/games/progress/",
    siteName: "国游爆料",
    locale: "zh_CN",
    type: "website",
  },
};

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}