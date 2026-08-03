import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "爆料专区 · 国产3A游戏传闻爆料交流区",
  description: "国游爆料专区论坛，汇聚最新国产3A游戏传闻、内部消息与玩家分析。理性讨论爆料可信度，追踪黑神话悟空、影之刃零、归唐、湮灭之潮等大作的开发进度、发售消息与独家情报。",
  alternates: {
    canonical: "/forum/leaks/",
  },
};

export default function ForumLeaksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
