import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "深度解析",
  description: "国产3A游戏深度分析文章 — 黑神话悟空、影之刃零、归唐、湮灭之潮的评测、前瞻与行业观察。",
};

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
