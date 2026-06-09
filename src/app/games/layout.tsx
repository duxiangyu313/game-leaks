import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏库",
  description: "国产3A游戏大全 — 黑神话悟空、影之刃零、归唐、湮灭之潮等国产大作数据库。搜索、对比、追踪开发进度。",
};

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
