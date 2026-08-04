import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "闲聊专区 · 国产3A游戏玩家轻松交流与日常分享",
  description: "国游爆料闲聊专区，国产3A游戏玩家轻松交流的天地。畅所欲言分享生活趣事、游戏日常、其他平台游戏推荐，与志同道合的玩家交朋友，享受轻松友好的社区氛围。",
  alternates: {
    canonical: "/forum/off-topic/",
  },
};

export default function ForumOffTopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
