import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏专区 · 国产3A游戏玩家讨论区 黑神话悟空 影之刃零",
  description: "国游爆料游戏专区论坛，聚焦黑神话悟空、影之刃零、归唐、湮灭之潮等国产3A大作的玩法攻略、剧情解析、角色培养与实机演示讨论。分享通关技巧、隐藏要素发现，与热爱国产游戏的玩家一起交流心得体验。",
  alternates: {
    canonical: "/forum/games/",
  },
};

export default function ForumGamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
