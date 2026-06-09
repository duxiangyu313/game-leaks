import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "玩家论坛",
  description: "国产3A游戏玩家社区 — 黑神话、影之刃零、归唐、湮灭之潮讨论区。攻略交流、爆料分享、组队交友。",
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
